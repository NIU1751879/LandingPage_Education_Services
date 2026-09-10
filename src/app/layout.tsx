import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { twMerge } from "tailwind-merge";
import { LanguageProvider } from "@/contexts/LanguageContext";

const dmSans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://jangomezetutor.es"),
  title: {
    default: "Jan Gómez Escobar | Learning, Technology & Quantitative Systems",
    template: "%s | Jan Gómez Escobar",
  },
  description:
    "Jan Gómez Escobar builds software, learning systems, and quantitative research tools that create more capability, better decisions, and more optionality.",
  keywords: [
    "Jan Gómez Escobar",
    "software engineering",
    "AI education",
    "quantitative research",
    "mathematics tutoring",
    "learning systems",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Jan Gómez Escobar | Learning, Technology & Quantitative Systems",
    description:
      "Building more optionality through learning, technology, and systems.",
    siteName: "Jan Gómez Escobar",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jan Gómez Escobar | Learning, Technology & Quantitative Systems",
    description:
      "Building more optionality through learning, technology, and systems.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="relative">
      <body className={twMerge(dmSans.className, "antialiased bg-[#EAEEFE]")}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
