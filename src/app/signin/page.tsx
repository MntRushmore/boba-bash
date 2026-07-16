import Image from "next/image";
import Link from "next/link";

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ref?: string }>;
}) {
  const { error, ref } = await searchParams;

  return (
    <main className="flex-1 grid place-items-center bg-gradient-to-br from-caramel to-caramel-deep px-6 py-20">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-xl text-center">
        <Image
          src="/images/logo.svg"
          alt="Boba Bash"
          width={200}
          height={70}
          className="mx-auto w-40 h-auto"
        />
        <h1 className="mt-6 font-display text-2xl font-semibold text-ink text-balance">
          {ref ? "You're invited to a Boba Bash" : "Sign in to Boba Bash"}
        </h1>
        <p className="mt-2 text-ink-soft">
          {ref
            ? "Sign in with Slack to RSVP and save your spot."
            : "Use your Hack Club Slack account to continue."}
        </p>

        {error ? (
          <p className="mt-4 rounded-lg bg-bad/10 px-4 py-2 text-sm text-bad">
            Something went wrong signing you in ({error}). Please try again.
          </p>
        ) : null}

        <a
          href="/api/login"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-syrup px-6 py-3 font-mono text-sm font-semibold text-cream-soft transition hover:-translate-y-0.5"
        >
          Continue with Slack
        </a>

        <p className="mt-5 text-sm text-ink-soft">
          New here?{" "}
          <a
            href="https://hackclub.com/slack"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Create a Hack Club Slack account
          </a>{" "}
          first — it only takes a minute.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-accent"
        >
          ← Back home
        </Link>
      </div>
    </main>
  );
}
