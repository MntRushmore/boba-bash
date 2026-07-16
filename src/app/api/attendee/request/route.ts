import { NextRequest, NextResponse } from "next/server";
import { sendMagicLink } from "@/lib/magiclink";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Attendee login step 1: email a magic sign-in link. */
export async function POST(request: NextRequest) {
  let email = "";
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    email = String(body.email ?? "");
  } else {
    const form = await request.formData();
    email = String(form.get("email") ?? "");
  }

  if (!EMAIL_RE.test(email.trim())) {
    return NextResponse.redirect(
      new URL("/signin?error=bad_email", request.nextUrl.origin),
    );
  }

  try {
    await sendMagicLink(email, request.nextUrl.origin);
  } catch (e) {
    console.error("sendMagicLink failed:", e);
    return NextResponse.redirect(
      new URL("/signin?error=send_failed", request.nextUrl.origin),
    );
  }

  // Always land on the same "check your email" screen (no account enumeration).
  return NextResponse.redirect(
    new URL(`/signin?sent=${encodeURIComponent(email.trim())}`, request.nextUrl.origin),
  );
}
