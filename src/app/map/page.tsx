import Link from "next/link";
import { getPublicMeetups, parseGeocode } from "@/lib/meetups";
import MapView from "./MapView";
import type { MapPin } from "./MapInner";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const meetups = await getPublicMeetups();

  const pins: MapPin[] = meetups.flatMap((m) => {
    const coord = parseGeocode(m.fields.geocode);
    if (!coord) return [];
    return [
      {
        id: m.id,
        lat: coord.lat,
        lng: coord.lng,
        name: m.fields.name,
        venue: m.fields.venue,
        city: m.fields.city,
        date: m.fields.date,
      },
    ];
  });

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-6 pt-12">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-accent"
        >
          ← Home
        </Link>
        <h1 className="mt-4 font-display text-4xl font-semibold text-balance">
          Find a Boba Bash near you
        </h1>
        <p className="mt-2 text-ink-soft">
          Pick a spot on the map, or browse the list below. Sign in to RSVP.
        </p>
      </div>

      <div className="mx-auto mt-8 w-full max-w-5xl px-6">
        <div className="overflow-hidden rounded-xl border border-line">
          <MapView pins={pins} />
        </div>
      </div>

      <section className="mx-auto mt-10 mb-16 w-full max-w-5xl px-6">
        <h2 className="font-display text-xl font-semibold">All Bashes</h2>
        {meetups.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line px-5 py-8 text-center text-ink-soft">
            No approved Bashes yet — check back soon, or{" "}
            <Link href="/dashboard" className="underline">
              organize one
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {meetups.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/meetup/${m.id}`}
                  className="block rounded-xl border border-line bg-card px-5 py-4 transition hover:border-accent"
                >
                  <p className="font-semibold">{m.fields.name}</p>
                  <p className="text-sm text-ink-soft">
                    {[m.fields.venue, m.fields.city, m.fields.date]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
