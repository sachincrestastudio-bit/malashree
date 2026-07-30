"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

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

const DynamicMap = dynamic(() => import("./DeliveryMapInner"), {
  ssr: false,
  loading: () => (
    <div
      style={{ height: "360px" }}
      className="w-full rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400"
    >
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <span className="text-xs font-mono tracking-wider uppercase">Loading Interactive Map...</span>
    </div>
  ),
});

export function DeliveryMap(props: DeliveryMapProps) {
  return <DynamicMap {...props} />;
}
