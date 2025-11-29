"use client";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-white py-24 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-black mb-8">Terms of Service</h1>
                <div className="space-y-6 text-gray-300">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p>By accessing and using FlashFit, you accept and agree to be bound by these Terms of Service.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Use of Service</h2>
                        <p>You agree to use our service only for lawful purposes and in accordance with these Terms.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Orders and Payment</h2>
                        <p>All orders are subject to acceptance and availability. Prices are subject to change without notice.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Delivery</h2>
                        <p>We strive to deliver within the estimated time frame, but delays may occur due to unforeseen circumstances.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Returns and Refunds</h2>
                        <p>Please refer to our return policy for information on returns and refunds.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Contact</h2>
                        <p>For questions about these Terms, contact us at legal@flashfit.com</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
