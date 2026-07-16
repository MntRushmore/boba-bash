import { NextRequest, NextResponse } from "next/server";
import { consumeMagicLink } from "@/lib/magiclink";
import { upsertAttendeeByEmail } from "@/lib/people";
import { establishSession } from "@/lib/auth";

/** Attendee login step 2: verify the magic link and start a session. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");

  const fail = (msg: string) =>
    NextResponse.redirect(
      new URL(`/signin?error=${encodeURIComponent(msg)}`, url.origin),
    );

  if (!token || !email) return fail("bad_link");

  try {
    const verifiedEmail = await consumeMagicLink(email, token);
    if (!verifiedEmail) return fail("link_expired");

    const person = await upsertAttendeeByEmail(verifiedEmail);

    await establishSession({
      personId: person.id,
      authType: "magic-link",
      email: verifiedEmail,
      name: person.fields.full_name,
      role: person.fields.role,
    });
  } catch (e) {
    console.error("Attendee verify failed:", e);
    return fail("link_expired");
  }

  return NextResponse.redirect(new URL("/dashboard", url.origin));
}
