export type ProjectType = "app" | "paper" | "project";

export interface Project {
  id: string;
  title: string;
  type: ProjectType;
  description: string;
  tags: string[];
  image: string;
  demoUrl?: string;
  repoUrl?: string;
  paperUrl?: string;
  builtWith: string[];
}

export const portfolioProjects: Project[] = [
  {
    id: "real-auto-solution",
    title: "RealAutoSolution",
    type: "app",
    description:
      "A multi-tenant incident-management SaaS that gives tenants a direct reporting channel, making problems visible and helping teams act before friction compounds.",
    tags: ["Next.js 15", "React 19", "Supabase", "PostgreSQL RLS", "Multi-tenant SaaS"],
    image: "/images/RealState.png",
    demoUrl: "https://github.com/NIU1751879/RealStateSolution",
    builtWith: ["Next.js 15", "React 19", "Supabase", "Postgres RPCs", "Row-Level Security"],
  },
  {
    id: "statistical-arbitrage",
    title: "Statistical Arbitrage & Mean Reversion Strategies",
    type: "paper",
    description:
      "An open study of cointegration-driven pairs trading across equities, crypto, and FX, giving readers a transparent way to evaluate uncertainty, assumptions, and trading costs.",
    tags: ["Python", "statsmodels", "Kalman Filter", "Cointegration", "Quant Research"],
    image: "/images/residuals.jpg",
    paperUrl: "https://github.com/NIU1751879/Trading_Strategies/tree/main",
    builtWith: ["Python", "Johansen/VECM", "Kalman Filtering", "Transaction-cost analysis"],
  },
  {
    id: "bootstrap-risk-management",
    title: "Bootstrap Methods for Financial Risk Management",
    type: "paper",
    description:
      "A comparison of bootstrap VaR intervals on BTC-USD that makes hidden tail-risk uncertainty visible and supports more cautious financial decisions.",
    tags: ["Python", "Bootstrap Resampling", "Value-at-Risk", "Hypothesis Testing"],
    image: "/images/Bootstrap.png",
    paperUrl: "https://github.com/NIU1751879/QuantbootstrapVAR",
    builtWith: ["Python", "Parametric VaR", "Percentile Bootstrap", "BCa Bootstrap"],
  },
  {
    id: "real-options-valuation",
    title: "Numerical Methods for Real Options Valuation",
    type: "paper",
    description:
      "A benchmark of numerical solvers against a closed-form real-options solution, helping decision-makers understand how modelling choices affect choices under uncertainty.",
    tags: ["Python", "Numerical ODE Solvers", "Options Pricing"],
    image: "/images/RO_NUM.png",
    paperUrl: "https://github.com/NIU1751879/NUM_METHODS_RealOptions",
    builtWith: ["Python", "Euler", "Heun", "RK2", "RK4"],
  },
  {
    id: "image-categorization",
    title: "E-Commerce Automated Image Categorization Engine",
    type: "project",
    description:
      "A clothing image categorisation pipeline that reduces manual tagging work and tests how better data isolation can make product discovery more accessible.",
    tags: ["Python", "K-Means++", "Computer Vision"],
    image: "/images/Clasificator_heat.png",
    builtWith: ["Python", "KNN", "K-Means++", "Fashion-MNIST", "ROI isolation"],
  },
  {
    id: "spinortechnologies",
    title: "Spinortechnologies",
    type: "project",
    description:
      "An independent quant research group I founded to make quantitative research easier to inspect, learn from, and build on through open strategy design.",
    tags: ["Quant Research", "Community", "Open Research"],
    image: "/images/spinor-tecnologies.png",
    repoUrl: "https://spinortechnologies.com",
    builtWith: ["Academic literature review", "Python", "Open write-ups", "Peer discussion"],
  },
];
