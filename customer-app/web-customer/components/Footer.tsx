import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
    return (
        <footer className="bg-zinc-950 border-t border-white/10 pt-20 pb-10">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6">
                        <h3 className="text-3xl font-black italic tracking-tighter text-white">FLASHFIT</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Defining the future of streetwear and athletic aesthetics.
                            Born in Mumbai, worn globally.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase tracking-wider">Shop</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link href="/category/women" className="hover:text-white transition-colors">Women</Link></li>
                            <li><Link href="/category/men" className="hover:text-white transition-colors">Men</Link></li>
                            <li><Link href="/category/urban-style" className="hover:text-white transition-colors">Urban Style</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase tracking-wider">Support</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link href="/track-order" className="hover:text-white transition-colors">Track Order</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase tracking-wider">Stay in the loop</h4>
                        <div className="flex gap-2">
                            <Input placeholder="Enter your email" className="bg-white/5 border-white/10 text-white" autoComplete="off" />
                            <Button className="bg-white text-black hover:bg-gray-200">Join</Button>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>© 2024 FlashFit Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-white">Privacy</Link>
                        <Link href="/terms" className="hover:text-white">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
