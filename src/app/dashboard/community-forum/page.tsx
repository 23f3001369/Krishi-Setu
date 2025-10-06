
'use client';

import React, { useState, useMemo, Suspense } from 'react';
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
import { MessageSquare, ThumbsUp, PlusCircle, Search, Send, X } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { collection, addDoc, serverTimestamp, query, orderBy, Timestamp, doc, deleteDoc, runTransaction, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- TYPE DEFINITIONS ---

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

type Comment = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    commentText: string;
    likes: number;
    replies: number;
    createdAt: Timestamp;
};

type Reply = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    replyText: string;
    likes: number;
    createdAt: Timestamp;
};

// --- LIKE BUTTON COMPONENT ---

function LikeButton({ path, likeCount }: { path: string, likeCount: number }) {
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();

    const likeRef = useMemoFirebase(() => {
        if (!db || !user?.uid) return null;
        return doc(db, path, 'likes', user.uid);
    }, [db, path, user?.uid]);

    const { data: likeDoc, isLoading: isLikeLoading } = useDoc(likeRef);
    const userHasLiked = !!likeDoc;

    const handleLike = async () => {
        if (!user || !db) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to like.' });
            return;
        }

        const parentDocRef = doc(db, path);
        const likeDocRef = doc(db, path, 'likes', user.uid);

        try {
            await runTransaction(db, async (transaction) => {
                const parentSnapshot = await transaction.get(parentDocRef);
                if (!parentSnapshot.exists()) throw "Parent document does not exist!";

                const currentLikes = parentSnapshot.data().likes || 0;
                
                if (userHasLiked) {
                    transaction.delete(likeDocRef);
                    transaction.update(parentDocRef, { likes: Math.max(0, currentLikes - 1) });
                } else {
                    transaction.set(likeDocRef, { userId: user.uid, createdAt: serverTimestamp() });
                    transaction.update(parentDocRef, { likes: currentLikes + 1 });
                }
            });
        } catch (serverError) {
            const error = serverError as Error;
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: likeDocRef.path,
                operation: userHasLiked ? 'delete' : 'create',
            }));
            toast({ title: 'Error', description: error.message || 'Could not update like status.', variant: 'destructive' });
        }
    };

    return (
        <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs" onClick={handleLike} disabled={!user || isLikeLoading}>
            <ThumbsUp size={14} className={cn(userHasLiked && "text-primary fill-primary")} /> {likeCount}
        </Button>
    );
}


// --- REPLIES COMPONENT ---

