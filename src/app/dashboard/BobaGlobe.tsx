"use client";

import { useState } from "react";
import Link from "next/link";

export type GlobePin = {
  id: string;
  name: string;
  city?: string;
  date?: string;
  venue?: string;
  lat: number;
  lng: number;
};

// Globe geometry inside the 470x322 viewBox.
const CX = 228;
const CY = 164;
const R = 124;

/**
 * Project lat/lng onto the flat scribble disc. Not cartographically true —
 * an equirectangular squeeze clamped inside the circle so every real Bash
 * lands somewhere believable on the globe rather than off the edge.
 */
function project(lat: number, lng: number) {
  const nx = Math.max(-1, Math.min(1, lng / 180)); // -1..1
  const ny = Math.max(-1, Math.min(1, lat / 90)); // -1..1
  let dx = nx * R * 0.86;
  let dy = -ny * R * 0.82;
  // pull points inside the disc if the naive projection overshoots
  const d = Math.hypot(dx, dy);
  const max = R * 0.9;
  if (d > max) {
    dx *= max / d;
    dy *= max / d;
  }
  return { x: CX + dx, y: CY + dy };
}

/** Static hand-drawn continents + sweeping straws. Shared by inline + overlay. */
function GlobeArt() {
  return (
    <>
      <path d="M20 96 C140 54 320 66 452 178" style={{ stroke: "#3aa0d8", strokeWidth: 2.6 }} />
      <circle cx={CX} cy={CY} r={R} style={{ fill: "var(--ocean)", strokeWidth: 4.4 }} />
      <path
        d="M136 206 C166 218 186 222 210 220 M296 252 C318 242 332 230 342 214"
        style={{ stroke: "#7ec3e4", strokeWidth: 2 }}
      />
      <path d="M170 58 C185 46 212 46 224 58 C218 70 196 74 180 70 C172 66 168 62 170 58 Z" style={{ fill: "var(--conf-teal)" }} />
      <path d="M148 80 C164 62 200 58 216 72 C228 82 224 98 210 102 C220 108 216 120 206 126 C194 138 184 148 172 152 C156 154 142 140 138 122 C132 106 138 92 148 80 Z" style={{ fill: "var(--taro)" }} />
      <path d="M186 154 C196 150 204 156 206 166 C200 172 190 170 186 162 Z" style={{ fill: "var(--conf-orange)" }} />
      <path d="M198 172 C216 162 234 170 236 190 C238 214 228 248 212 262 C200 252 190 222 188 198 C187 184 190 178 198 172 Z" style={{ fill: "#7fbf6a" }} />
      <path d="M260 74 C274 62 296 64 304 78 C298 90 280 96 266 92 C258 88 256 80 260 74 Z" style={{ fill: "#7fbf6a" }} />
      <path d="M254 100 C274 90 306 94 316 112 C318 122 310 130 296 132 L264 130 C252 122 248 110 254 100 Z" style={{ fill: "var(--conf-yellow)" }} />
      <path d="M264 130 L296 132 C308 138 312 154 308 172 C302 198 288 226 272 238 C260 226 250 196 248 168 C247 150 254 136 264 130 Z" style={{ fill: "var(--conf-pink)" }} />
      <path d="M308 80 C328 64 348 72 351 94 C352 112 344 126 330 130 C338 136 336 148 326 152 C314 156 302 146 299 132 C305 126 306 118 304 110 C300 96 302 88 308 80 Z" style={{ fill: "var(--conf-orange)" }} />
      <path d="M318 134 C328 130 336 138 334 150 C330 160 320 160 316 150 C314 144 314 138 318 134 Z" style={{ fill: "var(--conf-pink)" }} />
      <path d="M318 226 C330 218 346 222 348 234 C346 246 330 250 320 242 C314 236 314 232 318 226 Z" style={{ fill: "var(--conf-orange)" }} />
      <path d="M14 240 C120 270 330 234 456 128" style={{ stroke: "var(--conf-pink)", strokeWidth: 3 }} />
    </>
  );
}

function NextDropMark({ nextDrop }: { nextDrop: string }) {
  return (
    <>
      <text x="16" y="34" style={{ fontFamily: "var(--font-marker)", fontSize: 15, fill: "var(--blue)", stroke: "none", filter: "none" }}>
        next drop:
      </text>
      <text x="24" y="53" style={{ fontFamily: "var(--font-marker)", fontSize: 15, fill: "var(--blue)", stroke: "none", filter: "none" }}>
        {nextDrop}
      </text>
    </>
  );
}

