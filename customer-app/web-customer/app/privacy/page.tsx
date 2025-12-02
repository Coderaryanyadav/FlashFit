import { Header } from "@/components/Header";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <Header />
            <main className="container mx-auto px-4 pt-24 max-w-3xl">
                <h1 className="text-4xl font-black italic mb-8">PRIVACY POLICY</h1>
                <div className="prose prose-invert max-w-none">
                    <p className="text-gray-400 mb-6">Last updated: December 2025</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">1. Information We Collect</h2>
                        <p className="text-gray-400">
                            We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This includes your name, email, phone number, and shipping address.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">2. How We Use Your Information</h2>
                        <p className="text-gray-400">
                            We use the information we collect to process your orders, communicate with you, and improve our services. We do not sell your personal data to third parties.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">3. Security</h2>
                        <p className="text-gray-400">
                            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
