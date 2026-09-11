"use client";

import type { ReactNode } from "react";
import { useCallback } from "react";
import { motion } from "framer-motion";
import { StatsigClient } from "@statsig/js-client";
import type { StatsigUpdateDetails } from "@statsig/js-client";

// Client-side CTA tracker for the `sydney_landing_validation` experiment.
//
// Env vars to set:
// - .env.local:
//   - NEXT_PUBLIC_STATSIG_CLIENT_KEY="<your-statsig-client-key>"
// - Vercel:
//   - Add `NEXT_PUBLIC_STATSIG_CLIENT_KEY` as an environment variable (same name/value).
//
// Safety:
// - If Statsig fails/times out, we still redirect (no user-visible breakage).

const STABLE_ID_COOKIE = "statsigStableID";
const VARIANT_COOKIE = "sydney_landing_validation_variant";

const EXPERIMENT = "sydney_landing_validation";
const EVENT_NAME = "lead_form_click";
const DEFAULT_VARIANT: "landing_a" | "landing_b" = "landing_a";

let statsigClient: StatsigClient | null = null;
let initPromise: Promise<StatsigUpdateDetails | undefined> | null = null;

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function redirectToHref(href: string) {
  if (href.startsWith("#")) {
    // Hash navigation should not cause a full reload.
    window.location.hash = href.slice(1);
    return;
  }
  window.location.assign(href);
}

function withTimeout<T>(p: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("statsig client timeout")), timeoutMs),
    ),
  ]);
}

async function ensureClientInitialized(timeoutMs: number): Promise<void> {
  const sdkKey = process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY;
  if (!sdkKey) return;

  if (!initPromise) {
    const stableID = getCookie(STABLE_ID_COOKIE);

    statsigClient = new StatsigClient(sdkKey, {
      // Use StableID override so the client matches server targeting.
      ...(stableID
        ? {
            userID: stableID,
            customIDs: { stableID },
          }
        : { userID: "anonymous" }),
    });

    initPromise = withTimeout(statsigClient.initializeAsync(), timeoutMs).catch(
      () => {
        // Swallow: we will still redirect.
        return undefined;
      },
    );
  }

  await initPromise;
}

export default function TrackedCTAButton({
  href,
  children,
  className,
  onBeforeRedirect,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  onBeforeRedirect?: () => void;
}) {
  const onClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();

      const cookieVariant = getCookie(VARIANT_COOKIE);
      const variant =
        cookieVariant === "landing_b" ? ("landing_b" as const) : DEFAULT_VARIANT;

      try {
        await ensureClientInitialized(1500);

        // Best-effort: if initialization timed out, `logEvent` might throw; catch it.
        statsigClient?.logEvent(EVENT_NAME, undefined, {
          experiment: EXPERIMENT,
          variant,
        });

        // Try to flush immediately so the next navigation doesn't drop the event.
        if (statsigClient) {
          await withTimeout(statsigClient.flush(), 500).catch(() => {});
        }
      } catch {
        // Silent fallback: redirect anyway.
      } finally {
        onBeforeRedirect?.();
        redirectToHref(href);
      }
    },
    [href, onBeforeRedirect],
  );

  return (
    <motion.a
      href={href}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      {children}
    </motion.a>
  );
}
