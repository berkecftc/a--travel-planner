"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type MarkerPoint = { name: string; lat: number; lng: number; kind?: string };

type MapSectionProps = {
  places?: string[]; // Yer adları (geocode edilip işaretlenecek)
  mode?: "all" | "citiesOnly";
  cityHint?: string; // Kullanıcının yazdığı şehir (aramayı bu çevreyle sınırla)
};

export function MapSection({ places = [], mode = "all", cityHint }: MapSectionProps) {
  const [MapImpl, setMapImpl] = useState<null | React.ComponentType<{ places: string[]; mode: "all" | "citiesOnly"; cityHint?: string }>>(
    null
  );

  useEffect(() => {
    // Dinamik import: react-leaflet sadece tarayıcıda yüklenmeli
  (async () => {
      const L = await import("leaflet");
      const RL = (await import("react-leaflet")) as typeof import("react-leaflet");
      const { MapContainer, TileLayer, Marker, Popup, useMap } = RL;

      // Marker default ikon düzeltmesi (Leaflet asset yolu)
      const icon = new L.Icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      // Basit bir client-side geocoder (OSM Nominatim). Ağ çağrıları kullanıcı tarayıcısından yapılır.
      // Basit Türkiye odaklı sözlük (fallback) — anahtarlar normalize edilmiştir
      const TURKEY_GEO: Record<string, [number, number]> = {
        istanbul: [41.015137, 28.97953],
        ankara: [39.92077, 32.85411],
        izmir: [38.423733, 27.142826],
        antalya: [36.896893, 30.713324],
        bodrum: [37.034407, 27.43054],
        fethiye: [36.65338, 29.12641],
        alanya: [36.54375, 31.99982],
        kapadokya: [38.642, 34.827],
        goreme: [38.643055, 34.830833],
        nevsehir: [38.62442, 34.72397],
        kayseri: [38.73122, 35.47873],
        bursa: [40.195, 29.06],
        trabzon: [41.00145, 39.7178],
        rize: [41.02083, 40.52194],
        cesme: [38.3261, 26.3053],
      };

      const normalize = (s: string) =>
        s
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}+/gu, "")
          .replace(/ı/g, "i")
          .replace(/ş/g, "s")
          .replace(/ğ/g, "g")
          .replace(/ç/g, "c")
          .replace(/ö/g, "o")
          .replace(/ü/g, "u")
          .trim();

      function bboxAround(lat: number, lng: number, d = 0.9): [number, number, number, number] {
        // viewbox = left,top,right,bottom (lng-lat)
        return [lng - d, lat + d, lng + d, lat - d];
      }

      function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
        const R = 6371; // km
        const dLat = (b.lat - a.lat) * Math.PI / 180;
        const dLng = (b.lng - a.lng) * Math.PI / 180;
        const s1 = Math.sin(dLat/2) ** 2;
        const s2 = Math.cos(a.lat * Math.PI/180) * Math.cos(b.lat * Math.PI/180) * Math.sin(dLng/2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(s1 + s2));
      }

  async function geocode(query: string, viewbox?: [number, number, number, number], near?: { lat: number; lng: number }, maxKm?: number): Promise<MarkerPoint | null> {
        try {
          const key = normalize(query);
          if (TURKEY_GEO[key]) {
            const [lat, lng] = TURKEY_GEO[key];
    return { name: query, lat, lng, kind: "city" };
          }
          let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
          if (viewbox) {
            const [left, top, right, bottom] = viewbox;
            url += `&viewbox=${left},${top},${right},${bottom}&bounded=1`;
          }
          const res = await fetch(url);
          if (!res.ok) return null;
      const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string; class?: string; type?: string }>;
          if (!Array.isArray(data) || data.length === 0) return null;
      const top = data[0];
      const kind = String(top.type || top.class || "");
      const point = { name: query, lat: parseFloat(top.lat), lng: parseFloat(top.lon), kind } as MarkerPoint;
      if (near && maxKm && Number.isFinite(maxKm)) {
        const d = haversineKm(near, point);
        if (d > maxKm) return null;
      }
      return point;
        } catch {
          return null;
        }
      }

      const Impl: React.FC<{ places: string[]; mode: "all" | "citiesOnly"; cityHint?: string }> = ({ places, mode, cityHint }) => {
        const [markers, setMarkers] = useState<MarkerPoint[]>([]);
        const [loading, setLoading] = useState(false);
        const lastPlacesRef = useRef<string>("");
        const [anchorFromCity, setAnchorFromCity] = useState<MarkerPoint | null>(null);

        const center = useMemo<[number, number]>(() => {
          if (markers.length > 0) return [markers[0].lat, markers[0].lng];
          return [41.015137, 28.97953]; // İstanbul default
        }, [markers]);

        // Gelen places değişince geocode et (debounce basit: string snapshot)
  useEffect(() => {
          const snapshot = JSON.stringify(places);
          if (snapshot === lastPlacesRef.current) return;
          lastPlacesRef.current = snapshot;
          if (!places || places.length === 0) {
            setMarkers([]);
            return;
          }
          let cancelled = false;
          setLoading(true);
          (async () => {
            const results: MarkerPoint[] = [];
            let anchor: MarkerPoint | null = null;
            // Eğer cityHint varsa, onu önce çöz ve anchor olarak ata
            if (cityHint && cityHint.trim().length > 0) {
              anchor = await geocode(cityHint);
              if (anchor) setAnchorFromCity(anchor);
            } else {
              setAnchorFromCity(null);
            }
            for (let i = 0; i < places.length; i++) {
              const name = places[i];
              let m: MarkerPoint | null = null;
              if (i === 0 && !anchor) {
                m = await geocode(name);
                anchor = m;
              } else if (anchor) {
                // Anchor etrafında aramayı sınırla
                const vb = bboxAround(anchor.lat, anchor.lng, 0.9);
                // 1) viewbox + mesafe kontrolü (<= 120km)
                m = await geocode(name, vb, { lat: anchor.lat, lng: anchor.lng }, 120);
                // 2) şehir adı ile birlikte ara
                if (!m) m = await geocode(`${name} ${anchor.name}`, undefined, { lat: anchor.lat, lng: anchor.lng }, 160);
                // 3) son çare: düz ara ama uzaksa reddet
                if (!m) m = await geocode(name, undefined, { lat: anchor.lat, lng: anchor.lng }, 180);
              } else {
                m = await geocode(name);
              }
              if (cancelled) return;
              if (m) results.push(m);
              // Küçük bir aralıkla istekleri serpiştir (rate limit koruması)
              await new Promise(r => setTimeout(r, 220));
            }
            // Mod citiesOnly ise yalnız şehir benzeri türleri filtrele
            let filtered = results;
            if (mode === "citiesOnly") {
              const allowed = new Set([
                "city", "town", "village", "municipality", "administrative", "county", "province", "state", "region", "district", "hamlet"
              ]);
              filtered = results.filter(r => !r.kind || allowed.has(String(r.kind).toLowerCase()));
              // Eğer filtreleme sonrası boş kaldıysa, ilk sonucu koru ki tamamen boş kalmasın
              if (filtered.length === 0 && results.length > 0) filtered = [results[0]];
            }
            if (!cancelled) setMarkers(filtered);
            setLoading(false);
          })();
          return () => {
            cancelled = true;
          };
  }, [places]);

        const BoundsFitter: React.FC<{ pts: MarkerPoint[] }> = ({ pts }) => {
          const map = useMap?.();
          useEffect(() => {
            if (!map || !pts || pts.length === 0) return;
            if (pts.length === 1) {
              map.setView([pts[0].lat, pts[0].lng], 13);
              return;
            }
            const bounds = L.latLngBounds(pts.map(p => [p.lat, p.lng] as [number, number]));
            try { map.fitBounds(bounds, { padding: [40, 40] }); } catch {}
          }, [map, pts.length]);
          return null;
        };

        return (
          <section className="relative">
            <div className="container mx-auto px-4 py-12">
              <h2 className="mb-4 text-center text-2xl font-semibold">Harita</h2>
              <div className="overflow-hidden rounded-lg border">
                <MapContainer center={center} zoom={12} style={{ height: 420, width: "100%" }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <BoundsFitter pts={markers} />
                  {markers.map((m, idx) => (
                    <Marker key={`${m.name}-${idx}`} position={[m.lat, m.lng]} icon={icon}>
                      <Popup>{m.name}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              {loading && (
                <p className="mt-2 text-center text-sm opacity-70">Konumlar yükleniyor…</p>
              )}
              {!loading && markers.length > 0 && (
                <p className="mt-2 text-center text-xs opacity-70">Bulunan: {markers.map(m => m.name).join(", ")}</p>
              )}
            </div>
          </section>
        );
  };

      setMapImpl(() => Impl);
    })();
  }, []);

  if (!MapImpl) return null;
  return <MapImpl places={places} mode={mode} cityHint={cityHint} />;
}
