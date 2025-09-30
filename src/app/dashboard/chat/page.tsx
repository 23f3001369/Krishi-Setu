
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Search, ArrowLeft, MessageSquare } from "lucide-react";
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

// Mock Data
const conversations = [
  {
    name: 'Rakesh Kumar',
    avatar: 'https://i.pravatar.cc/150?u=rakesh',
    lastMessage: 'Sure, it will be available from 3 PM tomorrow.',
    time: '2:45 PM',
    unread: 1,
    messages: [
      { id: 1, text: 'Hi, is the tractor available tomorrow?', sender: 'me', time: '2:40 PM' },
      { id: 2, text: 'Yes, it is. What time do you need it?', sender: 'Rakesh Kumar', time: '2:42 PM' },
      { id: 3, text: 'Around 2 PM for about 3 hours.', sender: 'me', time: '2:43 PM' },
      { id: 4, text: 'Sure, it will be available from 3 PM tomorrow.', sender: 'Rakesh Kumar', time: '2:45 PM' },
    ],
  },
  {
    name: 'Sunita Sharma',
    avatar: 'https://i.pravatar.cc/150?u=sunita',
    lastMessage: 'Thanks for the advice!',
    time: 'Yesterday',
    unread: 0,
    messages: [
         { id: 1, text: 'I saw your post about the new wheat variety. How was your experience?', sender: 'me', time: '10:00 AM' },
         { id: 2, text: 'It was great! The yield was about 15% higher than my previous crop.', sender: 'Sunita Sharma', time: '10:05 AM' },
         { id: 3, text: 'That sounds amazing. I will definitely try it this season.', sender: 'me', time: '10:07 AM' },
         { id: 4, text: 'Thanks for the advice!', sender: 'Sunita Sharma', time: '10:10 AM' },
    ],
  },
];

function ChatPageContent() {
    const searchParams = useSearchParams();
    const initialUser = searchParams.get('with');
    const [selectedUser, setSelectedUser] = useState<typeof conversations[0] | null>(null);
    
    useEffect(() => {
        if (initialUser) {
            const user = conversations.find(c => c.name === initialUser);
            if(user) setSelectedUser(user);
        } else if(conversations.length > 0) {
            setSelectedUser(conversations[0]);
        }
    }, [initialUser]);

  return (
        <div className="grid grid-cols-1 md:grid-cols-3 h-full gap-4">
            <Card className={cn(
                "md:flex flex-col",
                selectedUser && "hidden"
            )}>
                <CardHeader>
                    <CardTitle>Conversations</CardTitle>
                    <div className="relative mt-2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search users..." className="pl-8" />
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-2">
                   <div className="space-y-1">
                        {conversations.map(conv => (
                            <button
                                key={conv.name}
                                className={cn(
                                    "w-full text-left p-2 rounded-lg flex items-center gap-3 transition-colors",
                                    selectedUser?.name === conv.name ? "bg-muted" : "hover:bg-muted/50"
                                )}
                                onClick={() => setSelectedUser(conv)}
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={conv.avatar} alt={conv.name} />
                                    <AvatarFallback>{conv.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 truncate">
                                    <p className="font-semibold">{conv.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                                </div>
                                <div className="text-xs text-muted-foreground text-right">
                                    <p>{conv.time}</p>
                                    {conv.unread > 0 && <div className="w-4 h-4 mt-1 ml-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">{conv.unread}</div>}
                                </div>
                            </button>
                        ))}
                   </div>
                </CardContent>
            </Card>

            <Card className={cn(
                "md:col-span-2 flex-col",
                !selectedUser && "hidden",
                selectedUser && "flex"
            )}>
                {selectedUser ? (
                    <>
                        <CardHeader className="flex flex-row items-center gap-4 border-b p-4">
                             <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedUser(null)}>
                                <ArrowLeft />
                            </Button>
                            <Avatar>
                                <AvatarImage src={selectedUser.avatar} />
                                <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <CardTitle>{selectedUser.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                           {selectedUser.messages.map(msg => (
                               <div key={msg.id} className={cn(
                                   "flex items-end gap-2",
                                   msg.sender === 'me' ? 'justify-end' : ''
                               )}>
                                   {msg.sender !== 'me' && 
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={selectedUser.avatar} />
                                    </Avatar>
                                   }
                                   <div className={cn(
                                       "rounded-lg p-3 max-w-xs lg:max-w-md",
                                       msg.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                   )}>
                                       <p className="text-sm">{msg.text}</p>
                                       <p className={cn("text-xs mt-1",  msg.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground/70')}>{msg.time}</p>
                                   </div>
                                    {msg.sender === 'me' && 
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="https://picsum.photos/seed/avatar/100/100" />
                                    </Avatar>
                                   }
                               </div>
                           ))}
                        </CardContent>
                        <CardFooter className="border-t p-4">
                            <div className="flex w-full items-center gap-2">
                                <Input placeholder="Type a message..." />
                                <Button>
                                    <Send className="h-4 w-4" />
                                    <span className="sr-only">Send</span>
                                </Button>
                            </div>
                        </CardFooter>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="h-16 w-16" />
                        <p className="mt-4">Select a conversation to start chatting</p>
                    </div>
                )}
            </Card>
        </div>
  );
}

export default function ChatPage() {
    return (
        <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] w-full">
             <h1 className="text-3xl font-bold tracking-tight font-headline sr-only">Chat</h1>
             <Suspense fallback={<ChatSkeleton />}>
                <ChatPageContent />
             </Suspense>
        </div>
    );
}

function ChatSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 h-full gap-4">
            <Card className="hidden md:flex flex-col">
                <CardHeader>
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-10 w-full mt-2" />
                </CardHeader>
                <CardContent className="flex-1 space-y-2 p-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card className="md:col-span-2 flex flex-col">
                 <CardHeader className="flex flex-row items-center gap-4 border-b p-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="flex-1 p-4" />
                <CardFooter className="border-t p-4">
                     <div className="flex w-full items-center gap-2">
                        <Skeleton className="h-10 flex-grow" />
                        <Skeleton className="h-10 w-20" />
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
