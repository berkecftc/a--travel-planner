import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import React from "react";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Seyahat Planlayıcı",
  description: "Yapay zeka destekli kişisel seyahat planları oluşturun",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
  (function(){
    try {
      var theme = localStorage.getItem('theme');
      if(theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)){
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch(e){}
  })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-dvh bg-background text-foreground`}>
        <Providers>
          <div className="flex min-h-dvh flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t py-6 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} AI Seyahat Planlayıcı
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