function RepliesSection({ postId, commentId }: { postId: string, commentId: string }) {
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();
    const [newReply, setNewReply] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const repliesQuery = useMemoFirebase(() => {
        if (!db) return null;
        return query(collection(db, 'forumPosts', postId, 'comments', commentId, 'replies'), orderBy('createdAt', 'asc'));
    }, [db, postId, commentId]);

    const { data: replies, isLoading } = useCollection<Reply>(repliesQuery);

    const handleAddReply = async () => {
        if (!user || !db || !newReply.trim()) return;
        setIsSubmitting(true);

        const replyData = {
            authorId: user.uid,
            authorName: user.displayName || 'Anonymous',
            authorAvatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
            replyText: newReply,
            likes: 0,
            createdAt: serverTimestamp()
        };
        const repliesColRef = collection(db, 'forumPosts', postId, 'comments', commentId, 'replies');
        const commentDocRef = doc(db, 'forumPosts', postId, 'comments', commentId);

        try {
            await addDoc(repliesColRef, replyData);
            await runTransaction(db, async transaction => {
                const commentSnap = await transaction.get(commentDocRef);
                if (!commentSnap.exists()) throw "Comment does not exist!";
                const newRepliesCount = (commentSnap.data().replies || 0) + 1;
                transaction.update(commentDocRef, { replies: newRepliesCount });
            });
            setNewReply('');
        } catch (error) {
            console.error("Error adding reply:", error);
            toast({ title: 'Error', description: 'Could not post reply.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="ml-8 pl-4 border-l space-y-3">
            {isLoading && <Skeleton className="h-10 w-full" />}
            {replies?.map(reply => (
                <div key={reply.id} className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6"><AvatarImage src={reply.authorAvatar} /><AvatarFallback>{reply.authorName.charAt(0)}</AvatarFallback></Avatar>
                        <div>
                            <span className="font-semibold">{reply.authorName}</span>
                            <span className="text-muted-foreground ml-2">{reply.createdAt ? formatDistanceToNow(reply.createdAt.toDate(), { addSuffix: true }) : '...'}</span>
                        </div>
                    </div>
                    <p className="text-muted-foreground pl-8">{reply.replyText}</p>
                     <div className="pl-8 flex items-center gap-2">
                        <LikeButton path={`forumPosts/${postId}/comments/${commentId}/replies/${reply.id}`} likeCount={reply.likes} />
                     </div>
                </div>
            ))}
             <div className="flex items-center gap-2 pt-2">
                <Avatar className="h-6 w-6"><AvatarImage src={user?.photoURL || ''} /><AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback></Avatar>
                <Input 
                    placeholder="Write a reply..." 
                    className="h-8 text-xs" 
                    value={newReply}
                    onChange={e => setNewReply(e.target.value)}
                    disabled={isSubmitting || !user}
                />
                <Button size="sm" className="h-8" onClick={handleAddReply} disabled={isSubmitting || !newReply.trim() || !user}>
                    <Send size={14}/>
                </Button>
            </div>
        </div>
    )
}

// --- COMMENTS SHEET ---

function CommentsSheet({ post, open, onOpenChange }: { post: Post | null, open: boolean, onOpenChange: (open: boolean) => void }) {
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});

    const commentsQuery = useMemoFirebase(() => {
        if (!db || !post) return null;
        return query(collection(db, 'forumPosts', post.id, 'comments'), orderBy('createdAt', 'desc'));
    }, [db, post]);
    const { data: comments, isLoading } = useCollection<Comment>(commentsQuery);

    const handleAddComment = async () => {
        if (!user || !db || !post || !newComment.trim()) return;
        setIsSubmitting(true);

        const commentData = {
            authorId: user.uid,
            authorName: user.displayName || 'Anonymous',
            authorAvatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
            commentText: newComment,
            likes: 0,
            replies: 0,
            createdAt: serverTimestamp()
        };

        const commentsColRef = collection(db, 'forumPosts', post.id, 'comments');
        const postDocRef = doc(db, 'forumPosts', post.id);

        try {
            await addDoc(commentsColRef, commentData);
            await runTransaction(db, async transaction => {
                const postSnap = await transaction.get(postDocRef);
                if (!postSnap.exists()) throw "Post does not exist!";
                const newCommentsCount = (postSnap.data().comments || 0) + 1;
                transaction.update(postDocRef, { comments: newCommentsCount });
            });
            setNewComment('');
        } catch (serverError) {
             const error = serverError as Error;
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: commentsColRef.path,
                operation: 'create',
                requestResourceData: commentData,
             }));
            toast({ title: 'Error', description: error.message || 'Could not post comment.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const toggleReplies = (commentId: string) => {
        setShowReplies(prev => ({...prev, [commentId]: !prev[commentId]}));
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
                {post && (
                    <>
                        <SheetHeader className="p-6">
                            <SheetTitle>Comments on "{post.question}"</SheetTitle>
                            <SheetDescription>Posted by {post.authorName}</SheetDescription>
                        </SheetHeader>
                        <Separator />
                        <ScrollArea className="flex-1">
                            <div className="p-6 space-y-6">
                                {isLoading && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full"/>)}
                                {comments?.map(comment => (
                                    <div key={comment.id}>
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={comment.authorAvatar} />
                                                <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="text-sm bg-muted p-3 rounded-lg">
                                                    <p className="font-semibold">{comment.authorName}</p>
                                                    <p>{comment.commentText}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                    <span>{comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : '...'}</span>
                                                    <LikeButton path={`forumPosts/${post.id}/comments/${comment.id}`} likeCount={comment.likes} />
                                                    <Button variant="link" className="p-0 h-auto text-xs" onClick={() => toggleReplies(comment.id)}>
                                                        {comment.replies || 0} Replies
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                         {showReplies[comment.id] && (
                                            <Suspense fallback={<Skeleton className="h-10 mt-2" />}>
                                                <RepliesSection postId={post.id} commentId={comment.id} />
                                            </Suspense>
                                        )}
                                    </div>
                                ))}
                                {!isLoading && comments?.length === 0 && (
                                    <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
                                )}
                            </div>
                        </ScrollArea>
                        <SheetFooter className="p-4 border-t bg-background">
                            <div className="flex w-full items-start gap-2">
                                <Avatar className="h-9 w-9 mt-1">
                                    <AvatarImage src={user?.photoURL || ''} /><AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                                <Textarea 
                                    placeholder="Write a comment..." 
                                    className="flex-1"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    disabled={!user || isSubmitting}
                                />
                                <Button onClick={handleAddComment} disabled={!user || isSubmitting || !newComment.trim()}>
                                    {isSubmitting ? '...' : <Send className="h-4 w-4" />}
                                </Button>
                            </div>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

// --- POST CARD COMPONENT ---

function PostCard({ post, onCommentClick }: { post: Post, onCommentClick: (post: Post) => void }) {
    const { user } = useUser();
    
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
                    <LikeButton path={`forumPosts/${post.id}`} likeCount={post.likes} />
                    <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => onCommentClick(post)}>
                        <MessageSquare size={16} /> {post.comments || 0} Comment{(!post.comments || post.comments !== 1) ? 's' : ''}
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


// --- MAIN PAGE COMPONENT ---

export default function CommunityForumPage() {
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();

    const [newPost, setNewPost] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

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
                errorEmitter.emit('permission-error', new FirestorePermissionError({ path: postsCollection.path, operation: 'create', requestResourceData: postData }));
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
                        {isLoadingPosts && ( <> <Skeleton className="h-48 w-full" /> <Skeleton className="h-48 w-full" /> </> )}
                        {!isLoadingPosts && filteredPosts.length > 0 && filteredPosts.map(post => 
                            <PostCard key={post.id} post={post} onCommentClick={() => setSelectedPost(post)} />
                        )}
                         {!isLoadingPosts && filteredPosts.length === 0 && (
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
            
            <CommentsSheet post={selectedPost} open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)} />
        </div>
    )
}
