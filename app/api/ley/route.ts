import { getData } from "./service";

export const dynamic = 'force-dynamic'
export const maxDuration = 60;

export async function GET() {
  const response = await getData();
  return new Response(JSON.stringify(response), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
