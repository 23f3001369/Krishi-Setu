

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Settings, Users } from "lucide-react";


export default function AdminDashboardPage() {
  
  return (
    <>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div>
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome to the AgriAssist admin panel. Manage users, content, and system settings from here.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">User Management</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <p className="text-sm text-muted-foreground">View, manage, and moderate farmer accounts.</p>
                  <Button variant="outline" className="mt-4 w-full" asChild>
                    <Link href="/admin/users">Manage Users</Link>
                  </Button>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Content Management</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <p className="text-sm text-muted-foreground">Manage articles and videos in the Learning Hub.</p>
                  <Button variant="outline" className="mt-4 w-full" asChild>
                    <Link href="/admin/content">Manage Content</Link>
                  </Button>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Settings</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <p className="text-sm text-muted-foreground">Configure application-wide settings.</p>
                  <Button variant="outline" className="mt-4 w-full" asChild>
                    <Link href="/admin/settings">System Settings</Link>
                  </Button>
              </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
