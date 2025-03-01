// Import the JSON data from the same folder
import { getData } from "./service";
export async function GET() {
  const response = await getData();
  return new Response(JSON.stringify(response), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
