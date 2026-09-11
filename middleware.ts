import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import Statsig from "statsig-node";
import type { InitializationDetails } from "statsig-node";

// Tutoring landing experiment (`sydney_landing_validation`).
// Applies only to `/services/tutoring` — the site root `/` is never rewritten.
//
// Env vars to set:
// - .env.local:
//   - STATSIG_SERVER_SECRET="<your-statsig-server-secret>"
// - Vercel:
//   - Add `STATSIG_SERVER_SECRET` as an environment variable (same name/value).
//
// Notes:
// - If Statsig fails or times out, we silently default to `/services/tutoring/variant-a` (control).
// - We store:
//   - `statsigStableID` (30-day cookie retention)
//   - `sydney_landing_validation_variant` (landing_a | landing_b, 30-day retention)

const STABLE_ID_COOKIE = "statsigStableID";
const VARIANT_COOKIE = "sydney_landing_validation_variant";
const EXPERIMENT_NAME = "sydney_landing_validation";
const PARAM_VARIANT_NAME = "variant_name";

const TUTORING_PATH = "/services/tutoring";
const VARIANT_A_PATH = "/services/tutoring/variant-a";
const VARIANT_B_PATH = "/services/tutoring/variant-b";

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;
const DEFAULT_VARIANT: "landing_a" | "landing_b" = "landing_a";

const isStaticAssetRequest = (pathname: string) => {
  // Explicit bypasses + generic "has file extension" rule.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/favicon")
  ) {
    return true;
  }
  // public/* files generally have an extension (e.g. .png, .jpg, .css, .js, .ico)
  if (/\.[^/]+$/.test(pathname)) return true;
  return false;
};

let initPromise: Promise<InitializationDetails> | null = null;

async function ensureStatsigInitialized(timeoutMs: number): Promise<boolean> {
  const secret = process.env.STATSIG_SERVER_SECRET;
  if (!secret) return false;

  if (!initPromise) {
    initPromise = Statsig.initialize(secret, {
      // Keep default behavior; experiment evaluation uses cached values after init.
    });
  }

  try {
    await Promise.race([
      initPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("statsig init timeout")), timeoutMs),
      ),
    ]);
    return true;
  } catch {
    return false;
  }
}

function getCookieValue(req: NextRequest, name: string): string | undefined {
  const v = req.cookies.get(name)?.value;
  return v ? String(v) : undefined;
}

function generateStableID(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  // Fallback for very old runtimes
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeCrypto = require("crypto") as typeof import("crypto");
  return nodeCrypto.randomUUID();
}

async function evaluateVariant(stableID: string): Promise<"landing_a" | "landing_b"> {
  const ok = await ensureStatsigInitialized(2500);
  if (!ok) return DEFAULT_VARIANT;

  // Deterministic targeting: use your stable ID as `userID` for experiment evaluation.
  const user = { userID: stableID };
  const experiment = Statsig.getExperiment(user, EXPERIMENT_NAME);
  const raw = String(experiment.get(PARAM_VARIANT_NAME, DEFAULT_VARIANT));
  return raw === "landing_b" ? "landing_b" : "landing_a";
}

function cookieOptions(req: NextRequest) {
  const secure = req.nextUrl.protocol === "https:";
  return {
    path: "/",
    // Must be readable by the browser so `TrackedCTAButton` can attach the current
    // variant to the `lead_form_click` event metadata.
    httpOnly: false,
    sameSite: "lax" as const,
    secure,
    maxAge: THIRTY_DAYS_SECONDS,
  };
}

export const config = {
  // String literals required so Next.js can statically analyze the matcher.
  matcher: [
    "/services/tutoring",
    "/services/tutoring/variant-a",
    "/services/tutoring/variant-b",
  ],
  // Allows `statsig-node` usage in middleware.
  runtime: "nodejs",
};

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (isStaticAssetRequest(pathname)) return NextResponse.next();

  // Ensure Stable ID always exists.
  const existingStableID = getCookieValue(req, STABLE_ID_COOKIE);
  const stableID = existingStableID ?? generateStableID();

  // If request is already for the variant routes, keep the URL stable
  // and just ensure cookies exist for client-side tracking.
  if (pathname === VARIANT_A_PATH || pathname === VARIANT_B_PATH) {
    const existingVariant = getCookieValue(req, VARIANT_COOKIE);
    const variant = existingVariant ?? (pathname === VARIANT_B_PATH ? "landing_b" : "landing_a");

    const res = NextResponse.next();
    if (!existingStableID) res.cookies.set(STABLE_ID_COOKIE, stableID, cookieOptions(req));
    if (!existingVariant) res.cookies.set(VARIANT_COOKIE, variant, cookieOptions(req));
    return res;
  }

  // Experiment entrypoint: default to control on any error.
  const existingVariant = getCookieValue(req, VARIANT_COOKIE);
  const variant: "landing_a" | "landing_b" = existingVariant
    ? existingVariant === "landing_b"
      ? "landing_b"
      : "landing_a"
    : await evaluateVariant(stableID).catch(() => DEFAULT_VARIANT);

  const rewritePath = variant === "landing_b" ? VARIANT_B_PATH : VARIANT_A_PATH;
  const url = req.nextUrl.clone();
  url.pathname = rewritePath;

  const res = NextResponse.rewrite(url);
  res.cookies.set(STABLE_ID_COOKIE, stableID, cookieOptions(req));
  res.cookies.set(VARIANT_COOKIE, variant, cookieOptions(req));
  return res;
}
