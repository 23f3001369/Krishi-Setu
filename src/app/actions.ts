
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type AdminLoginState = {
  error?: string;
  success?: boolean;
};

export async function adminLogin(
  prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const parsed = adminLoginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "Invalid form data." };
  }
  
  const { email, password } = parsed.data;

  // IMPORTANT: This is a mock login with fixed credentials.
  // In a real application, use a secure authentication method.
  if (email === "admin@krishusetu.com" && password === "admin123") {
    // In a real app, you would set a session cookie here.
    redirect("/admin/dashboard");
  }

  return { error: "Invalid email or password." };
}
