'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, Home, Grid3x3 } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
      <div className="flex justify-around items-center py-2">
        <Link href="/" className="flex flex-col items-center gap-1 px-4 py-2">
          <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${isActive('/') && pathname === '/' ? 'bg-blue-600' : ''}`}>
            <Home className={`w-5 h-5 ${isActive('/') && pathname === '/' ? 'text-white' : 'text-gray-400'}`} />
          </div>
          <span className={`text-xs ${isActive('/') && pathname === '/' ? 'text-blue-400' : 'text-gray-400'}`}>Home</span>
        </Link>
        
        <Link href="/collection" className="flex flex-col items-center gap-1 px-4 py-2">
          <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${isActive('/collection') ? 'bg-blue-600' : ''}`}>
            <Grid3x3 className={`w-5 h-5 ${isActive('/collection') ? 'text-white' : 'text-gray-400'}`} />
          </div>
          <span className={`text-xs ${isActive('/collection') ? 'text-blue-400' : 'text-gray-400'}`}>Collection</span>
        </Link>
        
        <Link href="/trends" className="flex flex-col items-center gap-1 px-4 py-2">
          <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${isActive('/trends') ? 'bg-blue-600' : ''}`}>
            <Heart className={`w-5 h-5 ${isActive('/trends') ? 'text-white' : 'text-gray-400'}`} />
          </div>
          <span className={`text-xs ${isActive('/trends') ? 'text-blue-400' : 'text-gray-400'}`}>Trends</span>
        </Link>
        
        <Link href="/bag" className="flex flex-col items-center gap-1 px-4 py-2">
          <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${isActive('/bag') || isActive('/cart') ? 'bg-blue-600' : ''}`}>
            <ShoppingBag className={`w-5 h-5 ${isActive('/bag') || isActive('/cart') ? 'text-white' : 'text-gray-400'}`} />
          </div>
          <span className={`text-xs ${isActive('/bag') || isActive('/cart') ? 'text-blue-400' : 'text-gray-400'}`}>Bag</span>
        </Link>
      </div>
    </nav>
  );
}
