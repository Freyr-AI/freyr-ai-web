import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Freyr AI — Accelerated AI Infrastructure",
  description:
    "Freyr builds high-performance GPU infrastructure and token platforms for the next generation of AI.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
