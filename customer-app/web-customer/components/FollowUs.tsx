'use client';

import { Instagram } from 'lucide-react';

export default function FollowUs() {
  return (
    <div className="mx-4 my-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)'
        }}></div>
      </div>
      
      <div className="relative z-10">
        <h2 className="text-3xl font-bold text-white mb-2">FOLLOW US</h2>
        <p className="text-blue-100 text-sm mb-4">
          GET EARLY ACCESS TO OFFERS AND NEW LAUNCHES
        </p>
        <div className="flex items-center gap-2 mb-4">
          <Instagram className="w-5 h-5 text-white" />
          <span className="text-white font-semibold">@flashfit.co</span>
        </div>
        <a
          href="https://instagram.com/flashfit.co"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          Follow Now →
        </a>
      </div>
    </div>
  );
}
