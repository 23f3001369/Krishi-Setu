
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional().or(z.literal('')),
  mobile: z.string().optional().or(z.literal('')),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
}).refine(data => data.email, {
    message: "Email is required.", // Firebase requires email for email/password auth
    path: ["email"], // Show error on email field
});

export function FarmerSignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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

    if (!values.email) {
      toast({
        variant: "destructive",
        title: "Sign-up Failed",
        description: "Email is a required field.",
      });
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // 2. Store user info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: values.name,
        email: values.email,
        mobile: values.mobile || "",
        createdAt: new Date(),
      });
      
      toast({
        title: "Account Created",
        description: "You have been successfully signed up. Redirecting to login...",
      });
      router.push("/login");

    } catch (error: any) {
      console.error("Signup error:", error);
      let description = "An unknown error occurred during sign up.";
      switch (error.code) {
        case "auth/email-already-in-use":
          description = "This email address is already in use by another account.";
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
        case "auth/configuration-not-found":
            description = "Firebase configuration is missing. Please contact support.";
            break;
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
              <FormDescription>
                Email is required for login. You can add a mobile number too.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Number (Optional)</FormLabel>
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
