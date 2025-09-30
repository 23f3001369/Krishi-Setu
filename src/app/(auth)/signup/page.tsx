import { FarmerSignUpForm } from "@/components/auth/farmer-signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from 'next/link';

export default function FarmerSignUpPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Create a Farmer Account</CardTitle>
        <CardDescription>Join our community of smart farmers.</CardDescription>
      </CardHeader>
      <CardContent>
        <FarmerSignUpForm />
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline text-primary">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
