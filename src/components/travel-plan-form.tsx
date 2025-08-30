"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, DollarSign, Heart } from "lucide-react";

type TravelPlanFormProps = {
  onPlacesDetected?: (places: string[]) => void;
  onPlacesModeChange?: (mode: "all" | "citiesOnly") => void;
  onCityHintChange?: (city: string | null) => void;
  onStartDateChange?: (date: string | null) => void;
};

export function TravelPlanForm({ onPlacesDetected, onPlacesModeChange, onCityHintChange, onStartDateChange }: TravelPlanFormProps) {
  const [formData, setFormData] = useState({
    destination: "",
    duration: "",
    budget: "",
    interests: "",
    startDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const splitToPlaces = (s: string) =>
    s
      .split(/[,/|·•]+/g)
      .map((x) => x.trim())
      .filter(Boolean);

  const extractPlaces = (text: string) => {
    const candidates = new Set<string>();
    // Form girdisindeki varış noktasını önceliklendir
    if (formData.destination) {
      for (const p of splitToPlaces(formData.destination)) candidates.add(p);
    }
    // Satır bazlı basit çıkarım (başlıklar, madde işaretleri, "Gün X:" gibi)
    const lines = text.split(/\n+/);
    for (const raw of lines) {
      let line = raw.replace(/[*#>\-•]+/g, " ").replace(/\*\*/g, "").trim();
      if (!line) continue;
      // "Gün X:" sonrası kısmı al
      const colonIdx = line.indexOf(":");
      if (colonIdx !== -1 && colonIdx < 20) line = line.slice(colonIdx + 1).trim();
      // Parantez içlerini at
      line = line.replace(/\([^)]*\)/g, "").trim();
      // Virgülle ayrılmış yerler olabilir
      const parts = line.split(/[,·]/g).map(s => s.trim()).filter(Boolean);
      for (const p of parts) {
        // Çok kelimeli özel isim kümelerini yakalamaya çalış (Türkçe karakterler dahil)
        const match = p.match(/([A-ZÇĞİÖŞÜ][a-zçğıöşü']+)(?:\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü']+){0,3}/g);
        if (match) {
          for (const m of match) {
            const cleaned = m.replace(/\.$/, "").trim();
            // Sık karşılaşılan genel kelimeleri ele
            const blacklist = new Set([
              "Gün", "Sabah", "Öğle", "Akşam", "Konaklama", "Mekan", "Müze", "Park", "Kale", "Cami", "Kilise"
            ]);
            if (!blacklist.has(cleaned) && cleaned.length > 2) {
              candidates.add(cleaned);
            }
          }
        }
      }
    }
  // En fazla 8 benzersiz sonuç dön
  return Array.from(candidates).slice(0, 8);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    // API beklemeden, en azından varış noktasını haritaya gönder
    if (formData.destination?.trim()) {
      const prelim = splitToPlaces(formData.destination);
      if (prelim.length) {
        onPlacesModeChange?.(prelim.length > 1 ? "citiesOnly" : "all");
        onPlacesDetected?.(prelim);
        onCityHintChange?.(prelim[0] ?? null);
      }
    }
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Bilinmeyen hata");
      const planText = data.plan as string;
      setResult(planText);
      // API yerlere sahipse onu kullan; yoksa yerel çıkarıma düş
      {
        let places: string[] = Array.isArray(data?.places) ? (data.places as string[]) : [];
        if (!places.length) places = extractPlaces(planText);
        if (!places.length && formData.destination) {
          const prelim = splitToPlaces(formData.destination);
          if (prelim.length) {
            onPlacesModeChange?.(prelim.length > 1 ? "citiesOnly" : "all");
            onPlacesDetected?.(prelim);
            onCityHintChange?.(prelim[0] ?? null);
          }
        } else if (places.length > 0) {
          // AI’den gelen detaylı yer listesi için tümünü göster
          onPlacesModeChange?.("all");
          onPlacesDetected?.(places);
          // Şehir ipucunu değiştirmiyoruz; kullanıcı yazdığı şehirde kalsın
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bir hata oluştu";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
  <Card className="mx-auto w-full max-w-2xl shadow-sm animate-in fade-in-0 zoom-in-95 duration-700">
      <CardHeader>
        <CardTitle className="text-2xl text-center sm:text-3xl">Seyahat Planınızı Oluşturun</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Gitmek İstediğiniz Yer
            </Label>
            <Input
              id="destination"
              placeholder="Örn: Kapadokya, İstanbul, Antalya"
              value={formData.destination}
              onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="duration">Süre (Gün)</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                <SelectTrigger className="transition-shadow focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]">
                  <SelectValue placeholder="Kaç gün?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Gün</SelectItem>
                  <SelectItem value="2">2 Gün</SelectItem>
                  <SelectItem value="3">3 Gün</SelectItem>
                  <SelectItem value="4">4 Gün</SelectItem>
                  <SelectItem value="5">5 Gün</SelectItem>
                  <SelectItem value="7">1 Hafta</SelectItem>
                  <SelectItem value="14">2 Hafta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Bütçe
              </Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
                <SelectTrigger className="transition-shadow focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]">
                  <SelectValue placeholder="Bütçe aralığı" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Düşük (₺500-1500)</SelectItem>
                  <SelectItem value="medium">Orta (₺1500-5000)</SelectItem>
                  <SelectItem value="high">Yüksek (₺5000+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Başlangıç Tarihi
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => {
                const v = e.target.value;
                setFormData(prev => ({ ...prev, startDate: v }));
                onStartDateChange?.(v || null);
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              İlgi Alanlarınız
            </Label>
            <Textarea
              id="interests"
              placeholder="Örn: fotoğrafçılık, kültür, doğa, gastronomi, tarih, macera..."
              value={formData.interests}
              onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
              required
            />
          </div>

          <Button type="submit" className="w-full transition-transform will-change-transform hover:-translate-y-0.5" size="lg" disabled={loading}>
            {loading ? "Oluşturuluyor…" : "AI ile Plan Oluştur"}
          </Button>
          {error && (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          )}
          {result && (
            <div className="mt-6 rounded-lg border bg-card p-4 text-sm whitespace-pre-wrap">
              {result}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
