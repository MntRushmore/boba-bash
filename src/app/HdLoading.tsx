import { DoodleDefs } from "./dashboard/doodles";

/**
 * Full-screen hand-drawn loading state: a bobbing boba cup with pearls
 * jiggling inside + a rotating "brewing…" ring. Used by route loading.tsx files.
 */
export default function HdLoading({ label = "brewing…" }: { label?: string }) {
  return (
    <div className="hd hd-loading">
      <DoodleDefs />
      <div className="hd-loading-inner">
        <svg
          className="hd-loading-cup"
          viewBox="0 0 80 96"
          width="80"
          height="96"
          role="img"
          aria-label="Loading"
        >
          {/* cup */}
          <path
            d="M18 30 L62 30 L56 84 C55.4 89 51 92 46 92 L34 92 C29 92 24.6 89 24 84 Z"
            style={{ fill: "#e8c9a0", stroke: "var(--ink)", strokeWidth: 2.6, strokeLinejoin: "round", filter: "url(#wob)" }}
          />
          {/* lid */}
          <path
            d="M14 30 C14 24 66 24 66 30 C66 35 14 35 14 30 Z"
            style={{ fill: "#fff", stroke: "var(--ink)", strokeWidth: 2.6, filter: "url(#wob)" }}
          />
          {/* straw */}
          <path
            d="M48 14 L42 88"
            style={{ fill: "none", stroke: "var(--taro)", strokeWidth: 5, strokeLinecap: "round", filter: "url(#wob)" }}
          />
          {/* jiggling pearls */}
          <circle className="hd-loading-pearl p1" cx="34" cy="80" r="4" style={{ fill: "var(--tapioca)" }} />
          <circle className="hd-loading-pearl p2" cx="45" cy="82" r="4" style={{ fill: "var(--tapioca)" }} />
          <circle className="hd-loading-pearl p3" cx="40" cy="74" r="4" style={{ fill: "var(--tapioca)" }} />
        </svg>
        <p className="hd-loading-label marker">{label}</p>
      </div>
    </div>
  );
}
