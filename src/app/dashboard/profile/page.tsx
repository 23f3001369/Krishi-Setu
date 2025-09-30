
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Edit, Shield } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
});

const passwordFormSchema = z.object({
    currentPassword: z.string().min(6, 'Password must be at least 6 characters.'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters.'),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match.',
    path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

// Mock user data
const defaultValues: Partial<ProfileFormValues> = {
  name: 'Farmer',
  email: 'farmer@agriassist.com',
};

const mockFarmDetails = {
    name: 'Sunny Meadows Farm',
    size: '50 acres',
    mainCrops: 'Corn, Soybeans, Wheat',
    location: 'Countryside, Farmville',
}

export default function ProfilePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    },
    mode: 'onChange',
  });

  async function onProfileSubmit(data: ProfileFormValues) {
    setIsLoading(true);
    console.log(data);
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated.',
    });
    setIsLoading(false);
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    setIsPasswordLoading(true);
    console.log(data);
     // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: 'Password Changed',
      description: 'Your password has been successfully updated.',
    });
    passwordForm.reset();
    setIsPasswordLoading(false);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
       <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          My Profile
        </h1>
        <p className="text-muted-foreground">
            View and manage your account and farm details.
        </p>
      </div>

       <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
                <Card>
                    <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                            <CardDescription>Update your personal details here.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src="https://picsum.photos/seed/avatar/200/200" alt="Farmer" />
                                        <AvatarFallback>F</AvatarFallback>
                                    </Avatar>
                                    <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full h-7 w-7">
                                        <Camera className="h-4 w-4" />
                                        <span className="sr-only">Change Photo</span>
                                    </Button>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">{profileForm.getValues('name')}</h2>
                                    <p className="text-sm text-muted-foreground">{profileForm.getValues('email')}</p>
                                </div>
                            </div>
                            <FormField
                                control={profileForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={profileForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="your.email@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </CardFooter>
                    </form>
                    </Form>
                </Card>

                 <Card>
                    <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Security
                            </CardTitle>
                            <CardDescription>Change your password.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <FormField
                                control={passwordForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                             <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isPasswordLoading}>
                                {isPasswordLoading ? 'Updating...' : 'Change Password'}
                            </Button>
                        </CardFooter>
                    </form>
                    </Form>
                </Card>
          </div>

           <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Registered Farm</CardTitle>
                        <CardDescription>Details of your registered farm.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Farm Name:</span>
                            <span className="font-medium">{mockFarmDetails.name}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Farm Size:</span>
                            <span className="font-medium">{mockFarmDetails.size}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Main Crops:</span>
                            <span className="font-medium">{mockFarmDetails.mainCrops}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Location:</span>
                            <span className="font-medium">{mockFarmDetails.location}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/dashboard/farm-registration">
                               <Edit className="w-4 h-4 mr-2" />
                                Edit Farm Details
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
           </div>
       </div>
    </div>
  );
}
