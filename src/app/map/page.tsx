import Link from "next/link";
import { getPublicMeetups, parseGeocode } from "@/lib/meetups";
import HdShell from "../HdShell";
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
    <HdShell back={{ href: "/dashboard", label: "dashboard" }} width={1040}>
      <p className="hd-eyebrow">worldwide</p>
      <h1 className="hd-title">find a Boba Bash near you</h1>
      <p className="hd-lede" style={{ marginTop: 6 }}>
        Pick a spot on the map, or browse the list below. Sign in to RSVP.
      </p>

      <div className="hd-mapframe sk card" style={{ marginTop: 18 }}>
        <MapView pins={pins} />
      </div>

      <section style={{ marginTop: 26 }}>
        <h2 className="hd-panel-title">all Bashes</h2>
        {meetups.length === 0 ? (
          <div className="hd-empty sk thin soft" style={{ marginTop: 12 }}>
            No approved Bashes yet — check back soon, or{" "}
            <Link href="/dashboard">organize one</Link>.
          </div>
        ) : (
          <ul className="hd-list">
            {meetups.map((m) => (
              <li key={m.id}>
                <Link href={`/meetup/${m.id}`} className="sk thin soft">
                  <span className="name">{m.fields.name}</span>
                  <span className="meta">
                    {[m.fields.venue, m.fields.city, m.fields.date]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </HdShell>
  );
}
