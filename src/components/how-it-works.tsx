import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, SlidersHorizontal, Map, Share2 } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      title: "Tercihlerini Yaz",
      desc: "Gidilecek yer, tarih, bütçe ve ilgi alanlarını kısaca belirt.",
      Icon: Search,
    },
    {
      title: "Planı Kişiselleştir",
      desc: "Süreyi ve öncelikleri ayarla; yemek, kültür, doğa gibi filtreler ekle.",
      Icon: SlidersHorizontal,
    },
    {
      title: "Akıllı Rota ve Program",
      desc: "Saat saat program, ulaşım ve harita üzerinde rotaları gör.",
      Icon: Map,
    },
    {
      title: "Paylaş ve Dışa Aktar",
      desc: "Planı arkadaşlarınla paylaş, PDF olarak indir veya favorilere ekle.",
      Icon: Share2,
    },
  ] as const;

  return (
    <section id="how" className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.indigo.100/.3),transparent_50%)]" />
  <div className="relative container mx-auto px-4 py-14 md:py-20 animate-in fade-in-0 duration-700">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs text-muted-foreground">Adım adım</span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl animate-in slide-in-from-bottom-2 fade-in-0 duration-700">Nasıl Çalışır</h2>
          <p className="mt-3 text-muted-foreground animate-in slide-in-from-bottom-2 fade-in-0 duration-700 [animation-delay:150ms]">
            Basit birkaç bilgiyle kişisel seyahat planını oluştur. Geri kalanını biz hallederiz.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ title, desc, Icon }, i) => (
            <Card
              key={title}
              className="relative border shadow-sm animate-in fade-in-0 zoom-in-95 duration-700 animate-glow transition-transform will-change-transform hover:-translate-y-1 hover:scale-[1.02]"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
                </div>
                <div className="absolute right-3 top-3 text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {desc}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
