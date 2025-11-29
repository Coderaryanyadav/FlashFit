'use client';

import { Sparkles } from 'lucide-react';

const offers = [
  { id: 1, discount: '₹1000', minCart: '₹2499', cartValue: 2499 },
  { id: 2, discount: '₹500', minCart: '₹1499', cartValue: 1499 },
  { id: 3, discount: '₹250', minCart: '₹999', cartValue: 999 },
];

export default function PromotionalCards() {
  return (
    <div className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-hide">
      {offers.map((offer) => (
        <div
          key={offer.id}
          className="flex-shrink-0 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-4 min-w-[280px] relative overflow-hidden"
        >
          <div className="absolute top-2 right-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div className="relative z-10">
            <div className="text-2xl font-bold text-white mb-1">
              Extra {offer.discount} Off
            </div>
            <div className="text-sm text-purple-100">
              On Cart Value
            </div>
            <div className="text-lg font-semibold text-white mt-1">
              {offer.minCart}+
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
