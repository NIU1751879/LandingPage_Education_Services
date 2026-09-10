export type ServiceId = "engineering" | "edtech" | "research";

export interface Service {
  id: ServiceId;
  icon: "code" | "sparkles" | "graduation";
  translationKey: "engineering" | "edtech" | "tutoring";
  href?: string;
  ctaTranslationKey?: string;
}

export const services: Service[] = [
  {
    id: "engineering",
    icon: "code",
    translationKey: "engineering",
  },
  {
    id: "edtech",
    icon: "sparkles",
    translationKey: "edtech",
    href: "/services/tutoring",
    ctaTranslationKey: "tutoring.learnMore",
  },
  {
    id: "research",
    icon: "graduation",
    translationKey: "tutoring",
  },
];
