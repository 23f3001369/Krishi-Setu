
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function SystemSettingsPage() {
    
    // Mock state for settings
    const [settings, setSettings] = React.useState({
        theme: 'system',
        emailNotifications: true,
        pushNotifications: false,
        aiModel: 'gemini-2.5-flash',
    });

    const { toast } = useToast();

    const handleSettingChange = (key: keyof typeof settings, value: any) => {
        setSettings(prev => ({...prev, [key]: value}))
    }

    const handleSave = () => {
        // Mock save action
        console.log("Saving settings:", settings);
        toast({
            title: 'Settings Saved',
            description: 'Your changes have been successfully saved.',
        });
    }

    return (
      <div className="space-y-8">
        <div className="mb-8">
            <h1 className="text-3xl font-bold font-headline">System Settings</h1>
            <p className="text-muted-foreground">Manage application-wide settings and configurations.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application for all users.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                        <Label htmlFor="theme">Theme</Label>
                        <p className="text-xs text-muted-foreground">
                            Select the default color theme for the application.
                        </p>
                    </div>
                    <Select value={settings.theme} onValueChange={(value) => handleSettingChange('theme', value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure how system-wide notifications are sent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-xs text-muted-foreground">
                            Send important system updates via email to users.
                        </p>
                    </div>
                    <Switch
                        id="email-notifications"
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <p className="text-xs text-muted-foreground">
                           Enable or disable push notifications for weather alerts.
                        </p>
                    </div>
                    <Switch
                        id="push-notifications"
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    />
                </div>
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>AI Configuration</CardTitle>
                <CardDescription>Manage the AI models used for various features.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
                 <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                        <Label htmlFor="ai-model">Default AI Model</Label>
                        <p className="text-xs text-muted-foreground">
                            Select the primary generative model for AI features.
                        </p>
                    </div>
                    <Select value={settings.aiModel} onValueChange={(value) => handleSettingChange('aiModel', value)}>
                        <SelectTrigger className="w-[240px]">
                            <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                            <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-y-4 p-6">
                <Separator />
                 <Button onClick={handleSave}>Save Changes</Button>
            </CardFooter>
        </Card>
      </div>
    );
}
