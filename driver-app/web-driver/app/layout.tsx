import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { BottomNav } from "@/components/BottomNav";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "FlashFit Driver | Delivery Partner App",
    description: "Manage deliveries, track earnings, and navigate to customers with the FlashFit Driver App.",
    manifest: "/manifest.json",
    themeColor: "#000000",
    viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
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
