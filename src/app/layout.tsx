import type { Metadata } from "next";
import { Geist, Geist_Mono, Mansalva, Cherry_Bomb_One } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const mansalva = Mansalva({
  subsets: ["latin"],
  weight: "400", // Mansalva only has 400
  variable: "--font-mansalva", // Optional: CSS variable
});

const cherryBombOne = Cherry_Bomb_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-cherry-bomb-one",
});

export const metadata: Metadata = {
  title: "Ambiance Creation App",
  description: "Create or listen to dynamic ambiances",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${mansalva.variable} ${cherryBombOne.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
