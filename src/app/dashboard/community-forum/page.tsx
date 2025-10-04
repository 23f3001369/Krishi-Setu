'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, PlusCircle, Search } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { collection, addDoc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

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

type EnrichedPost = Post & {
    userHasLiked: boolean;
};


function PostCard({ post }: { post: EnrichedPost }) {
    const { user } = useUser();

    const handleLikePost = () => {
        // TODO: Implement like functionality
        console.log("Liking post", post.id);
    };

    const handleComment = () => {
        // TODO: Implement comment functionality
        console.log("Commenting on post", post.id);
    };

    return (
        <Card>
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
            <CardContent>
                <p className="text-sm">{post.question}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
                <div className="flex gap-2 text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={handleLikePost} disabled={!user}>
                        <ThumbsUp size={16} className={cn(post.userHasLiked && "text-primary fill-primary")} /> {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={handleComment}>
                        <MessageSquare size={16} /> {post.comments} Comment{post.comments === 1 ? '' : 's'}
                    </Button>
                </div>
                {user && user?.uid !== post.authorId && (
                    <Button size="sm" asChild>
                        <Link href={`/dashboard/chat?with=${post.authorId}`}>
                            <MessageSquare className="mr-2 h-4 w-4"/> Chat with Author
                        </Link>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

export default function CommunityForumPage() {
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();

    const [newPost, setNewPost] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const postsQuery = useMemoFirebase(() => db ? query(collection(db, 'forumPosts'), orderBy('createdAt', 'desc')) : null, [db]);
    const { data: posts, isLoading: isLoadingPosts } = useCollection<Post>(postsQuery);

    const filteredPosts = useMemo(() => {
        if (!posts) return [];
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        if (!lowercasedSearchTerm.trim()) return posts;
        return posts.filter(post => 
            post.question.toLowerCase().includes(lowercasedSearchTerm) ||
            post.authorName.toLowerCase().includes(lowercasedSearchTerm)
        );
    }, [posts, searchTerm]);

    const enrichedPosts = useMemo((): EnrichedPost[] => {
        if (!filteredPosts) return [];
        // In a real app, you'd fetch the user's likes to determine `userHasLiked`
        return filteredPosts.map(post => ({
            ...post,
            userHasLiked: false, 
        }));
    }, [filteredPosts]);

    const isLoading = isLoadingPosts;

    const handleCreatePost = async () => {
        if (!user || !db || !newPost.trim()) return;

        setIsSubmitting(true);
        const postData = {
            authorId: user.uid,
            authorName: user.displayName || 'Anonymous',
            authorAvatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
            question: newPost,
            likes: 0,
            comments: 0,
            createdAt: serverTimestamp()
        };
        const postsCollection = collection(db, 'forumPosts');

        addDoc(postsCollection, postData)
            .then(() => {
                setNewPost('');
                toast({ title: 'Post Created', description: 'Your question has been added to the forum.' });
            })
            .catch((serverError) => {
                const error = serverError as Error;
                const permissionError = new FirestorePermissionError({ path: postsCollection.path, operation: 'create', requestResourceData: postData });
                errorEmitter.emit('permission-error', permissionError);
                toast({ title: 'Error Creating Post', description: error.message || 'An unknown error occurred.', variant: 'destructive' });
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };


    return (
        <div className="space-y-8">
             <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Community Forum</h1>
                <p className="text-muted-foreground">Ask questions, share knowledge, and connect with fellow farmers.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
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
                                    {isSubmitting ? 'Posting...' : ( <><PlusCircle className="mr-2 h-4 w-4"/>Create Post</> )}
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>

                    <div className="space-y-6">
                        {isLoading && ( <> <Skeleton className="h-48 w-full" /> <Skeleton className="h-48 w-full" /> </> )}
                        {!isLoading && enrichedPosts.length > 0 && enrichedPosts.map(post => <PostCard key={post.id} post={post} /> )}
                         {!isLoading && enrichedPosts.length === 0 && (
                             <Card><CardContent className="p-6"><p className="text-muted-foreground text-center">
                                {searchTerm ? 'No posts match your search.' : 'No posts yet. Be the first to ask a question!'}
                            </p></CardContent></Card>
                         )}
                    </div>
                </div>

                <div className="md:w-1/4 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Search Forum</CardTitle></CardHeader>
                        <CardContent className="p-6">
                            <div className="relative">
                               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                               <Input 
                                    placeholder="Search posts..." 
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
