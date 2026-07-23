import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatNewsDate, newsItems } from "@/lib/news";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return newsItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = newsItems.find((entry) => entry.slug === slug);
  if (!item) return {};

  return {
    title: `${item.title} — Freyr AI`,
    description: item.summary,
  };
}

export default async function NewsArticle({ params }: PageProps) {
  const { slug } = await params;
  const item = newsItems.find((entry) => entry.slug === slug);
  if (!item) notFound();

  return (
    <main className="articlePage">
      <header className="articleHeader">
        <Link className="articleBrand" href="/">FREYR</Link>
        <Link className="articleBack" href="/#news">← Back to news</Link>
      </header>
      <article className="article">
        <p className="articleMeta">
          {formatNewsDate(item.published_at)} · {item.category}
        </p>
        <h1>{item.title}</h1>
        <p className="articleSummary">{item.summary}</p>
        {item.cover_image_url ? (
          <div
            className="articleCover"
            role="img"
            aria-label={item.title}
            style={{ backgroundImage: `url("${item.cover_image_url}")` }}
          />
        ) : null}
        <div
          className="articleBody"
          dangerouslySetInnerHTML={{ __html: item.body_html }}
        />
      </article>
    </main>
  );
}

