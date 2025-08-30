"use client";

import { useEffect, useState } from "react";
import { TravelPlanForm } from "@/components/travel-plan-form";
import { MapSection } from "@/components/map";
import { Wind } from "lucide-react";
import { getWeatherVisual } from "@/lib/weather-icons";
import type { WeatherApiResponse, PlaceWeather } from "@/lib/types";

export function FormMapBridge() {
  const [places, setPlaces] = useState<string[]>([]);
  const [placesMode, setPlacesMode] = useState<"all" | "citiesOnly">("all");
  const [weather, setWeather] = useState<PlaceWeather[]>([]);
  const [cityHint, setCityHint] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);

  // Tek anahtar: bağımlılık dizisinin boyutunu sabit tutmak için
  const depsKey = `${places.map(s => s.trim()).filter(Boolean).join("|")}|${startDate ?? ""}|${cityHint ?? ""}`;

  useEffect(() => {
    const run = async () => {
      const uniq = Array.from(new Set(places.map((s) => s.trim()).filter(Boolean)));
      if (uniq.length === 0) {
        setWeather([]);
        return;
      }
    try {
        const first = uniq[0];
        const target = (cityHint && cityHint.trim().length > 0) ? cityHint : first;
  const res = await fetch("/api/weather", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ places: [target], startDate }),
        });
  const data: WeatherApiResponse = await res.json();
  const items = Array.isArray(data?.items) ? data.items.slice(0, 1) : [];
  const onlyCities = items.filter((x) => x?.isCity);
        setWeather(onlyCities.length ? onlyCities : items);
      } catch {
        setWeather([]);
      }
    };
    run();
  }, [depsKey]);
  return (
    <>
      <section className="container mx-auto px-4 pb-12">
  <TravelPlanForm onPlacesDetected={setPlaces} onPlacesModeChange={setPlacesMode} onCityHintChange={setCityHint} onStartDateChange={setStartDate} />
      </section>
      <MapSection places={places} mode={placesMode} cityHint={cityHint ?? undefined} />
      {weather.length > 0 && (
        <section className="container mx-auto px-4 pb-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {weather.map((w, i) => {
              const visual = getWeatherVisual(w?.current?.code);
              const temp = w?.current?.temperatureC;
              const wind = w?.current?.windKmh;
              return (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm transition hover:shadow-md"
                >
                  <div className="p-4 text-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-base sm:text-lg">{w.place}</div>
                      <div className="flex items-center gap-2 text-xs opacity-70">
                        <Wind className="w-3.5 h-3.5" />
                        <span>{wind != null ? `${wind} km/s` : "-"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="grid place-items-center rounded-xl bg-gradient-to-b from-muted/60 to-muted/20 p-3">
                        <visual.Icon />
                      </div>
                      <div>
                        <div className="leading-none text-2xl font-semibold">
                          {temp != null ? `${temp}°C` : "-"}
                        </div>
                        <div className="text-xs opacity-70">{visual.label}{w?.selected?.middayC != null ? ` • Öğlen ${w.selected.middayC}°C` : ""}</div>
                      </div>
                    </div>
          {(w.daily || []).length > 0 && (
                      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {(w.daily || []).map((d, j) => (
                          <div
                            key={j}
                            className="min-w-28 rounded-lg border border-border/50 bg-background/40 px-2 py-1.5"
                          >
                            <div className="text-[11px] opacity-70">{d.date}</div>
                            <div className="text-xs">Max {d.tMaxC ?? "-"}° / Min {d.tMinC ?? "-"}°</div>
                            {d.precipProb != null && (
                              <div className="text-[11px] opacity-70">Yağış %{d.precipProb}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
