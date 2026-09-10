import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleTemplate } from "@/components/ArticleTemplate";
import { getArticleBySlug, writingArticles } from "@/data/writing";
import { Footer } from "@/sections/Footer";
import { Header } from "@/sections/Header";

export function generateStaticParams() {
  return writingArticles.map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = getArticleBySlug(params.slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/writing/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt,
      section: article.category,
    },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  return (
    <div>
      <Header />
      <main className="bg-[#EAEEFE] px-6 py-24 md:py-32">
        <ArticleTemplate article={article} />
      </main>
      <Footer />
    </div>
  );
}
