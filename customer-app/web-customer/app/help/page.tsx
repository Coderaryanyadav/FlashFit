import { Header } from "@/components/Header";
import { Mail, Phone, MapPin } from "lucide-react";

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            <main className="container mx-auto px-4 py-24 max-w-2xl">
                <h1 className="text-4xl font-black mb-8">Help Center</h1>
                <div className="space-y-8">
                    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
                        <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                    <Mail className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Email Support</p>
                                    <a href="mailto:aryanjyadav@gmail.com" className="text-xl font-bold hover:text-blue-400 transition-colors">aryanjyadav@gmail.com</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                    <Phone className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Phone Support</p>
                                    <a href="tel:882809597" className="text-xl font-bold hover:text-blue-400 transition-colors">882809597</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
                        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            <details className="group">
                                <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                                    <span>How do I track my order?</span>
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <p className="text-gray-400 mt-3 group-open:animate-fadeIn">
                                    You can track your order by clicking on the "Track Order" link in the header or visiting your profile page.
                                </p>
                            </details>
                            <div className="h-px bg-zinc-800 my-4" />
                            <details className="group">
                                <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                                    <span>What is the return policy?</span>
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <p className="text-gray-400 mt-3 group-open:animate-fadeIn">
                                    We accept returns within 7 days of delivery. Please contact support to initiate a return.
                                </p>
                            </details>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
