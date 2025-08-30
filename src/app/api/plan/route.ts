import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

// Basit şema kontrolü
function getJsonSafe<T>(req: NextRequest): Promise<T> {
  return req.json() as Promise<T>;
}

type PlanRequest = {
  destination: string;
  duration: string; // gün sayısı
  budget: string; // low|medium|high
  interests: string;
  startDate: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await getJsonSafe<PlanRequest>(req);
    const { destination, duration, budget, interests, startDate } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Sunucu yapılandırmasında GEMINI_API_KEY eksik." }, { status: 500 });
    }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Sen bir profesyonel seyahat planlayıcısın. Aşağıdaki bilgilerle Türkçe, günlük program (saat saat), yeme-içme ve ulaşım önerileri içeren ayrıntılı bir plan oluştur.
Hedef: ${destination}
Süre (gün): ${duration}
Bütçe: ${budget}
İlgi alanları: ${interests}
Başlangıç tarihi: ${startDate}

Çıktı formatı:
- Kısa özet (2-3 cümle)
- Gün bazında başlıklar (Gün 1, Gün 2 ...), her güne saatli program madde madde
- Yemek önerileri (kahvaltı/öğle/akşam)
- Ulaşım önerileri (toplu taşıma / yürüyüş / taksi)
- Bütçe dostu ipuçları

En sonda, tek satır olarak ve başka metin olmadan şunu yaz:
Mekanlar: { "places": ["Şehir veya mekan adı", "Mekan adı", "..."] }
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

    // JSON bloktan yerleri yakala (Mekanlar satırı; eski sürümle uyum için PLACES_JSON da desteklenir)
    let places: string[] = [];
    try {
      const m = text.match(/(?:Mekanlar|PLACES_JSON)\s*:\s*(\{[\s\S]*?\})/i);
      if (m && m[1]) {
        const parsed = JSON.parse(m[1]);
        if (parsed && Array.isArray(parsed.places)) {
          places = parsed.places
            .map((x: unknown) => (typeof x === "string" ? x.trim() : ""))
            .filter((x: string) => x.length > 0);
        }
      }
    } catch {}

    // Fallback: metinden çıkar
    if (places.length === 0) {
      places = extractPlacesFromText(text, destination).slice(0, 8);
    }

    return NextResponse.json({ plan: text, places });
  } catch (err: unknown) {
    console.error("/api/plan error", err);
    const message = err instanceof Error ? err.message : "Plan oluşturulurken bir hata oluştu.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Basit yer çıkarıcı (server-side fallback)
function extractPlacesFromText(text: string, destination?: string): string[] {
  const out = new Set<string>();
  const lines = text.split(/\n+/);
  const blacklist = new Set([
    "Gün", "Sabah", "Öğle", "Akşam", "Konaklama", "Mekan", "Müze", "Park", "Kale", "Cami", "Kilise",
  ]);
  const add = (s: string) => {
    const v = s.replace(/\.$/, "").trim();
    if (v && !blacklist.has(v)) out.add(v);
  };
  if (destination) add(destination);
  for (const raw of lines) {
    let line = raw.replace(/[*#>\-•]+/g, " ").replace(/\*\*/g, "").trim();
    if (!line) continue;
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1 && colonIdx < 20) line = line.slice(colonIdx + 1).trim();
    line = line.replace(/\([^)]*\)/g, "").trim();
    const parts = line.split(/[,·]/g).map(s => s.trim()).filter(Boolean);
    for (const p of parts) {
      const match = p.match(/([A-ZÇĞİÖŞÜ][a-zçğıöşü']+)(?:\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü']+){0,3}/g);
      if (match) for (const m of match) add(m);
    }
  }
  return Array.from(out);
}
