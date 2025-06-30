'use client';

import React, { PropsWithChildren, useState } from 'react';
import Footer from '@/layout/footer';
import Navbar from '@/layout/navbar';
import Sidebar from '@/layout/sidebar';

export default function Layout({ children }: PropsWithChildren) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-offCream font-sf-pro">
      <Navbar
        isOpen={isSidebarOpen}
        toggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        toggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <main className="flex-1 w-full">
        <div className="w-full animate-fadeInUp">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
