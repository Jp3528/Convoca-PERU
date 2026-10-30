import { publisherId } from "@/lib/portal-config";
export async function GET() {
  const client = publisherId();
  if (!client)
    return new Response("AdSense todavía no está configurado.\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  return new Response(
    "google.com, " + client.replace("ca-", "") + ", DIRECT, f08c47fec0942fa0\n",
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
