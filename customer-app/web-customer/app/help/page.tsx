"use client";

import { Header } from "@/components/Header";
import { Mail, Phone, MessageCircle, ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <Header />
            <main className="container mx-auto px-4 pt-24 max-w-2xl">
                <h1 className="text-4xl font-black italic mb-2">HELP CENTER</h1>
                <p className="text-gray-400 mb-8">We&apos;re here to help you 24/7.</p>

                <div className="grid gap-4 mb-12">
                    <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                <MessageCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold">Live Chat</h3>
                                <p className="text-sm text-gray-400">Wait time: ~2 mins</p>
                            </div>
                        </div>
                        <Button className="bg-white text-black font-bold hover:bg-gray-200">Start Chat</Button>
                    </div>

                    <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold">Email Support</h3>
                                <p className="text-sm text-gray-400">Response within 24h</p>
                            </div>
                        </div>
                        <a href="mailto:support@flashfit.in">
                            <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">Email Us</Button>
                        </a>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    <AccordionItem value="item-1" className="border border-white/5 rounded-xl px-4 bg-zinc-900/50">
                        <AccordionTrigger className="hover:no-underline">How do I track my order?</AccordionTrigger>
                        <AccordionContent className="text-gray-400">
                            You can track your order by clicking on the &quot;Track Order&quot; link in the header or visiting your profile page. You&apos;ll receive real-time updates via SMS.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border border-white/5 rounded-xl px-4 bg-zinc-900/50">
                        <AccordionTrigger className="hover:no-underline">What is the return policy?</AccordionTrigger>
                        <AccordionContent className="text-gray-400">
                            We offer a 7-day hassle-free return policy for all unused items with original tags. Refunds are processed within 48 hours of pickup.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border border-white/5 rounded-xl px-4 bg-zinc-900/50">
                        <AccordionTrigger className="hover:no-underline">Do you ship internationally?</AccordionTrigger>
                        <AccordionContent className="text-gray-400">
                            Currently, we only ship within India. We plan to expand globally soon!
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border border-white/5 rounded-xl px-4 bg-zinc-900/50">
                        <AccordionTrigger className="hover:no-underline">How do I find my size?</AccordionTrigger>
                        <AccordionContent className="text-gray-400">
                            Check the &quot;Size Guide&quot; on every product page. Our fits are generally oversized, so we recommend sizing down for a regular fit.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </main>
        </div>
    );
}
