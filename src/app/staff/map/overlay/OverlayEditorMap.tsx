"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, ImageOverlay, Marker, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const FAIRCHILD_CENTER: [number, number] = [25.677, -80.273];

// Default starting bounds when a new image is first loaded
const DEFAULT_SW: [number, number] = [25.6730, -80.2785];
const DEFAULT_NE: [number, number] = [25.6820, -80.2675];

// Corner handle icon — white square with green border
const makeCornerIcon = (label: string) =>
  L.divIcon({
    html: `<div title="${label}" style="
      width:22px;height:22px;
      background:white;
      border:3px solid #6A8468;
      border-radius:4px;
      cursor:grab;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
      font-size:8px;font-weight:700;color:#6A8468;
    ">${label}</div>`,
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

const NW_ICON = makeCornerIcon("NW");
const NE_ICON = makeCornerIcon("NE");
const SW_ICON = makeCornerIcon("SW");
const SE_ICON = makeCornerIcon("SE");

function FlyToGarden() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([DEFAULT_SW, DEFAULT_NE], { padding: [40, 40] });
  }, [map]);
  return null;
}

type Bounds = { sw: [number, number]; ne: [number, number] };

type Props = {
  imageUrl: string | null;
  bounds: Bounds;
  opacity: number;
  onChange: (b: Bounds) => void;
};

export default function OverlayEditorMap({ imageUrl, bounds, opacity, onChange }: Props) {
  const { sw, ne } = bounds;

  // 4 corners derived from SW + NE
  const nw: [number, number] = [ne[0], sw[1]];
  const se: [number, number] = [sw[0], ne[1]];

  function handleDrag(corner: "sw" | "ne" | "nw" | "se", latlng: L.LatLng) {
    const lat = latlng.lat;
    const lng = latlng.lng;
    const next = { sw: [...sw] as [number, number], ne: [...ne] as [number, number] };
    if (corner === "sw") { next.sw = [lat, lng]; }
    if (corner === "ne") { next.ne = [lat, lng]; }
    if (corner === "nw") { next.ne[0] = lat; next.sw[1] = lng; }
    if (corner === "se") { next.sw[0] = lat; next.ne[1] = lng; }
    onChange(next);
  }

  const overlayBounds: L.LatLngBoundsExpression = [sw, ne];

  return (
    <MapContainer
      center={FAIRCHILD_CENTER}
      zoom={16}
      className="h-full w-full"
      zoomControl={false}
      scrollWheelZoom
    >
      <FlyToGarden />
      <ZoomControl position="topright" />
      <TileLayer
        attribution='&copy; OpenStreetMap &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png"
        maxZoom={20}
      />

      {imageUrl && (
        <ImageOverlay
          url={imageUrl}
          bounds={overlayBounds}
          opacity={opacity}
          zIndex={10}
        />
      )}

      {imageUrl && (
        <>
          {/* SW — bottom-left */}
          <Marker
            position={sw}
            icon={SW_ICON}
            draggable
            eventHandlers={{ dragend: (e) => handleDrag("sw", (e.target as L.Marker).getLatLng()) }}
          />
          {/* NE — top-right */}
          <Marker
            position={ne}
            icon={NE_ICON}
            draggable
            eventHandlers={{ dragend: (e) => handleDrag("ne", (e.target as L.Marker).getLatLng()) }}
          />
          {/* NW — top-left */}
          <Marker
            position={nw}
            icon={NW_ICON}
            draggable
            eventHandlers={{ dragend: (e) => handleDrag("nw", (e.target as L.Marker).getLatLng()) }}
          />
          {/* SE — bottom-right */}
          <Marker
            position={se}
            icon={SE_ICON}
            draggable
            eventHandlers={{ dragend: (e) => handleDrag("se", (e.target as L.Marker).getLatLng()) }}
          />
        </>
      )}
    </MapContainer>
  );
}
