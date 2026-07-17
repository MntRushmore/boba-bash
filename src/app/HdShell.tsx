import Link from "next/link";
import { DoodleDefs, HackFlag } from "./dashboard/doodles";

/**
 * Shared hand-drawn page shell: the whiteboard-on-an-easel chrome (dark bezel,
 * cream board, paper grain) plus a compact top bar. Every non-dashboard page
 * renders its content inside this so the boba look stays consistent.
 *
 * `width` controls the centered content column; `back` renders a "← label"
 * link; `right` is an optional slot for a top-right action.
 */
export default function HdShell({
  children,
  back,
  right,
  width = 720,
  center = false,
  brandHref = "/dashboard",
}: {
  children: React.ReactNode;
  back?: { href: string; label: string };
  right?: React.ReactNode;
  width?: number;
  center?: boolean;
  brandHref?: string;
}) {
  return (
    <div className="hd hd-stage">
      <DoodleDefs />
      <div className="hd-frame">
        <div className="hd-board">
          <div className={`hd-page ${center ? "hd-page-center" : ""}`}>
            <div className="hd-pagebar">
              <Link href={brandHref} className="hd-brand" aria-label="Boba Bash">
                <HackFlag size={44} />
                <span className="hd-brand-word">
                  BOBA <span>BASH</span>
                </span>
              </Link>
              {right ? <div className="hd-pagebar-right">{right}</div> : null}
            </div>

            {back ? (
              <Link href={back.href} className="hd-backlink">
                ← {back.label}
              </Link>
            ) : null}

            <div className="hd-pagebody" style={{ maxWidth: width }}>
              {children}
            </div>
          </div>

          <svg className="hd-grain" width="100%" height="100%" aria-hidden>
            <rect width="100%" height="100%" filter="url(#paper)" />
          </svg>
        </div>
      </div>
      <div className="hd-tray" />
    </div>
  );
}
