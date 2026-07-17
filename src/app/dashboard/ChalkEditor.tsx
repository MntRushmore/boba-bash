"use client";

import { useState } from "react";

/**
 * The chalkboard "editor" panel. For organizers it renders the referral link
 * as a syntax-highlighted snippet you can copy with one click; the whole panel
 * is the copy affordance. For attendees it shows their build checklist as code.
 */
export default function ChalkEditor({
  link,
  firstName,
}: {
  link: string;
  firstName: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — link is still visible to copy by hand */
    }
  }

  const lines = 12;

  return (
    <div className="hd-editor sk dark tilt-s">
      <div className="hd-panel-h">
        <svg className="doodle" width="15" height="15" viewBox="0 0 16 16" aria-hidden>
          <path d="M5 3 L11 8 L5 13" style={{ stroke: "var(--c-blue)" }} />
        </svg>
        referral_link.js
        <span
          style={{
            marginLeft: "auto",
            color: "var(--chalk-dim)",
            fontFamily: "var(--font-pangolin)",
            fontSize: 12,
          }}
        >
          $8.50 / signup · autosave ✓
        </span>
      </div>

      <div className="hd-code">
        <div className="hd-lns">
          {Array.from({ length: lines }, (_, i) => i + 1).join("\n")}
        </div>
        <div className="hd-codelines">
          <span className="cm">{`// your referral link — every real signup earns you`}</span>
          {"\n"}
          <span className="cm">{`// $8.50 toward the food. share it everywhere.`}</span>
          {"\n\n"}
          <span className="kw">const</span> <span className="fn">organizer</span> ={" "}
          <span className="str">&quot;{firstName || "you"}&quot;</span>;{"\n"}
          <span className="kw">const</span> payout ={" "}
          <span className="num">8.5</span>; <span className="cm">{`// per cleared signup`}</span>
          {"\n\n"}
          <span className="kw">export const</span> <span className="fn">link</span> =
          {"\n"}
          <span className="hl-line">
            {"  "}
            <span className="str">&quot;{link}&quot;</span>;
          </span>
          {"\n\n"}
          <span className="fn">share</span>(link).<span className="fn">then</span>(
          <span className="fn">bringFriends</span>);{"\n"}
          <span className="cm">{`// TODO: free boba, one signup at a time.`}</span>
        </div>
      </div>

      <div style={{ padding: "8px 16px 12px", display: "flex", gap: 10, alignItems: "center" }}>
        <button
          type="button"
          onClick={copy}
          className="marker"
          style={{
            background: copied ? "var(--c-green)" : "rgba(255,255,255,.08)",
            color: copied ? "#1d5a28" : "var(--chalk)",
            border: "1.6px solid rgba(233,231,222,.35)",
            borderRadius: "8px 14px 10px 12px",
            padding: "6px 16px",
            fontSize: 13.5,
            cursor: "pointer",
          }}
        >
          {copied ? "copied ✓" : "copy link ▸"}
        </button>
        <span style={{ color: "var(--chalk-dim)", fontSize: 12.5 }}>
          {copied ? "paste it in your group chat!" : "one click, then paste anywhere"}
        </span>
      </div>
    </div>
  );
}
