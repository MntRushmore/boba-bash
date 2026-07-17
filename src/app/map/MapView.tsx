"use client";

import dynamic from "next/dynamic";
import type { MapPin } from "./MapInner";

// ssr:false must live inside a client component (not allowed in a server one).
const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[70vh] place-items-center bg-paper-2 text-ink-soft">
      Loading map…
    </div>
  ),
});

export default function MapView({ pins }: { pins: MapPin[] }) {
  return <MapInner pins={pins} />;
}
