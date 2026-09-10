"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ExternalLink, FileText, Github } from "lucide-react";
import { useState } from "react";
import { portfolioProjects, Project, ProjectType } from "@/data/portfolio";
import Link from "next/link";

type Filter = "all" | ProjectType;

const filters: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Apps & Products", value: "app" },
  { label: "Research & Papers", value: "paper" },
  { label: "Open Source / Projects", value: "project" },
];

const typeLabels: Record<ProjectType, string> = {
  app: "Web app",
  paper: "Research paper",
  project: "Open project",
};

const typeStyles: Record<ProjectType, string> = {
  app: "bg-blue-100 text-blue-700",
  paper: "bg-violet-100 text-violet-700",
  project: "bg-emerald-100 text-emerald-700",
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export function ProjectLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#001738]"
    >
      {children}
    </a>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.article
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.35 }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_7px_14px_#EAEAEA]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <Image
          src={project.image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${typeStyles[project.type]}`}>
          {typeLabels[project.type]}
        </span>
        <h3 className="mt-4 text-xl font-bold text-[#001738]">{project.title}</h3>
        <p className="mt-3 flex-1 leading-relaxed text-slate-600">{project.description}</p>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Topics and technologies">
          {project.tags.map((tag) => (
            <li key={tag} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              {tag}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Built with</span>
          <div className="flex items-center gap-1">
            {project.demoUrl && (
              <ProjectLink href={project.demoUrl} label={`Open ${project.title} demo`}>
                <ExternalLink size={17} aria-hidden="true" />
              </ProjectLink>
            )}
            {project.paperUrl && (
              <ProjectLink href={project.paperUrl} label={`Read ${project.title} paper`}>
                {project.type === "paper" ? (
                  <BookOpen size={17} aria-hidden="true" />
                ) : (
                  <FileText size={17} aria-hidden="true" />
                )}
              </ProjectLink>
            )}
            {project.repoUrl && (
              <ProjectLink href={project.repoUrl} label={`Open ${project.title} source code`}>
                <Github size={17} aria-hidden="true" />
              </ProjectLink>
            )}
          </div>
        </div>
        <p className="mt-2 text-right text-xs text-slate-500">{project.builtWith.join(" · ")}</p>
      </div>
    </motion.article>
  );
}

export const Portfolio = ({ limit }: { limit?: number } = {}) => {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const filteredProjects = portfolioProjects.filter(
    (project) => activeFilter === "all" || project.type === activeFilter,
  );
  const visibleProjects = limit ? filteredProjects.slice(0, limit) : filteredProjects;

  return (
    <section id="portfolio" className="scroll-mt-32 bg-[#EAEEFE] py-24" aria-labelledby="portfolio-heading">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Selected work</p>
          <h2 id="portfolio-heading" className="section-title text-3xl md:text-5xl">
            Tools and research that create more room to move
          </h2>
          <p className="section-des mt-4">
            Projects that reduce friction, make reasoning inspectable, and turn learning into more opportunity and leverage.
          </p>
          {limit && (
            <Link href="/projects" className="mt-5 inline-block font-semibold text-blue-600 hover:text-blue-800">
              View all projects →
            </Link>
          )}
        </motion.div>

        <div className="mb-10 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter portfolio">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive ? "bg-[#001738] text-white" : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <motion.div layout className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visibleProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                transition={{ duration: 0.35, delay: index * 0.06 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
