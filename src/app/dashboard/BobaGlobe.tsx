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

const GRID = "#8fb9d6"; // soft meridian/parallel lines

/**
 * The turning layer: soft muted land shapes + vertical meridian lines, drawn
 * twice (offset by the disc diameter) so scrolling the group left loops
 * seamlessly. Clipped to the sphere by the caller.
 */
function SpinLayer() {
  return (
    <>
      {/* meridian lines — evenly spaced verticals, curved as ellipse halves */}
      {[52, 104, 156, 208].map((x) => (
        <path
          key={x}
          d={`M${x} ${CY - R} Q ${x + 20} ${CY} ${x} ${CY + R}`}
          style={{ fill: "none", stroke: GRID, strokeWidth: 1.1, opacity: 0.55 }}
        />
      ))}
      {/* a few soft continents in muted brand tints, no outline */}
      <path
        d="M60 120 C78 104 104 108 112 128 C118 146 104 168 84 172 C66 174 52 158 52 140 C52 132 54 126 60 120 Z"
        style={{ fill: "var(--matcha, #9ecb8f)", opacity: 0.9 }}
      />
      <path
        d="M120 96 C140 86 166 92 170 112 C172 132 158 150 140 156 C150 164 146 182 130 190 C112 196 96 182 96 162 C96 150 104 140 112 132 C104 122 108 106 120 96 Z"
        style={{ fill: "var(--taro)", opacity: 0.85 }}
      />
      <path
        d="M110 176 C128 168 146 178 148 198 C150 224 136 250 120 258 C108 246 100 214 100 192 C100 182 104 180 110 176 Z"
        style={{ fill: "#c39cdd", opacity: 0.8 }}
      />
      <path
        d="M188 132 C206 124 224 134 226 152 C224 170 206 178 190 172 C182 166 180 148 188 132 Z"
        style={{ fill: "#e0b27a", opacity: 0.85 }}
      />
      <path
        d="M170 214 C186 208 202 216 202 232 C200 246 184 250 172 244 C164 238 162 224 170 214 Z"
        style={{ fill: "var(--matcha, #9ecb8f)", opacity: 0.85 }}
      />
    </>
  );
}

/**
 * A clean flat-vector globe: soft blue sphere with a subtle spherical highlight,
 * static latitude lines, a spinning grid+land layer clipped to the disc, and a
 * thin rim. No heavy outline, no clutter.
 */
function GlobeArt({ spin, uid }: { spin?: boolean; uid: string }) {
  const clip = `globeClip-${uid}`;
  const sphere = `globeSphere-${uid}`;
  const glow = `globeGlow-${uid}`;
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <circle cx={CX} cy={CY} r={R} />
        </clipPath>
        <radialGradient id={sphere} cx="40%" cy="34%" r="75%">
          <stop offset="0%" stopColor="#dcecf6" />
          <stop offset="60%" stopColor="#bcd7ea" />
          <stop offset="100%" stopColor="#9cbfda" />
        </radialGradient>
        <radialGradient id={glow} cx="36%" cy="30%" r="45%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ocean sphere */}
      <circle cx={CX} cy={CY} r={R} style={{ fill: `url(#${sphere})`, stroke: "none", filter: "none" }} />

      <g clipPath={`url(#${clip})`}>
        {/* static parallels (latitude lines) */}
        {[-78, -40, 0, 40, 78].map((dy) => (
          <ellipse
            key={dy}
            cx={CX}
            cy={CY + dy}
            rx={Math.sqrt(Math.max(0, R * R - dy * dy))}
            ry={7}
            style={{ fill: "none", stroke: GRID, strokeWidth: 1.1, opacity: 0.45 }}
          />
        ))}

        {/* spinning land + meridians */}
        <g className={spin ? "hd-globe-spin" : undefined}>
          <g>
            <SpinLayer />
          </g>
          <g transform={`translate(${2 * R} 0)`}>
            <SpinLayer />
          </g>
        </g>

        {/* soft top-left highlight for sphericity */}
        <circle cx={CX} cy={CY} r={R} style={{ fill: `url(#${glow})`, stroke: "none", filter: "none" }} />
      </g>

      {/* thin rim */}
      <circle
        cx={CX}
        cy={CY}
        r={R}
        style={{ fill: "none", stroke: "#7ea6c4", strokeWidth: 1.6, filter: "none" }}
      />
    </>
  );
}

function NextDropMark({ nextDrop }: { nextDrop: string }) {
  return (
    <>
      <text x="16" y="34" style={{ fontFamily: "var(--font-sans)", fontSize: 15, fill: "var(--blue)", stroke: "none", filter: "none" }}>
        next drop:
      </text>
      <text x="24" y="53" style={{ fontFamily: "var(--font-sans)", fontSize: 15, fill: "var(--blue)", stroke: "none", filter: "none" }}>
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
          fontFamily: "var(--font-sans)",
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
  spin,
  uid,
}: {
  pins: GlobePin[];
  nextDrop?: string;
  onHover: (p: GlobePin | null) => void;
  spin?: boolean;
  uid: string;
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
      <GlobeArt spin={spin} uid={uid} />
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
        <GlobeSvg pins={pins} nextDrop={nextDrop} onHover={setHover} spin uid="inline" />
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
                <GlobeSvg pins={pins} nextDrop={nextDrop} onHover={setHover} spin uid="modal" />
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
