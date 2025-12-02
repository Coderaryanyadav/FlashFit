import { Header } from "@/components/Header";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <Header />
            <main className="container mx-auto px-4 pt-24 max-w-3xl">
                <h1 className="text-4xl font-black italic mb-8">TERMS OF SERVICE</h1>
                <div className="prose prose-invert max-w-none">
                    <p className="text-gray-400 mb-6">Last updated: December 2025</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">1. Introduction</h2>
                        <p className="text-gray-400">
                            Welcome to FlashFit. By accessing our website and using our services, you agree to be bound by these Terms of Service. Please read them carefully.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">2. Use of Service</h2>
                        <p className="text-gray-400">
                            You must be at least 18 years old to use our services. You agree not to use our products for any illegal or unauthorized purpose.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">3. Products and Pricing</h2>
                        <p className="text-gray-400">
                            We reserve the right to modify or discontinue any product at any time. Prices are subject to change without notice. We are not liable to you or any third party for any modification, price change, suspension, or discontinuance of the Service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">4. Returns and Refunds</h2>
                        <p className="text-gray-400">
                            Our return policy lasts 7 days. If 7 days have gone by since your purchase, unfortunately, we can’t offer you a refund or exchange. To be eligible for a return, your item must be unused and in the same condition that you received it.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
