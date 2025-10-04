
'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { collection, addDoc, serverTimestamp, query, orderBy, Timestamp, doc, deleteDoc, runTransaction, getDocs, updateDoc } from 'firebase/firestore';
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

type Like = {
    id: string;
    userId: string;
};

type Comment = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    commentText: string;
    createdAt: Timestamp;
};

type EnrichedPost = Post & {
    userHasLiked: boolean;
    likeCount: number;
    commentCount: number;
    comments: Comment[];
};


function PostCard({ post, onLike, onComment }: { post: EnrichedPost; onLike: (postId: string, hasLiked: boolean) => void; onComment: (postId: string, commentText: string) => Promise<void> }) {
    const { user } = useUser();
    const [showComments, setShowComments] = useState(false);
    const [newCommentText, setNewCommentText] = useState('');
    const [isPostingComment, setIsPostingComment] = useState(false);

    const handlePostComment = async () => {
        if (!newCommentText.trim()) return;

        setIsPostingComment(true);
        await onComment(post.id, newCommentText);
        setNewCommentText('');
        setIsPostingComment(false);
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
            <CardContent className="p-6">
                <p className="text-sm">{post.question}</p>
            </CardContent>
            <CardFooter className="flex-col items-start p-6">
                 <div className="flex justify-between items-center w-full mb-4">
                    <div className="flex gap-2 text-sm text-muted-foreground">
                        <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => onLike(post.id, post.userHasLiked)} disabled={!user}>
                            <ThumbsUp size={16} className={cn(post.userHasLiked && "text-primary fill-primary")} /> {post.likeCount}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => setShowComments(!showComments)}>
                            <MessageSquare size={16} /> {post.commentCount}
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">View Post</Button>
                         {user?.uid !== post.authorId && (
                            <Button size="sm" asChild>
                                <Link href={`/dashboard/chat?with=${encodeURIComponent(post.authorName)}`}>
                                    <MessageSquare className="mr-2 h-4 w-4"/> Chat with Author
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
                
                 {showComments && (
                    <div className="w-full mt-4 border-t pt-4">
                        <h3 className="text-md font-semibold mb-3">Comments</h3>
                        <div className="space-y-3 mb-4">
                           {post.comments && post.comments.length > 0 ? (
                                post.comments.map(comment => (
                                    <div key={comment.id} className="flex items-start gap-3 text-sm">
                                        <Avatar className="h-7 w-7">
                                            <AvatarImage src={comment.authorAvatar} />
                                            <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p>
                                                <span className="font-semibold">{comment.authorName}</span>{" "}
                                                <span className="text-muted-foreground text-xs">
                                                    {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                                </span>
                                            </p>
                                            <p>{comment.commentText}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
                            )}
                        </div>
                        {user && (
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Write a comment..."
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    disabled={isPostingComment}
                                />
                                <Button onClick={handlePostComment} disabled={isPostingComment || !newCommentText.trim()}>
                                    {isPostingComment ? 'Posting...' : 'Comment'}
                                </Button>
                            </div>
                        )}
                    </div>
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

    const postsQuery = useMemoFirebase(() => {
        if (!db) return null;
        return query(collection(db, 'forumPosts'), orderBy('createdAt', 'desc'));
    }, [db]);
    
    const { data: posts, isLoading: isLoadingPosts, error: postsError } = useCollection<Post>(postsQuery);
    
    const [likesData, setLikesData] = useState<Record<string, Like[]>>({});
    const [commentsData, setCommentsData] = useState<Record<string, Comment[]>>({});
    const [isLoadingSubcollections, setIsLoadingSubcollections] = useState(true);

    useEffect(() => {
        if (posts && db) {
            const fetchSubcollections = async () => {
                setIsLoadingSubcollections(true);
                const newLikesData: Record<string, Like[]> = {};
                const newCommentsData: Record<string, Comment[]> = {};

                for (const post of posts) {
                    try {
                        const likesRef = collection(db, 'forumPosts', post.id, 'likes');
                        const commentsRef = query(collection(db, 'forumPosts', post.id, 'comments'), orderBy('createdAt', 'asc'));

                        const [likesSnapshot, commentsSnapshot] = await Promise.all([
                            getDocs(likesRef),
                            getDocs(commentsRef)
                        ]);
                        
                        newLikesData[post.id] = likesSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Like));
                        newCommentsData[post.id] = commentsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
                    } catch (e) {
                         console.error(`Failed to fetch subcollections for post ${post.id}`, e);
                         newLikesData[post.id] = [];
                         newCommentsData[post.id] = [];
                    }
                }
                setLikesData(newLikesData);
                setCommentsData(newCommentsData);
                setIsLoadingSubcollections(false);
            };
            fetchSubcollections();
        } else if (!posts && !isLoadingPosts) {
            setIsLoadingSubcollections(false);
        }
    }, [posts, db, isLoadingPosts]);
    

    const enrichedPosts = useMemo(() => {
        if (!posts) return [];
        return posts.map(post => {
            const likesForPost = likesData[post.id] || [];
            const commentsForPost = commentsData[post.id] || [];
            return {
                ...post,
                likeCount: likesForPost.length,
                userHasLiked: user ? likesForPost.some(like => like.id === user.uid) : false,
                commentCount: commentsForPost.length,
                comments: commentsForPost,
            };
        });
    }, [posts, likesData, commentsData, user]);

    const isLoading = isLoadingPosts || isLoadingSubcollections;

    const handleLike = (postId: string, hasLiked: boolean) => {
        if (!user || !db) return;

        setLikesData(prev => {
            const currentLikes = prev[postId] || [];
            const newLikes = hasLiked 
                ? currentLikes.filter(like => like.id !== user.uid)
                : [...currentLikes, { id: user.uid, userId: user.uid }];
            return { ...prev, [postId]: newLikes };
        });

        const postRef = doc(db, 'forumPosts', postId);
        const likeRef = doc(db, 'forumPosts', postId, 'likes', user.uid);

        runTransaction(db, async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists()) throw "Post does not exist!";
            
            if (hasLiked) {
                transaction.delete(likeRef);
            } else {
                transaction.set(likeRef, { userId: user.uid });
            }
            
            // Recalculate likes on the server to avoid race conditions
            const likesCollectionRef = collection(db, 'forumPosts', postId, 'likes');
            const likesSnapshot = await getDocs(query(likesCollectionRef));
            const newLikesCount = hasLiked ? likesSnapshot.size - 1 : likesSnapshot.size + 1;
            transaction.update(postRef, { likes: newLikesCount });

        }).catch((serverError) => {
             setLikesData(prev => {
                const currentLikes = prev[postId] || [];
                 const newLikes = hasLiked
                    ? [...currentLikes, { id: user.uid, userId: user.uid }]
                    : currentLikes.filter(like => like.id !== user.uid);
                return { ...prev, [postId]: newLikes };
            });
            const permissionError = new FirestorePermissionError({
                path: likeRef.path,
                operation: hasLiked ? 'delete' : 'create',
                requestResourceData: hasLiked ? undefined : { userId: user.uid },
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    };
    
    const handleComment = async (postId: string, commentText: string) => {
        if (!user || !db) return;
    
        const postRef = doc(db, 'forumPosts', postId);
        const commentsCollectionRef = collection(db, 'forumPosts', postId, 'comments');
        
        const newCommentData = {
            authorId: user.uid,
            authorName: user.displayName || 'Anonymous',
            authorAvatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
            commentText: commentText,
            createdAt: Timestamp.now(),
        };

        try {
            // Optimistically update UI
            const tempId = `temp_${Date.now()}`;
            const newCommentForUI = { ...newCommentData, id: tempId };
            setCommentsData(prev => ({
                ...prev,
                [postId]: [...(prev[postId] || []), newCommentForUI]
            }));

            // Step 1: Add the new comment document
            const newDocRef = await addDoc(commentsCollectionRef, newCommentData);
            
            // Update UI with real ID
            setCommentsData(prev => ({
                ...prev,
                [postId]: (prev[postId] || []).map(c => c.id === tempId ? { ...c, id: newDocRef.id } : c)
            }));

            // Step 2: Update the comment count on the parent post
            const commentsSnapshot = await getDocs(query(commentsCollectionRef));
            await updateDoc(postRef, { comments: commentsSnapshot.size });

            toast({ title: "Comment posted!" });

        } catch (serverError) {
             // Revert optimistic update if something fails
            setCommentsData(prev => ({
                ...prev,
                [postId]: (prev[postId] || []).filter(c => c.commentText !== commentText || c.authorId !== user.uid)
            }));
            const permissionError = new FirestorePermissionError({
                path: commentsCollectionRef.path,
                operation: 'create',
                requestResourceData: newCommentData,
            });
            errorEmitter.emit('permission-error', permissionError);
        }
    };


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
                toast({
                    title: 'Post Created',
                    description: 'Your question has been added to the forum.'
                });
            })
            .catch((serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: postsCollection.path,
                    operation: 'create',
                    requestResourceData: postData,
                });
                errorEmitter.emit('permission-error', permissionError);
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
                        {!isLoading && postsError && (
                            <Card>
                                <CardContent className="p-6">
                                    <p className="text-destructive text-center">Error: Could not load posts. Please check your connection or permissions.</p>
                                </CardContent>
                            </Card>
                        )}
                        {!isLoading && enrichedPosts.map(post => (
                            <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} />
                        ))}
                         {!isLoading && enrichedPosts.length === 0 && (
                             <Card>
                                <CardContent className="p-6">
                                     <p className="text-muted-foreground text-center">No posts yet. Be the first to ask a question!</p>
                                </CardContent>
                            </Card>
                         )}
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
