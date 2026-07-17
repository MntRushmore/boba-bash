"use client";

import { useState } from "react";

export default function ReferralLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — the input is selectable as a fallback.
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        readOnly
        value={link}
        onFocus={(e) => e.currentTarget.select()}
        aria-label="Your referral link"
        className="flex-1 rounded-lg border border-line bg-paper px-4 py-2.5 font-mono text-sm text-ink outline-none focus:border-accent"
      />
      <button
        type="button"
        onClick={copy}
        className="rounded-full bg-accent px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-accent-contrast transition hover:-translate-y-0.5"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
