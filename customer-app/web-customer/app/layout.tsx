import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://flashfit.in"), // Replace with actual domain
  title: {
    default: "FlashFit | 60 Min Clothes Delivered",
    template: "%s | FlashFit"
  },
  description: "Get premium clothes delivered in 60 minutes. Shop the best sports gear, activewear, and fitness equipment. Fast delivery, easy returns.",
  keywords: ["sports", "fitness", "activewear", "gym gear", "running shoes", "flashfit", "decathlon alternative", "india sports"],
  authors: [{ name: "FlashFit Team" }],
  creator: "FlashFit",
  openGraph: {
    title: "FlashFit | Premium Sports & Fitness Gear",
    description: "Discover our new collection of high-performance gear designed for every athlete.",
    url: "https://flashfit.in",
    siteName: "FlashFit",
    images: [
      {
        url: "/og-image.jpg", // Ensure this image exists in public folder
        width: 1200,
        height: 630,
        alt: "FlashFit - Ready to Play",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlashFit | Premium Sports & Fitness Gear",
    description: "Shop the best sports gear, activewear, and fitness equipment.",
    images: ["/og-image.jpg"], // Same as OG image
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
          <main className="min-h-screen pt-20 pb-16">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}