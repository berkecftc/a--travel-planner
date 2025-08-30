import { NextRequest, NextResponse } from "next/server";
import type { PlaceWeather } from "@/lib/types";

export const runtime = "nodejs";

type WeatherReq = { places: string[]; startDate?: string | null };

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WeatherReq;
  const rawPlaces = Array.isArray(body?.places) ? body.places : [];
  const startDate = body?.startDate || null;
    const places = rawPlaces.filter((s) => typeof s === "string" && s.trim().length > 0).slice(0, 5);
    if (places.length === 0) return NextResponse.json({ items: [] });

    const items: PlaceWeather[] = [];

    for (const p of places) {
      try {
        // 1) Geocoding (Open-Meteo, ücretsiz)
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(p)}&count=1&language=tr&format=json`;
        const geoRes = await fetch(geoUrl, { cache: "no-store" });
        if (!geoRes.ok) throw new Error(`Geocoding başarısız (${geoRes.status})`);
  const geo: { results?: Array<{ latitude: number; longitude: number; feature_code?: string; population?: number }> } = await geoRes.json();
  const g0 = geo?.results?.[0];
        if (!g0) {
          items.push({ place: p, lat: null, lng: null, error: "Konum bulunamadı" });
          continue;
        }
  const lat = Number(g0.latitude);
  const lng = Number(g0.longitude);
  const featureCode: string = String(g0.feature_code || "");
  const population: number = Number(g0.population || 0);
  // PPL*, PPLA*, PPLC: populated place/başkent/idari merkez vs.
  const isCity = /^PPL/i.test(featureCode) || population >= 10000;

        // 2) Forecast (Open-Meteo)
        // startDate verilmişse start_date/end_date kullan; değilse forecast_days=5 kullan.
        const dailyVars = "temperature_2m_max,temperature_2m_min,precipitation_probability_max";
        const currentVars = "temperature_2m,weather_code,wind_speed_10m";
        const baseParams = [
          `latitude=${lat}`,
          `longitude=${lng}`,
          `timezone=auto`,
          `language=tr`,
          `daily=${dailyVars}`,
          // Hem yeni (current=...) hem de legacy (current_weather=true) ekle — hangisi gelirse onu kullanacağız
          `current=${currentVars}`,
          `current_weather=true`,
        ];
        if (startDate) {
          baseParams.push(`start_date=${startDate}`);
          baseParams.push(`end_date=${startDate}`);
          // Seçilen gün için saatlik değerler (öğlen sıcaklığı vs.)
          baseParams.push(`hourly=temperature_2m,precipitation_probability,weather_code`);
        } else {
          baseParams.push(`forecast_days=5`);
        }
        const fcUrl = `https://api.open-meteo.com/v1/forecast?${baseParams.join("&")}`;
        const fcRes = await fetch(fcUrl, { cache: "no-store" });
        if (!fcRes.ok) throw new Error(`Forecast başarısız (${fcRes.status})`);
  const fc: any = await fcRes.json();

        // current: yeni API (fc.current.*) ya da legacy (fc.current_weather.*)
        const current = {
          temperatureC: numOrNull(fc?.current?.temperature_2m ?? fc?.current_weather?.temperature),
          code: numOrNull(fc?.current?.weather_code ?? fc?.current_weather?.weathercode),
          windKmh: numOrNull(fc?.current?.wind_speed_10m ?? fc?.current_weather?.windspeed),
        };
        const daily: PlaceWeather["daily"] = (fc?.daily?.time || []).map((t: string, i: number) => ({
          date: t,
          tMaxC: numOrNull(fc?.daily?.temperature_2m_max?.[i]),
          tMinC: numOrNull(fc?.daily?.temperature_2m_min?.[i]),
          precipProb: numOrNull(fc?.daily?.precipitation_probability_max?.[i]),
        }));

        // Seçilen tarih için özet (daily ve hourly varsa)
        let selected: PlaceWeather["selected"] = undefined;
        if (startDate) {
          const dIndex = Array.isArray(fc?.daily?.time) ? fc.daily.time.findIndex((t: string) => t === startDate) : -1;
          const tMaxC = dIndex >= 0 ? numOrNull(fc?.daily?.temperature_2m_max?.[dIndex]) : null;
          const tMinC = dIndex >= 0 ? numOrNull(fc?.daily?.temperature_2m_min?.[dIndex]) : null;
          const precipProb = dIndex >= 0 ? numOrNull(fc?.daily?.precipitation_probability_max?.[dIndex]) : null;
          let middayC: number | null = null;
          if (Array.isArray(fc?.hourly?.time)) {
            const target = `${startDate}T12:00`;
            // 12:00 yoksa en yakın saate bak
            let hIndex = fc.hourly.time.indexOf(target);
            if (hIndex === -1) {
              // 11:00 veya 13:00 dene
              const idx11 = fc.hourly.time.indexOf(`${startDate}T11:00`);
              const idx13 = fc.hourly.time.indexOf(`${startDate}T13:00`);
              hIndex = idx11 !== -1 ? idx11 : idx13;
            }
            if (hIndex !== -1) {
              middayC = numOrNull(fc?.hourly?.temperature_2m?.[hIndex]);
            }
          }
          selected = { date: startDate, tMaxC, tMinC, precipProb, middayC };
        }

        items.push({ place: p, lat, lng, kind: featureCode, isCity, current, daily, selected });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Hava durumu alınamadı";
        items.push({ place: p, lat: null, lng: null, error: msg });
      }
      // Kısa bekleme — oran kısıtlarına saygı
      await delay(120);
    }

    return NextResponse.json({ items });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "İstek işlenemedi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function numOrNull(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
