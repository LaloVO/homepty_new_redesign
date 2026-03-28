import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  style: ["normal"]
});

export const metadata: Metadata = {
  title: "Homepty",
  description: "Plataforma de gestión inmobiliaria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <body
        className={`${montserrat.className} antialiased bg-[var(--background-light)]`}
      >
        {children}
      </body>
    </html>
  );
}
