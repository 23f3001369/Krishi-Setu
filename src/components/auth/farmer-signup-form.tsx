
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth, useFirestore, errorEmitter, FirestorePermissionError } from "@/firebase";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  mobile: z.string().min(10, {
    message: "Please enter a valid 10-digit mobile number.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export function FarmerSignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (!auth || !db) {
        toast({
            variant: "destructive",
            title: "Sign-up Failed",
            description: "Firebase is not initialized. Please try again later.",
        });
        setIsLoading(false);
        return;
    }

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      // 2. Update the user's profile with their name
      await updateProfile(user, { displayName: values.name });

      // 3. Prepare user data for Firestore
      const userData = {
        uid: user.uid,
        name: values.name,
        email: values.email,
        phone: values.mobile, // Changed from 'mobile' to 'phone' to match backend.json
        createdAt: new Date(),
      };
      
      const userDocRef = doc(db, "farmers", user.uid);

      // 4. Store user info in Firestore (non-blocking with custom error handling)
      setDoc(userDocRef, userData)
        .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'create',
                requestResourceData: userData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });

      
      toast({
        title: "Account Created",
        description: "You have been successfully signed up. Redirecting to login...",
      });
      router.push("/login");

    } catch (error: any) {
      console.error("Signup error:", error);
      let description: React.ReactNode = "An unknown error occurred during sign up.";

      if (error.name === 'FirebaseError') {
          switch (error.code) {
            case "auth/email-already-in-use":
              description = (
                <span>
                  This email is already registered. Please{' '}
                  <Link href="/login" className="underline font-bold">
                    log in
                  </Link>{' '}
                  instead.
                </span>
              );
              break;
            case "auth/invalid-email":
              description = "The email address you entered is not valid.";
              break;
            case "auth/operation-not-allowed":
              description = "Email/password accounts are not enabled. Please contact support.";
              break;
            case "auth/weak-password":
              description = "The password is too weak. Please choose a stronger password.";
              break;
            case "auth/api-key-not-valid":
              description = "There's an issue with the application configuration. Please contact support.";
              break;
            case "permission-denied":
                 description = "You do not have permission to perform this action. Please check the security rules.";
                 break;
            default:
                description = "An unexpected error occurred. Please try again.";
                break;
          }
      }
      
      toast({
        variant: "destructive",
        title: "Sign-up Failed",
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Appleseed" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Number</FormLabel>
              <FormControl>
                <Input placeholder="9876543210" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
           {isLoading ? "Signing up..." : "Sign Up"}
        </Button>
      </form>
    </Form>
  );
}
