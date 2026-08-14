import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Mon Mariage — Trouvez vos prestataires",
  description:
    "Recherchez et comparez les meilleurs prestataires pour votre mariage.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={cn("h-full", inter.variable, fraunces.variable)}
    >
      <body className="min-h-full flex flex-col bg-porcelain font-sans">
        {children}
      </body>
    </html>
  );
}
