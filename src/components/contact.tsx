import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Github, Linkedin } from "lucide-react";

export function Contact() {
  const email = "ahmetberkeciftci@gmail.com";
  const linkedin = "https://www.linkedin.com/in/ahmet-berke-%C3%A7ift%C3%A7i-2111672b4";
  const github = "https://github.com/berkecftc";

  return (
    <section id="contact" className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,theme(colors.blue.100/.25),transparent_50%)]" />
  <div className="relative container mx-auto px-4 py-14 md:py-20 animate-in fade-in-0 duration-700">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">İletişim</h2>
          <p className="mt-3 text-muted-foreground">Her türlü soru ve iş birliği için e‑posta gönderebilirsiniz.</p>
        </div>

        <div className="mx-auto mt-8 max-w-md">
          <Card className="border shadow-sm animate-in fade-in-0 zoom-in-95 duration-700 animate-glow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Bağlantılar</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-transform hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground"
                aria-label="E‑posta gönder"
              >
                <Mail className="h-4 w-4" />
                {email}
              </a>
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-transform hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground"
                aria-label="LinkedIn profilini aç"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-transform hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground"
                aria-label="GitHub profilini aç"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
