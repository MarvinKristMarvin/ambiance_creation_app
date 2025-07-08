import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Mansalva,
  Cherry_Bomb_One,
  Darumadrop_One,
  Oi,
  Hanalei_Fill,
  ZCOOL_KuaiLe,
  Monoton,
  Dela_Gothic_One,
} from "next/font/google";
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

const darumadropOne = Darumadrop_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-Darumadrop_One",
});

const oi = Oi({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-Oi",
});

const hanaleiFill = Hanalei_Fill({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-Hanalei_Fill",
});

const zcoolKuaile = ZCOOL_KuaiLe({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-ZCOOL_KuaiLe",
});

const monoton = Monoton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-monoton",
});

const delaGothicOne = Dela_Gothic_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dela-gothic-one",
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
      className={`${geistSans.variable} ${geistMono.variable} ${mansalva.variable} ${cherryBombOne.variable} ${darumadropOne.variable} ${oi.variable} ${hanaleiFill.variable} ${zcoolKuaile.variable} ${monoton.variable} ${delaGothicOne.variable}  antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
