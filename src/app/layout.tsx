import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CUP-FICCT",
  description: "Sistema CUP-FICCT — Autenticación",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
