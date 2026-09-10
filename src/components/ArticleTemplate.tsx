import Link from "next/link";
import type { WritingArticle } from "@/data/writing";

export function ArticleTemplate({ article }: { article: WritingArticle }) {
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/writing" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
        ← All writing
      </Link>
      <header className="mt-8 border-b border-slate-200 pb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">{article.category}</p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#001738] md:text-6xl">{article.title}</h1>
        <p className="mt-6 text-xl leading-relaxed text-gray-700">{article.excerpt}</p>
        <p className="mt-6 text-sm text-slate-500">
          {new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(article.publishedAt))} ·{" "}
          {article.readingTime}
        </p>
      </header>
      <div className="space-y-6 py-10 text-lg leading-relaxed text-gray-700">
        {article.content.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
