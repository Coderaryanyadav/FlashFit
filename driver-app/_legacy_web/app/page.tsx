'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/client';

export default function DriverHome() {
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/orders');
      } else {
        router.push('/login');
      }
    });
  }, [router]);

  return <div className="min-h-screen bg-gray-900 flex items-center justify-center">Loading...</div>;
}
