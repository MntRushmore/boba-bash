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

// Hand-drawn boba-cup marker — matches the dashboard globe pins. A little
// milk-tea cup with a taro straw and three tapioca pearls, ink outline.
const bobaIcon = new DivIcon({
  className: "hd-map-marker",
  html: `<svg width="30" height="38" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))">
    <path d="M7 11 L23 11 L20.5 32 C20.3 34 18.6 35 17 35 L13 35 C11.4 35 9.7 34 9.5 32 Z" fill="#e8c9a0" stroke="#3a2618" stroke-width="2" stroke-linejoin="round"/>
    <path d="M5 11 C5 8 25 8 25 11 C25 13 5 13 5 11 Z" fill="#ffffff" stroke="#3a2618" stroke-width="2"/>
    <path d="M18 3 L15.5 33" fill="none" stroke="#b892d8" stroke-width="3" stroke-linecap="round"/>
    <circle cx="12.5" cy="30" r="1.7" fill="#3a2618"/>
    <circle cx="16.5" cy="30.6" r="1.7" fill="#3a2618"/>
    <circle cx="14.5" cy="27.6" r="1.7" fill="#3a2618"/>
  </svg>`,
  iconSize: [30, 38],
  iconAnchor: [15, 35],
  popupAnchor: [0, -32],
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
