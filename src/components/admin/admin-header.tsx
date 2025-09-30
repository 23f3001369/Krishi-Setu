import Link from "next/link";
import Logo from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <Logo />
            <span className="font-bold font-headline sm:inline-block">Admin Panel</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
