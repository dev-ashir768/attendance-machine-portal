'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else if (user?.role === 'ADMIN') {
      router.push('/attendance-history');
    } else {
      // Default page for EMPLOYEE if needed, for now just redirect to login or show something
      // Since the prompt focused on ADMIN attendance history, I'll redirect them to a profile or similar
      // Or just leave them on a simple home page.
    }
  }, [token, user, router]);

  if (!token) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground font-medium text-lg">
        Redirecting to your dashboard...
      </p>
    </div>
  );
}
