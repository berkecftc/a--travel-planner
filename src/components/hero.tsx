import { MapPin, Calendar, Heart } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.indigo.200/.5),transparent_50%),radial-gradient(ellipse_at_bottom,theme(colors.blue.200/.5),transparent_50%)] animate-float-slow" />
      <div className="relative mx-auto max-w-5xl px-4 py-12 md:py-16 lg:py-20 text-center animate-in fade-in-0 zoom-in-95 duration-700">
        <div className="mx-auto mb-4 inline-flex items-center rounded-full border px-2.5 py-1 text-xs text-muted-foreground animate-in slide-in-from-top-2 fade-in-50 duration-500">
          Yeni • AI ile kişisel rotalar
        </div>
  <h1 className="mx-auto max-w-4xl text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl animate-in slide-in-from-bottom-2 fade-in-0 duration-700">
          Kişisel AI Seyahat Planlayıcı ile mükemmel yolculuğu keşfedin
        </h1>
  <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg animate-in slide-in-from-bottom-2 fade-in-0 duration-700 [animation-delay:150ms]">
          İlgi alanınıza, bütçenize ve tarihinize göre saatlik program, yemek ve ulaşım önerileriyle akıllı plan.
        </p>
  {/* CTA kaldırıldı */}
  <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-in fade-in-0 zoom-in-95 duration-700 [animation-delay:300ms]">
          <div className="flex items-center gap-2 transition-transform will-change-transform hover:-translate-y-0.5">
            <MapPin className="h-5 w-5" /> Akıllı Rota
          </div>
          <div className="flex items-center gap-2 transition-transform will-change-transform hover:-translate-y-0.5">
            <Calendar className="h-5 w-5" /> Saatlik Program
          </div>
          <div className="flex items-center gap-2 transition-transform will-change-transform hover:-translate-y-0.5">
            <Heart className="h-5 w-5" /> Kişisel Öneri
          </div>
        </div>
      </div>
    </section>
  );
}
