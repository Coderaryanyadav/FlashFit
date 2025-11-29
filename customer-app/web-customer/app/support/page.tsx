"use client";

import { Header } from "@/components/Header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, Phone, MessageCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Header />

            <main className="container mx-auto px-4 py-24 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-black mb-4">How can we help?</h1>
                    <p className="text-gray-400 text-lg">
                        We're here for you 24/7. Choose how you'd like to connect.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {/* WhatsApp - New */}
                    <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5 hover:border-green-500/50 transition-colors text-center group">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500/20 transition-colors">
                            <MessageCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <h3 className="font-bold text-xl mb-2">WhatsApp Us</h3>
                        <p className="text-gray-400 text-sm mb-6">Fastest response time (Under 5 mins)</p>
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl" onClick={() => window.open('https://wa.me/918828095997', '_blank')}>
                            Chat on WhatsApp
                        </Button>
                    </div>

                    {/* Email */}
                    <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5 hover:border-purple-500/50 transition-colors text-center group">
                        <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-500/20 transition-colors">
                            <Mail className="h-8 w-8 text-purple-500" />
                        </div>
                        <h3 className="font-bold text-xl mb-2">Email Support</h3>
                        <p className="text-gray-400 text-sm mb-6">aryanjyadav@gmail.com</p>
                        <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white font-bold rounded-xl" onClick={() => window.location.href = 'mailto:aryanjyadav@gmail.com'}>
                            Send Email
                        </Button>
                    </div>

                    {/* Phone */}
                    <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5 hover:border-blue-500/50 transition-colors text-center group">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500/20 transition-colors">
                            <Phone className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="font-bold text-xl mb-2">Call Us</h3>
                        <p className="text-gray-400 text-sm mb-6">+91 88280 95997</p>
                        <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white font-bold rounded-xl" onClick={() => window.location.href = 'tel:+918828095997'}>
                            Call Now
                        </Button>
                    </div>
                </div>

                <div className="bg-zinc-900/30 rounded-3xl p-8 md:p-12 border border-white/5">
                    <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-white/10">
                            <AccordionTrigger className="text-lg font-medium hover:text-purple-400">Where is my order?</AccordionTrigger>
                            <AccordionContent className="text-gray-400 text-base leading-relaxed">
                                You can track your order in real-time by visiting the <a href="/track-order" className="text-purple-400 underline">Track Order</a> page. We offer 60-minute delivery in select Mumbai areas!
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="border-white/10">
                            <AccordionTrigger className="text-lg font-medium hover:text-purple-400">What is your return policy?</AccordionTrigger>
                            <AccordionContent className="text-gray-400 text-base leading-relaxed">
                                We offer a hassle-free 7-day return policy for all unworn items with tags attached. Refunds are processed instantly to your original payment method upon pickup.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3" className="border-white/10">
                            <AccordionTrigger className="text-lg font-medium hover:text-purple-400">Do you ship internationally?</AccordionTrigger>
                            <AccordionContent className="text-gray-400 text-base leading-relaxed">
                                Currently, we only ship within India, with express 60-minute delivery available in specific Mumbai pincodes (400059).
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4" className="border-white/10">
                            <AccordionTrigger className="text-lg font-medium hover:text-purple-400">How do I contact support?</AccordionTrigger>
                            <AccordionContent className="text-gray-400 text-base leading-relaxed">
                                You can reach us via WhatsApp (fastest), email at aryanjyadav@gmail.com, or call us at +91 88280 95997.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </main>
        </div>
    );
}
