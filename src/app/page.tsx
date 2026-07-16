import Image from "next/image";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-caramel to-caramel-deep text-cream-soft">
        <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 text-center">
          <Image
            src="/images/logo.svg"
            alt="Boba Bash"
            width={420}
            height={140}
            priority
            className="mx-auto w-64 sm:w-80 h-auto"
          />
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.22em] text-cream/90">
            September 2026 · Hack Club × Boba Drops
          </p>
          <h1 className="mt-4 font-display text-4xl sm:text-6xl font-semibold leading-[0.98] text-[#fff3dc] text-balance">
            Run a boba meetup.<br />Build the web together.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-cream-soft/95">
            Gather your friends at a local café, build your first websites, and
            earn toward the food for every person you bring in.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="/dashboard"
              className="rounded-full bg-[#fff3dc] px-7 py-3 font-mono text-sm font-semibold text-syrup shadow-lg transition hover:-translate-y-0.5"
            >
              Organize a Bash
            </a>
            <a
              href="/map"
              className="rounded-full border border-cream/40 px-7 py-3 font-mono text-sm font-semibold text-[#fff3dc] transition hover:bg-white/10"
            >
              Find one near you
            </a>
          </div>
        </div>
      </section>

      {/* Scaffold status — placeholder until real screens land */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          Platform scaffold
        </p>
        <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-balance">
          The foundation is live
        </h2>
        <p className="mt-3 max-w-prose text-ink-soft">
          Next.js on Vercel, Airtable as the backend, Slack sign-in, and the
          Boba Drops identity carried over. Screens land next: the live map,
          organizer dashboard, referral links, and submissions.
        </p>
      </section>
    </main>
  );
}
