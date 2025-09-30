import Link from "next/link";
import Logo from "@/components/shared/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
        <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center">
                 <Link href="/" aria-label="Back to homepage">
                    <Logo />
                 </Link>
            </div>
            {children}
        </div>
    </div>
  );
}
