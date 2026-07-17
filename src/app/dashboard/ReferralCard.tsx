"use client";

import { useState } from "react";

/**
 * The organizer's referral link as a plain hand-drawn card: the link in a
 * readable pill + a one-click copy button. Earns $8.50 per cleared signup.
 */
export default function ReferralCard({
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
      /* clipboard blocked — the field is still selectable by hand */
    }
  }

  return (
    <div className="hd-cardpanel sk card tilt-s">
      <div className="hd-panel-h light">
        your referral link
        <span className="hd-panel-meta">$8.50 / signup</span>
      </div>
      <div className="hd-cardbody">
        <p className="hd-cardnote">
          {firstName ? `${firstName}, ` : ""}every real signup who joins through
          this link earns you <b>$8.50</b> toward the food. share it everywhere!
        </p>

        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Your referral link"
          className="hd-linkfield sk thin soft"
        />

        <div className="hd-btnrow">
          <button
            type="button"
            onClick={copy}
            className={`hd-bigbtn sk marker ${copied ? "done" : ""}`}
          >
            {copied ? "copied ✓" : "copy link ▸"}
          </button>
          <span className="hd-cardnote" style={{ margin: 0 }}>
            {copied ? "paste it in your group chat!" : "one click, then paste anywhere"}
          </span>
        </div>
      </div>
    </div>
  );
}