/** One interactive pin: an ink dot + haloed label; hover shows a tooltip. */
function Pin({
  pin,
  onHover,
}: {
  pin: GlobePin;
  onHover: (p: GlobePin | null) => void;
}) {
  const { x, y } = project(pin.lat, pin.lng);
  const label = (pin.city || pin.name).toLowerCase();
  const labelRight = x < CX; // keep labels from running off the right edge
  return (
    <g
      className="hd-globe-pin"
      onMouseEnter={() => onHover(pin)}
      onMouseLeave={() => onHover(null)}
      tabIndex={0}
      onFocus={() => onHover(pin)}
      onBlur={() => onHover(null)}
      role="img"
      aria-label={pin.name}
    >
      {/* generous invisible hit target */}
      <circle cx={x} cy={y} r={12} style={{ fill: "transparent", stroke: "none", filter: "none" }} />
      <circle className="hd-pin-ring" cx={x} cy={y} r={7} style={{ fill: "none", stroke: "var(--red)", filter: "none" }} />
      <circle cx={x} cy={y} r={3.6} style={{ fill: "var(--red)", stroke: "var(--red)", filter: "none" }} />
      <text
        x={labelRight ? x + 9 : x - 9}
        y={y - 8}
        style={{
          fontFamily: "var(--font-pangolin)",
          fontSize: 11.5,
          fill: "var(--ink)",
          stroke: "#f6ecdd",
          strokeWidth: 3,
          paintOrder: "stroke",
          filter: "none",
          textAnchor: labelRight ? "start" : "end",
        }}
      >
        {label}
      </text>
    </g>
  );
}

function GlobeSvg({
  pins,
  nextDrop,
  onHover,
}: {
  pins: GlobePin[];
  nextDrop?: string;
  onHover: (p: GlobePin | null) => void;
}) {
  return (
    <svg
      className="doodle"
      width="100%"
      height="100%"
      viewBox="0 0 470 322"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Worldwide boba map"
    >
      <GlobeArt />
      {nextDrop ? <NextDropMark nextDrop={nextDrop} /> : null}
      {pins.map((p) => (
        <Pin key={p.id} pin={p} onHover={onHover} />
      ))}
    </svg>
  );
}

export default function BobaGlobe({
  pins,
  nextDrop,
  countries,
  cups,
  status,
  statusOk,
}: {
  pins: GlobePin[];
  nextDrop?: string;
  countries: number;
  cups: number;
  status: string;
  statusOk?: boolean;
}) {
  const [hover, setHover] = useState<GlobePin | null>(null);
  const [open, setOpen] = useState(false);

  const detail = (p: GlobePin) =>
    [p.venue, p.city, p.date].filter(Boolean).join(" · ");

  return (
    <div className="hd-preview sk card r2">
      <div className="hd-panel-h light">
        boba radar · worldwide
        <button
          type="button"
          className="hd-expand-btn marker"
          onClick={() => setOpen(true)}
          aria-label="Expand the globe"
        >
          expand ⤢
        </button>
      </div>

      <button
        type="button"
        className="hd-pv-body hd-globe-hit"
        onClick={() => setOpen(true)}
        aria-label="Expand the worldwide boba map"
      >
        <GlobeSvg pins={pins} nextDrop={nextDrop} onHover={setHover} />
        {hover ? (
          <span className="hd-globe-tip">
            <b>{hover.name}</b>
            {detail(hover) ? <span>{detail(hover)}</span> : null}
          </span>
        ) : null}
      </button>

      <div className="hd-readouts">
        <span className="hd-chiplet sk thin soft">
          <b>{countries}</b> countries
        </span>
        <span className="hd-chiplet sk thin soft r2">
          <b>{cups.toLocaleString()}</b> cups
        </span>
        <span
          className="hd-chiplet sk thin soft r2"
          style={{ color: statusOk ? "var(--green)" : "var(--ink-soft)" }}
        >
          {status}
        </span>
      </div>

      {open ? (
        <div
          className="hd-globe-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Worldwide boba map"
          onClick={() => setOpen(false)}
        >
          <div className="hd-globe-modal sk card" onClick={(e) => e.stopPropagation()}>
            <div className="hd-modal-head">
              <span className="marker hd-modal-title">
                BOBA RADAR · <span style={{ color: "var(--red)" }}>WORLDWIDE</span>
              </span>
              <button
                type="button"
                className="hd-modal-close marker"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                close ✕
              </button>
            </div>
            <div className="hd-modal-body">
              <div className="hd-modal-globe">
                <GlobeSvg pins={pins} nextDrop={nextDrop} onHover={setHover} />
              </div>
              <div className="hd-modal-list">
                <div className="hd-xp-h">
                  {pins.length
                    ? `${pins.length} bash${pins.length === 1 ? "" : "es"} on the map`
                    : "no Bashes on the map yet"}
                </div>
                <ul>
                  {pins.map((p) => (
                    <li key={p.id}>
                      <Link href={`/meetup/${p.id}`} className="hd-modal-bash sk thin soft">
                        <span className="hd-modal-dot" />
                        <span>
                          <b>{p.name}</b>
                          {detail(p) ? <em>{detail(p)}</em> : null}
                        </span>
                      </Link>
                    </li>
                  ))}
                  {!pins.length ? (
                    <li className="hd-modal-empty">
                      Approved Bashes show up here. Be the first to drop a pin!
                    </li>
                  ) : null}
                </ul>
                <Link href="/map" className="hd-bigbtn sk marker">
                  open full map ▸
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
