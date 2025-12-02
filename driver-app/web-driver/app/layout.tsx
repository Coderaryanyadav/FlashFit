import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { BottomNav } from "@/components/BottomNav";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "FlashFit Driver | Delivery Partner App",
    description: "Manage deliveries, track earnings, and navigate to customers with the FlashFit Driver App.",
    manifest: "/manifest.json",
};

export const viewport: Viewport = {
    themeColor: "#000000",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-black text-white antialiased`}>
                {children}
                <BottomNav />
                <Toaster />
            </body>
        </html>
    );
}
