import type { Metadata, Viewport } from "next";
import { Lora, Nunito } from "next/font/google";
import { AppShell } from "@/components/bottom-nav";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "My Kitchen",
  description: "Planifiez vos repas, gérez votre frigo et découvrez des recettes adaptées.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${nunito.variable} ${lora.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-[family-name:var(--font-nunito)]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
