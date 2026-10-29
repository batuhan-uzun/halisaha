import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { Stadium } from "@/components/Stadium";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "Halı Saha",
  description: "Önümüzdeki 30 gün kim ne zaman müsait, maç ne zaman ve nerede.",
};

export const viewport: Viewport = {
  themeColor: "#040c08",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={archivo.variable}>
      <body>
        <Stadium />
        {children}
      </body>
    </html>
  );
}
