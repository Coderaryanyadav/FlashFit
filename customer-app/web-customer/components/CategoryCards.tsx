'use client';

import Link from 'next/link';
import Image from 'next/image';

const categories = [
  { id: 'oversized', name: 'OVERSIZED', image: 'https://images.unsplash.com/photo-1594938298606-c5a78614975a?w=400' },
  { id: 'shirts', name: 'SHIRTS', image: 'https://images.unsplash.com/photo-1594938291221-94f18cbb566b?w=400' },
  { id: 'jeans', name: 'JEANS', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400' },
  { id: 'cargos', name: 'CARGOS', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400' },
];

export default function CategoryCards() {
  return (
    <div className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-hide">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/collection?category=${category.id}`}
          className="flex-shrink-0 w-32 h-32 bg-gray-800 rounded-lg overflow-hidden relative group"
        >
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="text-white font-bold text-sm transform -rotate-12">
              {category.name}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
