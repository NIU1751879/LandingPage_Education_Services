import type { Metadata } from "next";
import { Footer } from "@/sections/Footer";
import { Header } from "@/sections/Header";
import { Portfolio } from "@/sections/Portfolio";

export const metadata: Metadata = {
  title: "Projects",
  description: "Software, quantitative research, and open projects by Jan Gómez Escobar.",
};

export default function ProjectsPage() {
  return (
    <div>
      <Header />
      <main className="pt-8">
        <Portfolio />
      </main>
      <Footer />
    </div>
  );
}
