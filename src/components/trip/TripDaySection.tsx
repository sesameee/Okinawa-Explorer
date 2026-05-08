import { motion } from "motion/react";
import { House } from "lucide-react";
import type { ItineraryDay } from "../../data/itinerary";
import type { DayComputeResult } from "../../lib/tripMapsRuntime";
import { minutesToHuman } from "../../lib/tripMapsUtils";
import { useEffect, useMemo, useRef } from "react";

export function TripDaySection({
  day,
  idx,
  compute,
  mapsReady,
}: {
  key?: string | number;
  day: ItineraryDay;
  idx: number;
  compute: DayComputeResult | undefined;
  mapsReady: boolean;
}) {
  const mapRef = useRef<HTMLDivElement>(null);

  const byIdx = useMemo(() => new Map(day.stops.map((s) => [s.idx, s])), [day.stops]);
  const displayNumberByStopIdx = useMemo(() => {
    const m = new Map<number, number>();
    let n = 1;
    for (const stopIdx of day.order) {
      if (m.has(stopIdx)) continue;
      m.set(stopIdx, n++);
    }
    return m;
  }, [day.order]);

  useEffect(() => {
    if (!mapsReady || !mapRef.current || !compute) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 26.2124, lng: 127.6809 },
      zoom: 9,
    });
    const renderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: { strokeColor: "#f6c948", strokeWeight: 3, strokeOpacity: 0.9 },
    });
    if (compute.directionsResult) {
      renderer.setDirections(compute.directionsResult);
    }

    // Add numbered stop markers based on day.order
    const seen = new Set<number>();
    for (const stopIdx of day.order) {
      if (seen.has(stopIdx)) continue;
      seen.add(stopIdx);

      const stop = byIdx.get(stopIdx);
      if (!stop) continue;
      const coords = compute.resolvedByStopId?.[stop.id]?.coords;
      if (!coords) continue;

      new google.maps.Marker({
        map,
        position: coords,
        label: {
          text: String(displayNumberByStopIdx.get(stopIdx) ?? stopIdx),
          color: "#111827",
          fontSize: "12px",
          fontWeight: "700",
        },
        title: compute.resolvedByStopId?.[stop.id]?.details?.name || stop.name,
      });
    }
  }, [byIdx, compute, day.order, displayNumberByStopIdx, mapsReady]);

  const legMap = useMemo(() => {
    const m = new Map<string, { durationText: string; geometryText: string }>();
    for (const leg of compute?.legs || []) {
      const dText =
        leg.durationText ||
        (leg.durationMinutes != null ? minutesToHuman(leg.durationMinutes) : "—");
      const gText = leg.geometryKm != null ? `${leg.geometryKm.toFixed(1)} km` : "—";
      m.set(`${leg.fromIdx}-${leg.toIdx}`, { durationText: dText, geometryText: gText });
    }
    return m;
  }, [compute?.legs]);

  return (
    <section
      id={`day${day.dayNumber}`}
      className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
    >
      <div className="lg:col-span-12 mb-8 sticky top-16 z-20 bg-navy-900/90 backdrop-blur-sm py-3">
        <h2 className="text-[20px] md:text-4xl font-bold text-white flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-4">
          <span className="text-primary text-2xl font-mono">{String(day.dayNumber).padStart(2, "0")}</span>
          {day.dateLabel} 
          <span className="w-full md:w-auto">{day.title}</span>
        </h2>
        <div className="h-1 w-24 bg-primary mt-4 rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className={`lg:col-span-5 scrapbook-card group border-primary/20 ${idx % 2 !== 0 ? "lg:order-2" : ""}`}
      >
        <div
          className={`p-4 font-bold tracking-widest uppercase text-center text-sm ${
            idx % 2 !== 0 ? "bg-secondary text-navy-900" : "bg-primary text-navy-900"
          }`}
        >
          Day {day.dayNumber}
        </div>
        <div
          ref={mapRef}
          className="aspect-[4/5] bg-navy-950"
        >
          {!mapsReady && (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
              未設定地圖 API Key（僅顯示靜態行程）
            </div>
          )}
        </div>
        <div className="p-8 flex items-center gap-3 text-primary font-medium italic">
          <House size={18} />
          <span>{day.baseHotel.label}</span>
        </div>
      </motion.div>

      <div className={`lg:col-span-7 space-y-8 relative timeline-line pl-8 lg:pl-12 ${idx % 2 !== 0 ? "lg:order-1" : ""}`}>
        {day.order.map((stopIdx, i) => {
          const stop = byIdx.get(stopIdx);
          if (!stop) return null;
          const resolvedName = stop.name;
          const leg = i > 0 ? legMap.get(`${day.order[i - 1]}-${stopIdx}`) : null;
          return (
            <motion.div
              key={`${stop.id}-${i}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              viewport={{ once: true, amount: 0.2 }}
              className="scrapbook-card border-primary/10 p-4"
            >
              <div className="text-xs text-secondary uppercase tracking-widest">
                {stop.schedule.start} - {stop.schedule.end}
              </div>
              <div className="text-lg text-slate-100 font-bold mt-1">
                {displayNumberByStopIdx.get(stopIdx) ?? stop.idx}. {resolvedName}
              </div>
              {stop.note ? (
                <p className="text-sm text-slate-400 mt-2 leading-relaxed whitespace-pre-wrap">{stop.note}</p>
              ) : null}
              <a
                href={stop.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline"
              >
                開啟 Google Maps
              </a>
              {leg ? (
                <div className="text-xs text-slate-400 mt-2">
                  交通：{leg.durationText} · 距離：{leg.geometryText}
                </div>
              ) : (
                <div className="text-xs text-slate-500 mt-2">起點</div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
