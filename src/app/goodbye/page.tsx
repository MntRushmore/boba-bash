import Link from "next/link";
import HdShell from "../HdShell";
import { CupStat } from "../dashboard/doodles";

export const metadata = { title: "Signed out · Boba Bash" };

/** Themed goodbye shown after /signout clears the session. */
export default function Goodbye() {
  return (
    <HdShell center width={440} brandHref="/">
      <div className="hd-panel sk card" style={{ textAlign: "center" }}>
        <span style={{ display: "inline-block", opacity: 0.85 }}>
          <CupStat size={54} />
        </span>
        <p className="hd-eyebrow" style={{ marginTop: 8 }}>
          see you soon
        </p>
        <h1 className="hd-title">you&apos;re signed out</h1>
        <p className="hd-lede" style={{ margin: "8px auto 0" }}>
          Your cup&apos;s been cleared. Come back any time — the boba&apos;s
          always fresh.
        </p>
        <div style={{ marginTop: 20 }}>
          <Link href="/signin" className="hd-bigbtn primary sk marker">
            sign back in ▸
          </Link>
        </div>
      </div>
    </HdShell>
  );
}
