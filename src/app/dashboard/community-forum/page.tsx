
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
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

type Post = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    question: string;
    likes: number;
    comments: number;
    createdAt: Timestamp;
};

export default function CommunityForumPage() {
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();
    
    const [newPost, setNewPost] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const postsQuery = useMemoFirebase(() => {
        if (!db) return null;
        return query(collection(db, 'forumPosts'), orderBy('createdAt', 'desc'));
    }, [db]);
    
    const { data: posts, isLoading } = useCollection<Post>(postsQuery);

    const handleCreatePost = async () => {
        if (!user || !db || !newPost.trim()) return;

        setIsSubmitting(true);
        try {
            const postsCollection = collection(db, 'forumPosts');
            await addDoc(postsCollection, {
                authorId: user.uid,
                authorName: user.displayName || 'Anonymous',
                authorAvatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
                question: newPost,
                likes: 0,
                comments: 0,
                createdAt: serverTimestamp()
            });
            setNewPost('');
            toast({
                title: 'Post Created',
                description: 'Your question has been added to the forum.'
            });
        } catch (error) {
            console.error("Error creating post:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not create post. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="space-y-8">
             <div className="mb-8">
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
                                    <AvatarImage src={user?.photoURL || "https://picsum.photos/seed/avatar/100/100"} alt={user?.displayName || "Farmer"} />
                                    <AvatarFallback>{user?.displayName?.charAt(0) || 'F'}</AvatarFallback>
                                </Avatar>
                                <Input 
                                    placeholder="Ask a question or share an update..." 
                                    className="flex-1" 
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                    disabled={isSubmitting || !user}
                                />
                                <Button onClick={handleCreatePost} disabled={isSubmitting || !newPost.trim() || !user}>
                                    {isSubmitting ? 'Posting...' : (
                                        <>
                                            <PlusCircle className="mr-2 h-4 w-4"/>
                                            Create Post
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>

                    <div className="space-y-6">
                        {isLoading && (
                            <>
                                <Skeleton className="h-48 w-full" />
                                <Skeleton className="h-48 w-full" />
                            </>
                        )}
                        {posts && posts.map(post => (
                            <Card key={post.id}>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={post.authorAvatar} />
                                            <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{post.authorName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <p className="text-sm">{post.question}</p>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center p-6">
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
                                            <Link href={`/dashboard/chat?with=${encodeURIComponent(post.authorName)}`}>
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
                        <CardContent className="p-6">
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
                        <CardContent className="space-y-4 p-6">
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

    