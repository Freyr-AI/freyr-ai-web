import newsData from "@/content/news.generated.json";

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  body_html: string;
  body_json?: string;
  cover_image_url: string;
  published_at: string;
  updated_at: string;
};

export const newsItems = newsData as NewsItem[];

export function formatNewsDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

