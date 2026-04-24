import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ropaya — Ropa de Avellaneda a domicilio",
  description: "Comprá ropa de los mejores locales de Avellaneda sin salir de tu casa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-zinc-950 text-zinc-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
