import Link from "next/link";
import { DoodleDefs } from "./dashboard/doodles";

/**
 * A hand-drawn animated boba 404: a wobbling milk-tea cup with a rocking
 * liquid wave and tapioca pearls rising up the straw. Pure CSS/SVG, on-brand.
 */
export default function NotFound() {
  return (
    <div className="hd hd-404">
      <DoodleDefs />

      <div className="hd-404-cup" aria-hidden>
        <svg viewBox="0 0 200 300" width="200" height="300" role="img" aria-label="A boba cup">
          {/* clip so liquid + pearls stay inside the cup body */}
          <defs>
            <clipPath id="cupClip">
              <path d="M46 96 L154 96 L142 268 C141 278 133 284 122 284 L78 284 C67 284 59 278 58 268 Z" />
            </clipPath>
          </defs>

          {/* liquid fill + rocking wave (inside the clip) */}
          <g clipPath="url(#cupClip)">
            <rect x="40" y="128" width="120" height="172" fill="#d8a866" />
            <g className="hd-404-wave">
              <path
                d="M-40 130 q 30 -14 60 0 t 60 0 t 60 0 t 60 0 t 60 0 v 60 h -360 z"
                fill="#e8c9a0"
              />
            </g>
            {/* rising pearls */}
            {PEARLS.map((p, i) => (
              <circle
                key={i}
                className="hd-404-pearl"
                cx={p.x}
                r={p.r}
                cy="278"
                fill="#3a2618"
                style={{ animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}
              />
            ))}
          </g>

          {/* cup outline (drawn over the liquid) */}
          <g className="hd-404-ink">
            <path
              d="M46 96 L154 96 L142 268 C141 278 133 284 122 284 L78 284 C67 284 59 278 58 268 Z"
              fill="none"
            />
            {/* lid */}
            <path d="M40 96 C40 84 160 84 160 96 C160 104 40 104 40 96 Z" fill="#f6ecdd" />
            <path d="M56 84 L144 84 L150 96 L50 96 Z" fill="#fff" />
            {/* straw */}
            <path d="M118 40 L104 274" className="hd-404-straw" />
            <path d="M118 40 L104 274" className="hd-404-straw straw2" />
          </g>
        </svg>
      </div>

      <div className="hd-404-text">
        <p className="hd-404-code">404</p>
        <h1 className="hd-404-title">this cup&apos;s empty!</h1>
        <p className="hd-404-note">
          We couldn&apos;t find that page — looks like someone sipped it dry.
          Let&apos;s get you a fresh one.
        </p>
        <div className="hd-404-btns">
          <Link href="/dashboard" className="hd-bigbtn primary sk marker">
            back to dashboard ▸
          </Link>
          <Link href="/map" className="hd-bigbtn sk marker">
            find a Bash
          </Link>
        </div>
      </div>
    </div>
  );
}

// Pearls rise on a loop with staggered delays so the stream looks natural.
const PEARLS = [
  { x: 82, r: 6, delay: 0, dur: 3.2 },
  { x: 100, r: 7, delay: 0.6, dur: 3.6 },
  { x: 118, r: 6, delay: 1.1, dur: 3.0 },
  { x: 92, r: 5, delay: 1.7, dur: 3.8 },
  { x: 110, r: 6.5, delay: 2.3, dur: 3.4 },
  { x: 126, r: 5.5, delay: 0.9, dur: 4.0 },
  { x: 74, r: 5, delay: 2.0, dur: 3.5 },
];
