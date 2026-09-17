'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { BottomNav } from './bottom-nav';
import { useApp } from '@/context/app-context';
import { cn } from '@/lib/utils';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { 
    isSidebarCollapsed, 
    toggleSidebar, 
    searchQuery, 
    setSearchQuery 
  } = useApp();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // If on auth pages, render pure children without Sidebar/Topbar/BottomNav
  const isAuthPage = 
    pathname.startsWith('/login') || 
    pathname.startsWith('/register') || 
    pathname.startsWith('/forgot-password') || 
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/auth');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-page-background text-text-primary antialiased font-sans">
      {/* Sidebar Component */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'w-full flex flex-col min-h-screen transition-all duration-300 pb-16 md:pb-0',
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-60'
        )}
      >
        {/* Topbar Header */}
        <Topbar
          onToggleSidebar={() => {
            if (window.innerWidth < 768) {
              setIsMobileOpen(!isMobileOpen);
            } else {
              toggleSidebar();
            }
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
};
