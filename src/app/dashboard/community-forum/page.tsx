
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, PlusCircle, Search } from "lucide-react";
import { Separator } from '@/components/ui/separator';

const initialPosts = [
  {
    id: 1,
    author: 'Rajesh Kumar',
    avatar: 'https://i.pravatar.cc/150?u=rajesh',
    time: '2 hours ago',
    question: 'What is the best way to deal with whiteflies on my tomato plants? They are causing a lot of damage.',
    likes: 12,
    comments: 3,
  },
  {
    id: 2,
    author: 'Sunita Sharma',
    avatar: 'https://i-pravatar.cc/150?u=sunita',
    time: '1 day ago',
    question: 'Has anyone tried the new wheat variety HD-3226? I am thinking of planting it next season.',
    likes: 25,
    comments: 8,
  },
];

export default function CommunityForumPage() {
    const [posts, setPosts] = useState(initialPosts);

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Community Forum</h1>
                <p className="text-muted-foreground">Ask questions, share knowledge, and connect with fellow farmers.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Main Content */}
                <div className="md:w-3/4 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src="https://picsum.photos/seed/avatar/100/100" alt="Farmer" />
                                    <AvatarFallback>F</AvatarFallback>
                                </Avatar>
                                <Input placeholder="Ask a question or share an update..." className="flex-1" />
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4"/>
                                    Create Post
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>

                    <div className="space-y-6">
                        {posts.map(post => (
                            <Card key={post.id}>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={post.avatar} />
                                            <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{post.author}</p>
                                            <p className="text-xs text-muted-foreground">{post.time}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">{post.question}</p>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center">
                                    <div className="flex gap-2 text-sm text-muted-foreground">
                                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                            <ThumbsUp size={16} /> {post.likes}
                                        </Button>
                                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                            <MessageSquare size={16} /> {post.comments}
                                        </Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">View Post</Button>
                                        <Button size="sm" asChild>
                                            <Link href={`/dashboard/chat?with=${encodeURIComponent(post.author)}`}>
                                                <MessageSquare className="mr-2 h-4 w-4"/> Chat with Author
                                            </Link>
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="md:w-1/4 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Search Forum</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                               <Input placeholder="Search posts..." className="pl-8"/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Contributors</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {/* Mock Data */}
                           <div className="flex items-center gap-3">
                               <Avatar className="h-9 w-9">
                                 <AvatarImage src="https://i.pravatar.cc/150?u=contributor1" />
                                 <AvatarFallback>V</AvatarFallback>
                               </Avatar>
                               <div>
                                    <p className="text-sm font-semibold">Vikram Singh</p>
                                    <p className="text-xs text-muted-foreground">215 points</p>
                               </div>
                           </div>
                            <Separator />
                            <div className="flex items-center gap-3">
                               <Avatar className="h-9 w-9">
                                 <AvatarImage src="https://i.pravatar.cc/150?u=contributor2" />
                                 <AvatarFallback>A</AvatarFallback>
                               </Avatar>
                               <div>
                                    <p className="text-sm font-semibold">Anjali Patel</p>
                                    <p className="text-xs text-muted-foreground">180 points</p>
                               </div>
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
