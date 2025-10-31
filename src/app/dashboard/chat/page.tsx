
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
    return (
        <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] w-full flex items-center justify-center">
             <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Chat Feature</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                        <MessageSquare className="h-16 w-16" />
                        <p className="mt-4">
                            The chat functionality has been removed.
                        </p>
                    </div>
                </CardContent>
             </Card>
        </div>
    );
}
