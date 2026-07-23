import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Freyr AI — Hello World",
  description: "Welcome to Freyr AI.",
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
