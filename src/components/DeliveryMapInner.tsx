"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

interface LocationPoint {
  lat: number;
  lng: number;
  label?: string;
  sublabel?: string;
}

interface DeliveryMapProps {
  kitchenLocation?: LocationPoint;
  customerLocation?: LocationPoint;
  driverLocation?: LocationPoint;
  height?: string;
}

export default function DeliveryMapInner({
  kitchenLocation,
  customerLocation,
  driverLocation,
  height = "360px",
}: DeliveryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map if not already done
    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    }

    const map = mapRef.current;

    // Clear existing markers & polylines
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const bounds: L.LatLngBounds = L.latLngBounds([]);

    // Custom Icon Creators
    const createCustomIcon = (
      bgColor: string,
      emoji: string,
      pulseColor: string
    ) => {
      return L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
            <div style="position: absolute; width: 44px; height: 44px; background-color: ${pulseColor}; border-radius: 50%; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 36px; height: 36px; background-color: ${bgColor}; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 16px;">
              ${emoji}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
    };

    const routeCoords: L.LatLngExpression[] = [];

    // 1. Kitchen Marker
    if (kitchenLocation && kitchenLocation.lat && kitchenLocation.lng) {
      const pos: [number, number] = [kitchenLocation.lat, kitchenLocation.lng];
      const icon = createCustomIcon("#ea580c", "🏪", "#fb923c");
      const marker = L.marker(pos, { icon }).addTo(map);
      marker.bindPopup(
        `<div style="font-family: sans-serif; padding: 2px;">
          <strong style="color: #ea580c; font-size: 13px;">🏪 ${kitchenLocation.label || "Kitchen Branch"}</strong>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #475569;">${kitchenLocation.sublabel || "Pickup Point"}</p>
        </div>`
      );
      bounds.extend(pos);
      routeCoords.push(pos);
    }

    // 2. Driver Marker
    if (driverLocation && driverLocation.lat && driverLocation.lng) {
      const pos: [number, number] = [driverLocation.lat, driverLocation.lng];
      const icon = createCustomIcon("#2563eb", "🛵", "#60a5fa");
      const marker = L.marker(pos, { icon }).addTo(map);
      marker.bindPopup(
        `<div style="font-family: sans-serif; padding: 2px;">
          <strong style="color: #2563eb; font-size: 13px;">🛵 ${driverLocation.label || "Delivery Executive"}</strong>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #475569;">${driverLocation.sublabel || "Live GPS Location"}</p>
        </div>`
      );
      bounds.extend(pos);
      routeCoords.push(pos);
    }

    // 3. Customer Marker
    if (customerLocation && customerLocation.lat && customerLocation.lng) {
      const pos: [number, number] = [customerLocation.lat, customerLocation.lng];
      const icon = createCustomIcon("#16a34a", "📍", "#4ade80");
      const marker = L.marker(pos, { icon }).addTo(map);
      marker.bindPopup(
        `<div style="font-family: sans-serif; padding: 2px;">
          <strong style="color: #16a34a; font-size: 13px;">📍 ${customerLocation.label || "Delivery Address"}</strong>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #475569;">${customerLocation.sublabel || "Destination"}</p>
        </div>`
      );
      bounds.extend(pos);
      routeCoords.push(pos);
    }

    // Draw route line
    if (routeCoords.length > 1) {
      L.polyline(routeCoords, {
        color: "#2563eb",
        weight: 4,
        opacity: 0.8,
        dashArray: "8, 8",
        lineCap: "round",
      }).addTo(map);
    }

    // Fit map bounds
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 16 });
    } else {
      map.setView([18.5987, 73.7978], 13);
    }
  }, [kitchenLocation, customerLocation, driverLocation]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%" }}
      className="rounded-2xl overflow-hidden shadow-inner border border-slate-700/50 bg-slate-900"
    />
  );
}
