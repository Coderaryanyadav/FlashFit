"use client";

export function Marquee({ text }: { text: string }) {
    return (
        <div className="bg-primary text-black py-2 overflow-hidden whitespace-nowrap border-y border-black relative flex">
            <div className="animate-marquee whitespace-nowrap flex">
                {[...Array(20)].map((_, i) => (
                    <span key={i} className="text-sm font-black uppercase tracking-widest mx-8">
                        {text}
                    </span>
                ))}
            </div>
            <div className="animate-marquee whitespace-nowrap flex absolute top-2 left-0">
                {[...Array(20)].map((_, i) => (
                    <span key={i + 20} className="text-sm font-black uppercase tracking-widest mx-8">
                        {text}
                    </span>
                ))}
            </div>
        </div>
    );
}
