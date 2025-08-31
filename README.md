<div align="center">
	<h1>AI Seyahat Planlayıcı</h1>
	<p>Gemini destekli seyahat planı, harita üzerinde destinasyonlar ve şehir hava durumu</p>
</div>

## ✨ Özellikler
- AI plan üretimi (Google Gemini 1.5 Flash) – gün gün öneriler ve en sonda Mekanlar JSON’u
- Harita (Leaflet + React‑Leaflet) – şehir odaklı akıllı jeokodlama ve işaretleme
- Hava durumu (Open‑Meteo) – anlık durum + seçilen tarihten itibaren özet, ikonlu kart
- Dark mode, modern UI (Tailwind CSS v4), shadcn‑style bileşenler

## 🚀 Kurulum
Önkoşullar: Node 18+ (veya 20+), npm.

1) Bağımlılıkları yükleyin:
```bash
npm install
```

2) Ortam değişkenleri:
```bash
cp .env.local.example .env.local
# .env.local dosyasını açın ve aşağıdaki anahtarı doldurun
# GEMINI_API_KEY=<Google AI Studio API Key>
```

3) Geliştirme sunucusu:
```bash
npm run dev
```
Uygulama genelde http://localhost:3000 (meşgul ise 3001) adresinde çalışır.

## 🔐 Güvenlik Notları
- `.env.local` dosyası `.gitignore` içinde; commit etmeyin.
- Anahtarlarınızı sadece lokal `.env.local` veya dağıtım ortamı gizli değişkenlerinde tutun (GitHub/Vercel Secrets).
- Bu repo sadece “Mekanlar: { "places": [...] }” satırını tüketir; istemciye anahtar sızdırılmaz.

## 🗺️ Mimari Kısa Özet
- `src/app/api/plan/route.ts`: Gemini ile plan üretimi, en sonda “Mekanlar” JSON’unu parse eder.
- `src/app/api/weather/route.ts`: Open‑Meteo geocode + forecast; current (yeni/legacy), daily ve seçili gün özetini döner.
- `src/components/form-map-bridge.tsx`: Form + Harita + Hava durumu kompozisyonu.
- `src/components/map.tsx`: Dinamik import ile Leaflet, ankora göre (cityHint) jeokodlama ve filtreleme.
- `src/lib/types.ts`: Ortak tipler. `src/lib/weather-icons.tsx`: Hava durumu ikon eşlemeleri.

## 🧪 Hızlı Test
1) Formdan bir şehir ve başlama tarihi seçin, plan oluşturun.
2) Haritada şehir ve mekan işaretleri görünecek.
3) Hava durumu kartında anlık sıcaklık, rüzgar ve ikon görünür.

## 📦 Deploy
- Vercel önerilir. Projeyi bağlayın ve Environment Variables’a `GEMINI_API_KEY` ekleyin.
- Next.js App Router, Node.js runtime (API Routes) ile uyumludur.

## 📝 Lisans
MIT
