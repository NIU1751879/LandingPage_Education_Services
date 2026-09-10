import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story behind Jan Gómez Escobar's work across learning, technology, systems, and quantitative research.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
