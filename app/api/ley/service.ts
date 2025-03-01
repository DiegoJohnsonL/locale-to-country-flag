import jsonData from "./data.json";
import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import { unstable_cache } from "next/cache";

const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

interface Ley {
  perParId: number;
  pleyNum: number;
  proyectoLey: string;
  desEstado: string;
  fecPresentacion: string;
  titulo: string;
  desProponente: string;
  autores: string;
  rowsTotal: number;
}

// TODO: Make it work on serverless deployment
// Function to fetch HTML content from a URL using Puppeteer
async function fetchHtml(url: string): Promise<string> {
  try {
    // Using puppeteer to handle client-side rendered pages and SSL issues
    const browser = await puppeteer.launch({
      args: isLocal ? puppeteer.defaultArgs() : chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath:
        process.env.CHROME_EXECUTABLE_PATH ||
        (await chromium.executablePath(
          "https://nbvizhbtxgtljz7i.public.blob.vercel-storage.com/chromium-v132.0.0-pack-jSz8hghChyCmKBdG58QtIxLP6y6K5i.tar"
        )),
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" }); // Wait until page is fully loaded

    // Wait for the content to be rendered (adjust selector as needed)
    await page.waitForSelector("body", { timeout: 10000 });

    // Extract only the body content using page.evaluate
    const bodyContent = await page.evaluate(() => {
      // Remove scripts from the DOM before getting innerHTML
      const scripts = document.querySelectorAll("script");
      scripts.forEach((script) => script.remove());

      // Remove styles from the DOM
      const styles = document.querySelectorAll("style");
      styles.forEach((style) => style.remove());

      // Get the body content
      return document.body.innerHTML;
    });

    await browser.close();
    return bodyContent;
  } catch (error) {
    console.error("Error fetching HTML with Puppeteer:", error);
    throw error;
  }
}

// Function to clean HTML by removing common noise elements
function cleanHtml(html: string): string {
  return (
    html
      // Remove comments
      .replace(/<!--[\s\S]*?-->/g, "")
      // Remove most inline styles
      .replace(/ style="[^"]*"/g, "")
      // Remove common CSS classes
      .replace(/ class="[^"]*"/g, "")
      // Remove data attributes
      .replace(/ data-[^=]*="[^"]*"/g, "")
      // Remove empty attributes
      .replace(/ [a-z-]+=""/g, "")
      // Remove any remaining script tags (in case they were added dynamically)
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Remove any remaining style tags
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      // Collapse multiple spaces
      .replace(/\s{2,}/g, " ")
      // Remove unnecessary line breaks
      .replace(/>\s+</g, "><")
  );
}

// Extract this function to be cached separately
// TODO: Improve the prompt to get more accurate with a lot less html noise
async function extractLawData(link: string, perParId: number, pleyNum: number) {
  // Step 1: Fetch the raw HTML from the website
  const rawHtml = await fetchHtml(link).catch((error) => {
    console.error("Error fetching HTML:", error);
    return "An error occurred while fetching the HTML";
  });

  // Step 1.5: Clean the HTML to remove basic noise
  const cleanedHtml = cleanHtml(rawHtml);
  console.log("cleanedHtml length:", cleanedHtml.length);

  // Step 2: Use AI to clean up the HTML and convert to markdown
  const { text: markdown } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: `Given the following HTML from a website, convert the content into well-formatted markdown. Focus on extracting meaningful information about the law project.
    
    HTML: ${cleanedHtml}`,
  });

  console.log("markdown", markdown);

  // Step 3: Extract structured data using generateObject
  // TODO: Test simpler prompts to see if we can get more accurate results
  const { object: summary } = await generateObject({
    model: openai("gpt-4o"),
    prompt: `Given the markdown extracted from the website ${link}, extract the summary of the law project and structure it into a json object with the following fields: id, numero, titulo, fechaPresentacion, periodo, legislatura, proponente, sumilla, autor, coautores, grupoParliamentario, estado, urlOriginal, urlPdf. 
      The markdown is: ${markdown}`,
    schema: z.object({
      numero: z.string(),
      titulo: z.string(),
      fechaPresentacion: z.string(),
      periodo: z.string(),
      legislatura: z.string(),
      proponente: z.string(),
      sumilla: z.string(),
      autor: z.string(),
      coautores: z.array(z.string()),
      grupoParliamentario: z.string(),
      estado: z.string(),
      urlOriginal: z.string(),
    }),
  });
  //TODO: Store extracted text from pdf of the law project
  console.log("summary", summary);
  return summary;
}

// Create a cached version of the extraction function
// TODO: Cache key per perParId and pleyNum instead of single key for all
const getCachedLawData = unstable_cache(
  async (link: string, perParId: number, pleyNum: number) => {
    return extractLawData(link, perParId, pleyNum);
  },
  // Cache key generator - use the URL as the unique key
  ["law-data"],
  {
    // Cache for 24 hours (in seconds)
    revalidate: 86400,
    tags: [`law-data`],
  }
);

export async function getData() {
  const data = jsonData as Ley[];
  const result = data.map(async (ley) => {
    const link = `https://wb2server.congreso.gob.pe/spley-portal/#/expediente/${ley.perParId}/${ley.pleyNum}`;
    // Use the cached function instead of inline processing
    return getCachedLawData(link, ley.perParId, ley.pleyNum);
  });

  const response = await Promise.all(result);
  return response;
}
