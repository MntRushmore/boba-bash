"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  name: string;
  venue?: string;
  city?: string;
  date?: string;
}

// Custom boba-pearl marker — avoids the default-icon 404 under bundlers.
const bobaIcon = new DivIcon({
  className: "",
  html: `<div style="
    width:22px;height:22px;border-radius:50%;
    background:radial-gradient(circle at 32% 30%, #4a3016, #241505 70%);
    box-shadow:0 0 0 3px #f6d193, 0 1px 4px rgba(0,0,0,.4);
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -12],
});

export default function MapInner({ pins }: { pins: MapPin[] }) {
  // Center on the mean of the pins, or a US-ish default.
  const center: [number, number] = pins.length
    ? [
        pins.reduce((s, p) => s + p.lat, 0) / pins.length,
        pins.reduce((s, p) => s + p.lng, 0) / pins.length,
      ]
    : [39.5, -98.35];

  return (
    <MapContainer
      center={center}
      zoom={pins.length ? 4 : 3}
      scrollWheelZoom
      style={{ height: "70vh", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {pins.map((pin) => (
        <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={bobaIcon}>
          <Popup>
            <strong style={{ fontSize: "1rem" }}>{pin.name}</strong>
            <br />
            {[pin.venue, pin.city, pin.date].filter(Boolean).join(" · ")}
            <br />
            <a href={`/meetup/${pin.id}`} style={{ fontWeight: 600 }}>
              View &amp; RSVP →
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
