/*
 * Hand-drawn doodle SVGs for the whiteboard-IDE dashboard.
 * Every icon is a single continuous-marker pass: 2.1px round-cap strokes,
 * no fills except tiny ink dots. Strokes wobble via the shared #wob filter.
 */

/** Shared squiggle filters + paper grain. Render once near the root. */
export function DoodleDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <defs>
        <filter id="wob" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014"
            numOctaves={2}
            seed={7}
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
        </filter>
        <filter id="wob2" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.026"
            numOctaves={2}
            seed={11}
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5.5" />
        </filter>
        <filter id="paper">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} />
        </filter>
      </defs>
    </svg>
  );
}

type IconProps = { size?: number; className?: string; title?: string };

export const FilesIcon = ({ size = 24, className, title }: IconProps) => (
  <svg
    className={`doodle ${className ?? ""}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    role="img"
    aria-label={title}
  >
    {title ? <title>{title}</title> : null}
    <path d="M4 4 L13 4 L16 8 L20 8 L20 20 L4 20 Z" />
    <path d="M13 4 L13 8 L16 8" />
  </svg>
);

export const GlobeIcon = ({ size = 26, className, title }: IconProps) => (
  <svg
    className={`doodle ${className ?? ""}`}
    width={size}
    height={size}
    viewBox="0 0 26 26"
    role="img"
    aria-label={title}
  >
    {title ? <title>{title}</title> : null}
    <circle cx="13" cy="13" r="10.5" />
    <path d="M13 2.5 L13 23.5" style={{ strokeWidth: 1.6 }} />
    <path d="M2.5 13 L23.5 13" style={{ strokeWidth: 1.6 }} />
    <path
      d="M6 5.5 C10 9 16 9 20 5.5 M6 20.5 C10 17 16 17 20 20.5"
      style={{ strokeWidth: 1.6 }}
    />
  </svg>
);

export const CupIcon = ({ size = 24, className, title }: IconProps) => (
  <svg
    className={`doodle ${className ?? ""}`}
    width={size}
    height={(size * 28) / 24}
    viewBox="0 0 24 28"
    role="img"
    aria-label={title}
  >
    {title ? <title>{title}</title> : null}
    <path d="M6 8 L18 8 L16.2 25 L7.8 25 Z" style={{ fill: "#fff" }} />
    <path d="M5.5 8 C5.5 3.5 18.5 3.5 18.5 8" />
    <path d="M11 8 L14.5 1 L16.8 1.8 L13.2 8.4" style={{ stroke: "var(--conf-pink)" }} />
    <path d="M7.4 14 C10 15.4 14 15.4 16.6 14" style={{ strokeWidth: 1.5 }} />
    <circle cx="9.7" cy="22" r="1.3" style={{ fill: "var(--tapioca)", stroke: "var(--tapioca)" }} />
    <circle cx="13.4" cy="22.4" r="1.3" style={{ fill: "var(--tapioca)", stroke: "var(--tapioca)" }} />
    <circle cx="11.6" cy="19.6" r="1.3" style={{ fill: "var(--tapioca)", stroke: "var(--tapioca)" }} />
  </svg>
);

export const TrophyIcon = ({ size = 24, className, title }: IconProps) => (
  <svg
    className={`doodle ${className ?? ""}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    role="img"
    aria-label={title}
  >
    {title ? <title>{title}</title> : null}
    <path d="M8 4 L16 4 L16 12 C16 15 8 15 8 12 Z" />
    <path d="M8 6 C5 6 5 10 8 10 M16 6 C19 6 19 10 16 10" />
    <path d="M12 15 L12 18 M9 20 L15 20" />
  </svg>
);

export const GalleryIcon = ({ size = 24, className, title }: IconProps) => (
  <svg
    className={`doodle ${className ?? ""}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    role="img"
    aria-label={title}
  >
    {title ? <title>{title}</title> : null}
    <rect x="4" y="5" width="16" height="14" rx="2" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="M5 17 L10 12 L14 16 L17 13 L19 15" />
  </svg>
);

export const SettingsIcon = ({ size = 24, className, title }: IconProps) => (
  <svg
    className={`doodle ${className ?? ""}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    role="img"
    aria-label={title}
  >
    {title ? <title>{title}</title> : null}
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3 L12 6 M12 18 L12 21 M3 12 L6 12 M18 12 L21 12 M5.5 5.5 L7.7 7.7 M16.3 16.3 L18.5 18.5 M18.5 5.5 L16.3 7.7 M7.7 16.3 L5.5 18.5" />
  </svg>
);

export const ShareIcon = ({ size = 24, className, title }: IconProps) => (
  <svg
    className={`doodle ${className ?? ""}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    role="img"
    aria-label={title}
  >
    {title ? <title>{title}</title> : null}
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="5" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M9 10.5 L15 6.5 M9 13.5 L15 17.5" />
  </svg>
);

export const BellIcon = ({ size = 24, className, title }: IconProps) => (
  <svg
    className={`doodle ${className ?? ""}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    role="img"
    aria-label={title}
  >
    {title ? <title>{title}</title> : null}
    <path d="M6 17 C7 12 6 7 12 6 C18 7 17 12 18 17 Z" />
    <path d="M10 20 C11 22 13 22 14 20" />
  </svg>
);

export const LogoutIcon = ({ size = 24, className, title }: IconProps) => (
  <svg
    className={`doodle ${className ?? ""}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    role="img"
    aria-label={title}
  >
    {title ? <title>{title}</title> : null}
    <path d="M14 4 L5 4 L5 20 L14 20" />
    <path d="M10 12 L21 12 M17 8 L21 12 L17 16" />
  </svg>
);

export const PlayIcon = ({ size = 24, className, title }: IconProps) => (
  <svg
    className={`doodle ${className ?? ""}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    role="img"
    aria-label={title}
  >
    {title ? <title>{title}</title> : null}
    <path d="M7 4 L20 12 L7 20 Z" style={{ stroke: "var(--green)" }} />
  </svg>
);

export const SearchIcon = ({ size = 15, className }: IconProps) => (
  <svg className={`doodle ${className ?? ""}`} width={size} height={size} viewBox="0 0 16 16" aria-hidden>
    <circle cx="6.5" cy="6.5" r="4.5" />
    <path d="M10 10 L14 14" />
  </svg>
);

export const CaretDown = ({ size = 13 }: IconProps) => (
  <svg className="doodle" width={size} height={size} viewBox="0 0 16 16" aria-hidden>
    <path d="M4 6 L8 11 L12 6" />
  </svg>
);

export const CaretRight = ({ size = 13 }: IconProps) => (
  <svg className="doodle" width={size} height={size} viewBox="0 0 16 16" aria-hidden>
    <path d="M6 4 L11 8 L6 12" />
  </svg>
);

/** Checklist box — checked (green tick) or empty. */
export const CheckBox = ({ checked, size = 15 }: { checked?: boolean; size?: number }) => (
  <svg className="doodle" width={size} height={size} viewBox="0 0 16 16" aria-hidden>
    <rect x="2" y="2" width="12" height="12" rx="3" />
    {checked ? (
      <path d="M4 8 L7 11 L13 3" style={{ stroke: "var(--green)", strokeWidth: 2.6 }} />
    ) : null}
  </svg>
);

export const LockIcon = ({ size = 12 }: { size?: number }) => (
  <svg className="doodle" width={size} height={(size * 15) / 12} viewBox="0 0 14 15" aria-hidden>
    <rect x="2" y="7" width="10" height="7" rx="2" />
    <path d="M4 7 L4 4 C4 1 10 1 10 4 L10 7" />
  </svg>
);

export const PeopleIcon = ({ size = 36, className, title }: IconProps) => (
  <svg
    className={`doodle ${className ?? ""}`}
    width={size}
    height={size}
    viewBox="0 0 36 36"
    role="img"
    aria-label={title}
  >
    {title ? <title>{title}</title> : null}
    <circle cx="13" cy="12" r="5" />
    <path d="M5 30 C5 21 21 21 21 30" />
    <circle cx="26" cy="14" r="4" />
    <path d="M20 28 C21 23 31 23 32 28" />
  </svg>
);

/** Big filled boba cup for a stat card. */
export const CupStat = ({ size = 34, title }: IconProps) => (
  <svg
    className="doodle ic"
    width={size}
    height={(size * 38) / 34}
    viewBox="0 0 24 28"
    role="img"
    aria-label={title}
  >
    {title ? <title>{title}</title> : null}
    <path d="M6 8 L18 8 L16.2 25 L7.8 25 Z" style={{ fill: "#fff" }} />
    <path d="M5.5 8 C5.5 3.5 18.5 3.5 18.5 8" />
    <path d="M11 8 L14.5 1 L16.8 1.8 L13.2 8.4" style={{ stroke: "var(--conf-pink)" }} />
    <path d="M7.4 14 C10 15.4 14 15.4 16.6 14" style={{ strokeWidth: 1.5 }} />
    <circle cx="9.7" cy="22" r="1.3" style={{ fill: "var(--tapioca)", stroke: "var(--tapioca)" }} />
    <circle cx="13.4" cy="22.4" r="1.3" style={{ fill: "var(--tapioca)", stroke: "var(--tapioca)" }} />
    <circle cx="11.6" cy="19.6" r="1.3" style={{ fill: "var(--tapioca)", stroke: "var(--tapioca)" }} />
  </svg>
);

/** The little Hack Club pennant flag next to the wordmark. */
export const HackFlag = ({ size = 52 }: { size?: number }) => (
  <svg
    className="doodle"
    width={size}
    height={(size * 34) / 52}
    viewBox="0 0 52 34"
    role="img"
    aria-label="Hack Club"
  >
    <path d="M6 32 C5 20 5 10 6 4" />
    <path
      d="M6 4 C20 -1 30 9 48 3 C46 9 46 13 48 19 C32 24 20 15 6 18"
      style={{ fill: "#f2739e", stroke: "#b23a63" }}
    />
    <text x="12" y="14" style={{ fontFamily: "var(--font-sans)", fontSize: 8, fill: "#fff", stroke: "none", filter: "none" }}>
      HACK
    </text>
    <text
      x="16"
      y="21"
      transform="rotate(1 16 21)"
      style={{ fontFamily: "var(--font-sans)", fontSize: 7, fill: "#fff", stroke: "none", filter: "none" }}
    >
      CLUB
    </text>
  </svg>
);
