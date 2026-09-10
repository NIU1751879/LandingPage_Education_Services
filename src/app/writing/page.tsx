import type { Metadata } from "next";
import Link from "next/link";
import { ContentCard } from "@/components/ContentCard";
import { writingArticles, writingCategories } from "@/data/writing";
import { Footer } from "@/sections/Footer";
import { Header } from "@/sections/Header";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on learning, technology, systems, and quantitative thinking.",
};

export default function WritingPage() {
  return (
    <div>
      <Header />
      <main className="bg-[#EAEEFE] px-6 py-24 md:py-32">
        <div className="container">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Writing</p>
            <h1 className="section-title text-4xl md:text-6xl">Ideas for building more optionality</h1>
            <p className="section-des mt-5">
              Essays and working notes about learning, technology, systems, and decisions under uncertainty.
            </p>
          </div>
          <div className="mb-10 flex flex-wrap justify-center gap-2" aria-label="Writing categories">
            {writingCategories.map((category) => (
              <Link
                key={category}
                href={category === "All" ? "/writing" : `/writing/category/${category.toLowerCase().replaceAll(" ", "-")}`}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                {category}
              </Link>
            ))}
          </div>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {writingArticles.map((article) => (
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
      </main>
      <Footer />
    </div>
  );
}
