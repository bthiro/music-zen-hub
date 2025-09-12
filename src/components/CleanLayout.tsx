import React from 'react';
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface CleanLayoutProps {
  children: React.ReactNode;
}

export function CleanLayout({ children }: CleanLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen w-full flex flex-col bg-background">
        <div className="flex flex-1 w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <Header />
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}