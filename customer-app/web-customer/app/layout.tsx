import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { BackToTop } from "@/components/BackToTop";
import { MobileNav } from "@/components/MobileNav";
import { SessionTimeout } from "@/components/SessionTimeout";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlashFit | 60 Min Clothes Delivered",
  description: "Get premium clothes delivered in 60 minutes. Shop the best sports gear, activewear, and fitness equipment. Fast delivery, easy returns.",
  manifest: "/manifest.json",
  keywords: ["sports", "fitness", "activewear", "gym gear", "running shoes", "flashfit", "decathlon alternative", "india sports"],
  authors: [{ name: "FlashFit Team" }],
  creator: "FlashFit",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://flashfit.in",
    siteName: "FlashFit",
    title: "FlashFit | Premium Sports & Fitness Gear",
    description: "Discover our new collection of high-performance gear designed for every athlete.",
    images: [
      {
        url: "https://flashfit.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FlashFit - Ready to Play",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlashFit | Premium Sports & Fitness Gear",
    description: "Shop the best sports gear, activewear, and fitness equipment.",
    images: ["https://flashfit.in/og-image.jpg"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="min-h-screen pt-40 pb-16">
            {children}
          </main>
          <Footer />
          <BackToTop />
          <MobileNav />
          {/* <SessionTimeout /> */}
        </Providers>
      </body>
    </html>
  );
}