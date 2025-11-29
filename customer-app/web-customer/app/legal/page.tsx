"use client";

import { Header } from "@/components/Header";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            <div className="container mx-auto px-4 pt-32 pb-20">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-black mb-8">Terms & Conditions</h1>
                    <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 text-gray-300 space-y-6">
                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">1. Introduction</h2>
                            <p>Welcome to FlashFit. By using our app, you agree to these terms. We provide ultra-fast delivery of fashion and lifestyle products.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">2. Delivery Policy</h2>
                            <p>We aim to deliver within 10-30 minutes in serviceable areas. However, delivery times may vary due to traffic, weather, or unforeseen circumstances. We are not liable for delays beyond our control.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">3. Returns & Refunds</h2>
                            <p>Returns are accepted at the doorstep for size issues. Damaged items must be reported immediately. Refunds are processed to the original payment method within 5-7 business days.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">4. User Conduct</h2>
                            <p>You agree not to misuse the platform. Fraudulent orders or abuse of the return policy may result in account suspension.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">5. Privacy</h2>
                            <p>Your data is safe with us. We only share necessary details (address, phone) with our delivery partners to fulfill your order.</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
