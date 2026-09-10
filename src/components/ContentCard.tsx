import Link from "next/link";

interface ContentCardProps {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  meta?: string;
}

export function ContentCard({ href, eyebrow, title, description, meta }: ContentCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_7px_14px_#EAEAEA] transition-transform hover:-translate-y-1"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>
      <h3 className="mt-4 text-xl font-bold text-[#001738] group-hover:text-blue-700">{title}</h3>
      <p className="mt-3 leading-relaxed text-slate-600">{description}</p>
      {meta && <p className="mt-5 text-xs font-medium uppercase tracking-wide text-slate-400">{meta}</p>}
    </Link>
  );
}
