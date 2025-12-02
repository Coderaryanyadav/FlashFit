import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <Header />

            {/* Hero Section */}
            <div className="relative h-[60vh] w-full">
                <Image
                    src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1600&q=80"
                    alt="About FlashFit"
                    fill
                    className="object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                    <div className="container mx-auto">
                        <h1 className="text-5xl md:text-7xl font-black italic mb-4 tracking-tighter">
                            WE ARE <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">FLASHFIT</span>
                        </h1>
                        <p className="text-xl md:text-2xl font-bold max-w-2xl text-gray-300">
                            Redefining streetwear for the modern generation. Fast, furious, and fit for purpose.
                        </p>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-20">
                {/* Mission */}
                <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
                    <div>
                        <h2 className="text-3xl font-black italic mb-6">OUR MISSION</h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-6">
                            FlashFit was born from a simple idea: that style shouldn&apos;t compromise comfort. We bridge the gap between high-performance athletic wear and cutting-edge street fashion.
                        </p>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            We believe in clothing that moves with you, whether you&apos;re hitting the gym or hitting the streets. Every piece is designed with precision, using premium fabrics that last.
                        </p>
                    </div>
                    <div className="relative h-[400px] rounded-3xl overflow-hidden border border-white/10">
                        <Image
                            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80"
                            alt="Our Mission"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32 border-y border-white/10 py-16">
                    <div className="text-center">
                        <h3 className="text-4xl font-black text-white mb-2">50K+</h3>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Happy Customers</p>
                    </div>
                    <div className="text-center">
                        <h3 className="text-4xl font-black text-white mb-2">100+</h3>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Unique Designs</p>
                    </div>
                    <div className="text-center">
                        <h3 className="text-4xl font-black text-white mb-2">24/7</h3>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Support</p>
                    </div>
                    <div className="text-center">
                        <h3 className="text-4xl font-black text-white mb-2">IND</h3>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Made in India</p>
                    </div>
                </div>

                {/* Values */}
                <div className="mb-20">
                    <h2 className="text-3xl font-black italic mb-12 text-center">OUR VALUES</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Quality First", desc: "We never compromise on fabric or stitching. Built to last." },
                            { title: "Sustainable", desc: "Eco-friendly packaging and ethical manufacturing processes." },
                            { title: "Community", desc: "We're more than a brand; we're a movement of fitness enthusiasts." }
                        ].map((value, i) => (
                            <div key={i} className="bg-zinc-900 p-8 rounded-2xl border border-white/5 hover:border-white/20 transition-colors">
                                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                                <p className="text-gray-400">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
