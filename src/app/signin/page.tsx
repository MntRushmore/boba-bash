import Link from "next/link";
import HdShell from "../HdShell";

const ERROR_COPY: Record<string, string> = {
  bad_email: "That doesn't look like a valid email. Give it another go.",
  send_failed: "We couldn't send your link just now. Please try again.",
  bad_link: "That sign-in link looks incomplete. Request a fresh one.",
  link_expired: "That link expired or was already used. Request a new one.",
  bad_state: "Your sign-in session expired. Please try again.",
  exchange_failed: "Hack Club sign-in didn't complete. Please try again.",
  missing_code: "Sign-in was cancelled. Please try again.",
};

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    sent?: string;
    ref?: string;
    tab?: string;
  }>;
}) {
  const { error, sent, ref } = await searchParams;

  return (
    <HdShell center width={440} brandHref="/">
      <div className="hd-panel sk card">
        {sent ? (
          <div style={{ textAlign: "center" }}>
            <p className="hd-eyebrow">check your email</p>
            <h1 className="hd-title" style={{ transform: "rotate(-0.6deg)" }}>
              link sent!
            </h1>
            <p className="hd-lede" style={{ margin: "10px auto 0" }}>
              We sent a sign-in link to{" "}
              <b style={{ color: "var(--ink)" }}>{sent}</b>. Tap it to finish —
              it works once and expires in 30 minutes.
            </p>
            <Link
              href="/signin"
              className="hd-backlink"
              style={{ display: "inline-block", marginTop: 18 }}
            >
              use a different email
            </Link>
          </div>
        ) : (
          <>
            <p className="hd-eyebrow">{ref ? "you're invited!" : "welcome"}</p>
            <h1 className="hd-title">
              {ref ? "join the Bash" : "sign in"}
            </h1>

            {error ? (
              <p className="hd-alert bad" style={{ marginTop: 14 }}>
                {ERROR_COPY[error] ?? "Something went wrong. Please try again."}
              </p>
            ) : null}

            {/* Attendees — magic email link */}
            <form
              action="/api/attendee/request"
              method="POST"
              className="hd-form"
              style={{ marginTop: 18 }}
            >
              <div className="hd-field">
                <label htmlFor="email" className="hd-label">
                  coming to a Bash? drop your email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="hd-input sk thin soft"
                />
              </div>
              <button type="submit" className="hd-bigbtn primary block sk marker">
                email me a sign-in link ▸
              </button>
            </form>

            <div className="hd-divider" style={{ margin: "20px 0" }}>
              or
            </div>

            {/* Organizers — Hack Club Auth */}
            <a href="/api/login" className="hd-bigbtn block sk marker">
              organizing? continue with Hack Club ▸
            </a>
          </>
        )}
      </div>
    </HdShell>
  );
}
