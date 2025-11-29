"use client";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white py-24 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-black mb-8">Privacy Policy</h1>
                <div className="space-y-6 text-gray-300">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, including name, email, phone number, delivery address, and payment information.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                        <p>We use the information we collect to process orders, communicate with you, and improve our services.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Information Sharing</h2>
                        <p>We do not sell your personal information. We share information only with delivery partners to fulfill your orders.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                        <p>We implement appropriate security measures to protect your personal information.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
                        <p>If you have questions about this Privacy Policy, please contact us at privacy@flashfit.com</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
