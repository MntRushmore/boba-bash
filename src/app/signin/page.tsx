import Image from "next/image";
import Link from "next/link";

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
    <main className="flex-1 grid place-items-center bg-linear-to-br from-caramel to-caramel-deep px-6 py-20">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-xl">
        <Image
          src="/images/logo.svg"
          alt="Boba Bash"
          width={200}
          height={70}
          className="mx-auto w-40 h-auto"
        />

        {sent ? (
          <div className="mt-6 text-center">
            <h1 className="font-display text-2xl font-semibold text-ink text-balance">
              Check your email
            </h1>
            <p className="mt-3 text-ink-soft">
              We sent a sign-in link to{" "}
              <span className="font-mono text-sm text-ink">{sent}</span>. Tap it
              to finish signing in — it works once and expires in 30 minutes.
            </p>
            <Link
              href="/signin"
              className="mt-6 inline-block font-mono text-xs uppercase tracking-widest text-accent"
            >
              Use a different email
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-6 text-center font-display text-2xl font-semibold text-ink text-balance">
              {ref ? "You're invited to a Boba Bash" : "Sign in to Boba Bash"}
            </h1>

            {error ? (
              <p className="mt-4 rounded-lg bg-bad/10 px-4 py-2 text-sm text-bad text-center">
                {ERROR_COPY[error] ?? "Something went wrong. Please try again."}
              </p>
            ) : null}

            {/* Attendees — magic email link */}
            <form
              action="/api/attendee/request"
              method="POST"
              className="mt-6"
            >
              <label
                htmlFor="email"
                className="block font-mono text-xs uppercase tracking-[0.14em] text-ink-soft"
              >
                Coming to a Bash? Enter your email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-3 text-ink outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="mt-3 w-full rounded-full bg-syrup px-6 py-3 font-mono text-sm font-semibold text-cream-soft transition hover:-translate-y-0.5"
              >
                Email me a sign-in link
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-ink-soft">
              <span className="h-px flex-1 bg-line" />
              <span className="font-mono text-xs uppercase tracking-widest">
                or
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>

            {/* Organizers — Hack Club Auth */}
            <a
              href="/api/login"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-line px-6 py-3 font-mono text-sm font-semibold text-ink transition hover:border-accent"
            >
              Organizing a Bash? Continue with Hack Club
            </a>
          </>
        )}

        <Link
          href="/"
          className="mt-8 block text-center font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-accent"
        >
          ← Back home
        </Link>
      </div>
    </main>
  );
}
