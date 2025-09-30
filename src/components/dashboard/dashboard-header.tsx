import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import Link from 'next/link';

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      {/* Breadcrumbs could go here */}
      <div className="ml-auto flex items-center gap-2">
        <NotificationMenu />
        <ThemeToggle />
      </div>
    </header>
  );
}

function NotificationMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/dashboard" passHref>
          <DropdownMenuItem className="flex-col items-start gap-1 cursor-pointer">
              <p className="font-bold text-destructive">Weather Alert: Heavy Rain</p>
              <p className="text-xs text-muted-foreground">Heavy rain expected today. Ensure proper drainage.</p>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <Link href="/dashboard/agrinews" passHref>
          <DropdownMenuItem className="flex-col items-start gap-1 cursor-pointer">
              <p className="font-bold">Price Alert: Wheat</p>
              <p className="text-xs text-muted-foreground">Mandi prices have increased by 5% in your region.</p>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <Link href="/dashboard/agrinews" passHref>
          <DropdownMenuItem className="flex-col items-start gap-1 cursor-pointer">
              <p className="font-bold">New Govt. Scheme</p>
              <p className="text-xs text-muted-foreground">The PM Fasal Bima Yojana deadline has been extended.</p>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
