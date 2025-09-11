import React from 'react';
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";

interface CleanLayoutProps {
  children: React.ReactNode;
}

export function CleanLayout({ children }: CleanLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}