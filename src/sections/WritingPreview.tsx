import Link from "next/link";
import { writingArticles } from "@/data/writing";
import { ContentCard } from "@/components/ContentCard";

export function WritingPreview() {
  return (
    <section id="writing" className="scroll-mt-32 bg-white py-24">
      <div className="container">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Writing</p>
            <h2 className="section-title text-3xl md:text-5xl">Notes on learning, technology, and quantitative thinking</h2>
          </div>
          <Link href="/writing" className="font-semibold text-blue-600 hover:text-blue-800">
            Read all writing →
          </Link>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {writingArticles.slice(0, 3).map((article) => (
            <ContentCard
              key={article.slug}
              href={`/writing/${article.slug}`}
              eyebrow={article.category}
              title={article.title}
              description={article.excerpt}
              meta={`${article.publishedAt} · ${article.readingTime}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
