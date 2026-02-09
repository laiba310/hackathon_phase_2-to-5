'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ChatWidget from '@/components/ChatWidget/ChatWidget';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (!user) {
    return null; // Redirect will happen via useEffect
  }

  return (
    <div className="flex h-screen overflow-hidden flex-row bg-gray-900">
      <Sidebar userId={user.id.toString()} />
      <div className="flex-1 h-full overflow-y-auto p-4 md:p-8 relative scroll-smooth w-full">
        {children}
        <ChatWidget />
      </div>
    </div>
  );
}