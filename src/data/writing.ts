export type WritingCategory = "Learning" | "Technology" | "Quantitative thinking";

export interface WritingArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: WritingCategory;
  publishedAt: string;
  readingTime: string;
  content: string[];
}

export const writingCategories: Array<WritingCategory | "All"> = [
  "All",
  "Learning",
  "Technology",
  "Quantitative thinking",
];

export const writingArticles: WritingArticle[] = [
  {
    slug: "learning-systems-create-more-options",
    title: "Learning systems create more options",
    excerpt:
      "A practical look at why learning becomes more useful when it is treated as a system rather than a series of isolated tasks.",
    category: "Learning",
    publishedAt: "2026-01-18",
    readingTime: "5 min read",
    content: [
      "Learning is often described as the accumulation of knowledge. In practice, the useful unit is capability: being able to understand a problem, make a decision, and act with less dependence on guesswork.",
      "A learning system makes that process repeatable. It combines clear goals, feedback, deliberate practice, and enough reflection to reveal what is actually improving.",
      "This matters because capability compounds. Better learning creates more choices later: which problems to work on, which tools to build, and which opportunities are realistic to pursue.",
    ],
  },
  {
    slug: "software-as-leverage",
    title: "Software as leverage",
    excerpt:
      "Software is most valuable when it removes repeated friction and gives people more control over how work gets done.",
    category: "Technology",
    publishedAt: "2025-12-06",
    readingTime: "4 min read",
    content: [
      "The point of a software system is not the framework used to build it. The point is the change it makes possible for the people using it.",
      "Good systems reduce repeated effort, make information easier to inspect, and preserve attention for decisions that require judgment. That is a more useful definition of leverage than simply doing more work faster.",
      "The design question I return to is simple: which constraint should this tool remove, and what new choices should become available once it does?",
    ],
  },
  {
    slug: "making-uncertainty-visible",
    title: "Making uncertainty visible",
    excerpt:
      "Quantitative work becomes more useful when it shows the assumptions and uncertainty behind a result.",
    category: "Quantitative thinking",
    publishedAt: "2025-10-21",
    readingTime: "6 min read",
    content: [
      "A single number can look precise while hiding the assumptions that produced it. Quantitative thinking is partly the discipline of making those assumptions inspectable.",
      "In research and decision-making, uncertainty is not a defect to hide. It is information about how much confidence a result deserves and what evidence would change the conclusion.",
      "Making uncertainty visible supports better decisions because it leaves room to update, compare alternatives, and choose an appropriate level of risk.",
    ],
  },
];

export function getArticleBySlug(slug: string) {
  return writingArticles.find((article) => article.slug === slug);
}
