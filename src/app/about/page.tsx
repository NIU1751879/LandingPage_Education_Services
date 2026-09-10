"use client";
import { motion } from "framer-motion";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";

const timeline = [
  {
    label: "Education",
    title: "Started a B.Sc. in Computational Mathematics at UAB",
    description:
      "I chose a degree that lets me move between theory, code, and the messy problems in between: the foundation for building better tools and decisions.",
  },
  {
    label: "Research",
    title: "Founded Spinortechnologies",
    description:
      "I started an independent quant research group to read papers carefully, test assumptions, and document strategy design in public.",
  },
  {
    label: "Teaching",
    title: "Began self-employed tutoring in mathematics and programming",
    description:
      "Teaching one-to-one showed me how quickly difficult ideas become useful when they are explained from the learner's starting point, creating more paths forward.",
  },
  {
    label: "Teaching",
    title: "Joined IT Academy Barcelona as an instructor",
    description:
      "I work with more learners and keep refining the explanations that turn technical concepts into practical capability.",
  },
  {
    label: "Research",
    title: "Researched numerical methods for real options valuation",
    description:
      "I explored how numerical methods can make decisions under uncertainty less abstract, more explicit, and more actionable.",
  },
  {
    label: "Engineering",
    title: "Founded and built RealAutoSolution",
    description:
      "I built a multi-tenant incident-management SaaS so tenants can report problems directly and see the process move with less friction.",
  },
  {
    label: "Research",
    title: "Studied statistical arbitrage and mean reversion",
    description:
      "I investigated cointegration-driven pairs trading and Kalman filtering without hiding the assumptions behind the results or the limits of the evidence.",
  },
  {
    label: "Research",
    title: "Developed bootstrap methods for financial risk management",
    description:
      "I used bootstrap methods for VaR research because risk estimates should show their uncertainty and support better decisions, not just one impressive number.",
  },
  {
    label: "Education",
    title: "Exchanged to Macquarie University in Sydney",
    description:
      "I am now focusing on quantitative finance, quantitative risk, econometrics, and derivatives in a new academic environment that broadens my perspective.",
  },
  {
    label: "Community",
    title: "Joined the Macquarie University Debating Society",
    description:
      "I am practicing the human side of technical work: listening closely, thinking under pressure, and making an argument clear.",
  },
];

