

'use client'

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  LayoutDashboard,
  Menu,
  Tractor,
  BrainCircuit,
  LogOut,
  User,
  TestTubeDiagonal,
  Wallet,
  ClipboardList,
  Users,
  MessageSquare,
  List,
  TrendingUp,
  ShoppingCart,
  FlaskConical,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
  SidebarInset,
  SidebarMenuBadge,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import Logo from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { VisuallyHidden } from '@/components/ui/visually-hidden';


const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/farm-registration', icon: Tractor, label: 'Farm Registration' },
  { href: '/dashboard/krishi-khata', icon: Wallet, label: 'Krishi Khata' },
  { href: '/dashboard/my-guides', icon: List, label: 'My Guides' },
  { href: '/dashboard/cultivation-guide', icon: ClipboardList, label: 'New Guide' },
  { href: '/dashboard/crop-recommendation', icon: BrainCircuit, label: 'AI Crop Tool' },
  { href: '/dashboard/disease-detection', icon: TestTubeDiagonal, label: 'AI Disease Detection' },
  { href: '/dashboard/market-price-prediction', icon: TrendingUp, label: 'Market Price AI' },
  { href: '/dashboard/learning-hub', icon: BookOpen, label: 'AgriVaani' },
  { href: '/dashboard/community-forum', icon: Users, label: 'Community Forum' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
];

const logoutItem = { href: '/', icon: LogOut, label: 'Log out' };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [mounted, setMounted] = React.useState(false);
  const isMobile = useIsMobile();
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or a loading skeleton
  }

  if (isMobile) {
    return <MobileDashboardLayout>{children}</MobileDashboardLayout>
  }
  
  return <DesktopDashboardLayout>{children}</DesktopDashboardLayout>
}


function DesktopDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFarmRegistrationPage = pathname === '/dashboard/farm-registration';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                       {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
              <SidebarMenu>
                 <SidebarMenuItem>
                    <Link href={logoutItem.href}>
                      <SidebarMenuButton tooltip={logoutItem.label}>
                          <logoutItem.icon />
                          <span>{logoutItem.label}</span>
                      </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
              </SidebarMenu>
              <UserMenu/>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
           <div className="flex flex-col h-screen">
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto">
              <div className={cn(!isFarmRegistrationPage && "p-4 sm:p-6 lg:p-8")}>
                <div className={cn(!isFarmRegistrationPage && "w-full max-w-7xl mx-auto")}>
                  {children}
                </div>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

function MobileDashboardLayout({children}: {children: React.ReactNode}){
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
     <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 flex flex-col">
            <SheetHeader className="p-2">
                <VisuallyHidden>
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>Main navigation for the application.</SheetDescription>
                </VisuallyHidden>
            </SheetHeader>
            <nav className="grid gap-6 text-lg font-medium p-4 overflow-y-auto">
              <Link href="#" className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Logo />
                <span className="sr-only">AgriAssist</span>
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                    pathname === item.href ? 'text-primary bg-muted' : 'text-muted-foreground hover:text-primary'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                   {item.badge && <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">{item.badge}</span>}
                </Link>
              ))}
            </nav>
            <div className="mt-auto p-4 border-t">
                 <Link
                  href={logoutItem.href}
                  onClick={() => setOpen(false)}
                  className={'flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-muted-foreground hover:text-primary'}
                >
                  <logoutItem.icon className="h-4 w-4" />
                  {logoutItem.label}
                </Link>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className="ml-auto flex items-center gap-2">
               <UserMenu />
               <ThemeToggle />
            </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  )
}

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="rounded-full flex gap-2 h-9 w-full justify-start px-2 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Avatar className="h-6 w-6">
            <AvatarImage src="https://picsum.photos/seed/avatar/100/100" alt="Farmer" />
            <AvatarFallback>F</AvatarFallback>
          </Avatar>
          <span className="group-data-[collapsible=icon]:hidden">Farmer</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className='w-56'>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
