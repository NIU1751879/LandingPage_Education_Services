import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentCard } from "@/components/ContentCard";
import { writingArticles, type WritingCategory } from "@/data/writing";
import { Footer } from "@/sections/Footer";
import { Header } from "@/sections/Header";

function categoryFromSlug(slug: string): WritingCategory | undefined {
  return writingArticles
    .map((article) => article.category)
    .find((category) => category.toLowerCase().replaceAll(" ", "-") === slug);
}

export function generateStaticParams() {
  return Array.from(new Set(writingArticles.map((article) => article.category))).map((category) => ({
    category: category.toLowerCase().replaceAll(" ", "-"),
  }));
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const category = categoryFromSlug(params.category);
  return category
    ? {
        title: `${category} writing`,
        description: `Writing about ${category.toLowerCase()} by Jan Gómez Escobar.`,
      }
    : {};
}

export default function WritingCategoryPage({ params }: { params: { category: string } }) {
  const category = categoryFromSlug(params.category);
  if (!category) notFound();

  const articles = writingArticles.filter((article) => article.category === category);

  return (
    <div>
      <Header />
      <main className="bg-[#EAEEFE] px-6 py-24 md:py-32">
        <div className="container">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Writing category</p>
            <h1 className="section-title text-4xl md:text-6xl">{category}</h1>
          </div>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
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
