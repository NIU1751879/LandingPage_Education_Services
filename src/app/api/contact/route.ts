import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/../lib/supabase";
import { getResendClient } from "@/../lib/resend";

export const runtime = "nodejs";

const leadSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(320),
    message: z.string().trim().min(1).max(5000),
    interest: z.string().trim().max(120).nullable().optional(),
    referrer: z.string().trim().max(2048).nullable().optional(),
    newsletter_opt_in: z.boolean().default(false),
    hp_website: z.string().max(200).optional(),
  })
  .strict();

type LeadPayload = z.infer<typeof leadSchema>;

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestsByIp = new Map<string, number[]>();

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return (
    forwardedFor?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")?.trim() ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recentRequests = (requestsByIp.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    requestsByIp.set(ip, recentRequests);
    return true;
  }

  recentRequests.push(now);
  requestsByIp.set(ip, recentRequests);
  return false;
}

function detectCountry(request: Request): string | null {
  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-country-code");
  const normalized = country?.trim().toUpperCase();
  return normalized && normalized !== "XX" ? normalized : null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getEmailConfig() {
  const notificationEmail = process.env.MY_NOTIFICATION_EMAIL ?? process.env.EMAIL_TEACHER;
  const configuredFrom =
    process.env.RESEND_FROM_EMAIL ??
    process.env.EMAIL_USER ??
    "onboarding@resend.dev";
  const fromEmail = configuredFrom.match(/<([^<>]+)>/)?.[1] ?? configuredFrom.trim();
  const config = z
    .object({
      notificationEmail: z.string().email(),
      fromEmail: z.string().email(),
    })
    .safeParse({ notificationEmail, fromEmail });

  if (!config.success) {
    throw new Error("Email configuration is invalid");
  }

  return config.data;
}

async function sendEmail(
  resend: ReturnType<typeof getResendClient>,
  payload: Parameters<typeof resend.emails.send>[0],
) {
  const result = await resend.emails.send(payload);
  if (result.error) {
    throw new Error(result.error.message);
  }
}

export async function POST(request: Request) {
  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "900" } },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    typeof rawBody === "object" &&
    rawBody !== null &&
    "hp_website" in rawBody &&
    typeof rawBody.hp_website === "string" &&
    rawBody.hp_website.trim() !== ""
  ) {
    return NextResponse.json({ ok: true });
  }

  const parsed = leadSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid form data", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const lead: LeadPayload = parsed.data;
  const country = detectCountry(request);

  try {
    const supabase = createSupabaseAdmin();
    const { error: databaseError } = await supabase.from("leads").insert({
      name: lead.name,
      email: lead.email,
      message: lead.message,
      interest: lead.interest ?? null,
      country,
      referrer: lead.referrer ?? null,
      newsletter_opt_in: lead.newsletter_opt_in,
      source: "website",
      status: "new",
    });

    if (databaseError) {
      throw new Error(`Lead insertion failed: ${databaseError.message}`);
    }

    const resend = getResendClient();
    const { notificationEmail, fromEmail } = getEmailConfig();
    const details = [
      `Name: ${lead.name}`,
      `Email: ${lead.email}`,
      `Message: ${lead.message}`,
      `Interest: ${lead.interest ?? "—"}`,
      `Country: ${country ?? "—"}`,
      `Referrer: ${lead.referrer ?? "—"}`,
      `Newsletter opt-in: ${lead.newsletter_opt_in ? "yes" : "no"}`,
    ].join("\n");

    await sendEmail(resend, {
      from: fromEmail,
      to: [notificationEmail],
      subject: `New website lead: ${lead.name}`,
      text: details,
    });

    await sendEmail(resend, {
      from: fromEmail,
      to: [lead.email],
      subject: "Thanks for getting in touch",
      text: `Hi ${lead.name},\n\nThanks for your message. Jan will get back to you soon.\n\nBest,\nJan`,
      html: `<p>Hi ${escapeHtml(lead.name)},</p><p>Thanks for your message. Jan will get back to you soon.</p><p>Best,<br />Jan</p>`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact pipeline failed:", error);
    return NextResponse.json(
      { ok: false, error: "Unable to process your message right now." },
      { status: 500 },
    );
  }
}