const interests = [
  {
    title: "AI in education",
    description:
      "Education systems should help people turn knowledge into capability, with useful explanations available when they need them.",
  },
  {
    title: "Quantitative risk and market access",
    description:
      "Quantitative risk modelling can make uncertainty visible and help more people make informed decisions about opportunity and access.",
  },
  {
    title: "Full-stack architecture and data security",
    description:
      "Software should reduce friction and protect users by design, from database-level Row-Level Security to the last interface they touch.",
  },
  {
    title: "Distributed and serverless systems",
    description:
      "Reliable edge and serverless infrastructure can make useful tools cheaper to run and easier to reach.",
  },
  {
    title: "Open-source and open-research tooling",
    description:
      "Sharing the tools and reasoning behind a result lets other people learn, verify, and build on it, increasing collective leverage.",
  },
  {
    title: "Applied machine learning",
    description:
      "Projects such as KNN and K-Means image categorisation keep machine learning grounded in practical tools that expand what people can do.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function AboutPage() {
  return (
    <div className="bg-[#e8ebef] text-gray-900">
      <Header />

      <main>
        <section
          aria-labelledby="about-title"
          className="px-6 py-24 md:py-32"
        >
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="max-w-3xl"
            >
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-blue-600"
              >
                About me
              </motion.p>
              <motion.h1
                id="about-title"
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="text-4xl font-extrabold tracking-tight text-[#001738] md:text-6xl"
              >
                Building more optionality through learning, technology, and systems.
              </motion.h1>
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="mt-8 text-xl leading-relaxed text-gray-700 md:text-2xl"
              >
                I&apos;m Jan Gómez Escobar, a Computational Mathematics student,
                builder, and researcher at UAB in Barcelona, currently on
                exchange at Macquarie University in Sydney. I move between
                quantitative research, full-stack engineering, and teaching
                because each can help people build more capability and choice.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={stagger}
              className="mt-16 grid gap-6 md:grid-cols-3"
            >
              <motion.article
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="rounded-3xl bg-white p-8 shadow-md"
              >
                <h2 className="text-2xl font-bold text-[#001738]">Who I am</h2>
                <p className="mt-4 leading-relaxed text-gray-600">
                  I work across quant research, product engineering, and
                  education because they solve different parts of the same
                  problem: turning knowledge and evidence into more capability,
                  better decisions, and more options.
                </p>
              </motion.article>
              <motion.article
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="rounded-3xl bg-white p-8 shadow-md"
              >
                <h2 className="text-2xl font-bold text-[#001738]">
                  What drives me
                </h2>
                <p className="mt-4 leading-relaxed text-gray-600">
                  The thread through my work is optionality. Education builds
                  skills, software creates leverage, and research helps people
                  reason under uncertainty. Together, they can widen access to
                  useful tools and better choices.
                </p>
              </motion.article>
              <motion.article
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="rounded-3xl bg-white p-8 shadow-md"
              >
                <h2 className="text-2xl font-bold text-[#001738]">
                  How I work
                </h2>
                <p className="mt-4 leading-relaxed text-gray-600">
                  I build infrastructure carefully, test assumptions out of
                  sample, call out lookahead bias, and explain technical ideas
                  so people can use them to make better decisions.
                </p>
              </motion.article>
            </motion.div>
          </div>
        </section>

        <section
          aria-labelledby="journey-title"
          className="bg-white px-6 py-24 md:py-32"
        >
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mx-auto mb-20 max-w-2xl text-center"
            >
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                The journey so far
              </p>
              <h2
                id="journey-title"
                className="text-3xl font-extrabold tracking-tight text-[#001738] md:text-5xl"
              >
                A path with a few useful detours.
              </h2>
            </motion.div>

            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute left-3 top-0 hidden h-full w-0.5 bg-blue-100 md:left-1/2 md:block"
              />
              <ol>
                {timeline.map((item, index) => {
                  const isEven = index % 2 === 0;

                  return (
                    <motion.li
                      key={item.title}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.5, delay: index * 0.04 }}
                      className="relative mb-12 flex md:mb-16"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-8 z-10 h-6 w-6 rounded-full border-4 border-white bg-blue-600 shadow-md md:left-1/2 md:-translate-x-1/2"
                      />
                      <div
                        className={`ml-12 w-full md:ml-0 md:w-1/2 ${
                          isEven
                            ? "md:pr-16 md:text-right"
                            : "md:ml-auto md:pl-16"
                        }`}
                      >
                        <article className="rounded-3xl border border-gray-100 bg-[#f7f8fa] p-6 shadow-sm md:p-8">
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                            {item.label}
                          </p>
                          <h3 className="mt-2 text-xl font-bold text-[#001738] md:text-2xl">
                            {item.title}
                          </h3>
                          <p className="mt-3 leading-relaxed text-gray-600">
                            {item.description}
                          </p>
                        </article>
                      </div>
                    </motion.li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="interests-title"
          className="px-6 py-24 md:py-32"
        >
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mb-12 max-w-2xl"
            >
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                Areas of interest &amp; research
              </p>
              <h2
                id="interests-title"
                className="text-3xl font-extrabold tracking-tight text-[#001738] md:text-5xl"
              >
                Technology, education, and systems should expand what people can do.
              </h2>
            </motion.div>

            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={stagger}
              className="grid gap-5 md:grid-cols-2"
            >
              {interests.map((interest) => (
                <motion.li
                  key={interest.title}
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className="rounded-3xl bg-white p-7 shadow-md"
                >
                  <h3 className="text-xl font-bold text-[#001738]">
                    {interest.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-gray-600">
                    {interest.description}
                  </p>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </section>

        <section
          aria-labelledby="beyond-code-title"
          className="bg-[#001738] px-6 py-24 text-white md:py-32"
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="container mx-auto max-w-3xl"
          >
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-blue-300">
              Beyond code
            </p>
            <h2
              id="beyond-code-title"
              className="text-3xl font-extrabold tracking-tight md:text-5xl"
            >
              The parts of life that don&apos;t fit on a CV.
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-blue-100 md:text-xl">
              Tutoring keeps me close to how people actually learn: their
              incentives, constraints, and the explanations that help them act.
              Street fundraising for an NGO taught me to listen, understand
              motivation, and keep communicating after a no. Debate at Macquarie
              sharpens my ability to reason with competing views, while studying
              economics helps me think about incentives, trade-offs, and access
              to opportunity. These experiences are not separate from my
              technical work; they keep it grounded in people and the choices
              systems create.
            </p>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
