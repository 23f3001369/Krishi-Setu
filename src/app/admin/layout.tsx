
'use client'

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
} from '@/components/ui/sidebar';
import Logo from '@/components/shared/logo';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminSidebarNav } from '@/components/admin/admin-sidebar';
import { useIsMobile } from '@/hooks/use-mobile';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const isMobile = useIsMobile();
  if (isMobile === undefined) {
    return null; // or a loading skeleton
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <AdminSidebarNav />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <AdminHeader />
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
