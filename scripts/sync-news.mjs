import { writeFile } from "node:fs/promises";

const apiOrigin = process.env.NEWS_API_URL?.replace(/\/$/, "");

if (!apiOrigin) {
  console.log("NEWS_API_URL is not set; using the committed news snapshot.");
  process.exit(0);
}

const response = await fetch(`${apiOrigin}/api/public/news?limit=1000&include_body=1`, {
  headers: { accept: "application/json" },
});

if (!response.ok) {
  throw new Error(`News sync failed: ${response.status} ${response.statusText}`);
}

const payload = await response.json();
if (!Array.isArray(payload.items)) {
  throw new Error("News sync failed: API response does not contain an items array");
}

const items = payload.items.map((item) => ({
  id: String(item.id),
  slug: String(item.slug),
  title: String(item.title),
  summary: String(item.summary || ""),
  category: String(item.category || "NEWS"),
  body_html: String(item.body_html || ""),
  body_json: String(item.body_json || "{}"),
  cover_image_url: String(item.cover_image_url || ""),
  published_at: String(item.published_at),
  updated_at: String(item.updated_at),
}));

await writeFile(
  new URL("../content/news.generated.json", import.meta.url),
  `${JSON.stringify(items, null, 2)}\n`,
  "utf8"
);

console.log(`Synced ${items.length} published news item(s).`);

