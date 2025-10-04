
'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import { MessageSquare, ThumbsUp, PlusCircle, Search, CornerDownRight, Trash2 } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { collection, addDoc, serverTimestamp, query, orderBy, Timestamp, doc, deleteDoc, runTransaction, updateDoc, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


// Main Data Types
type Post = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    question: string;
    createdAt: Timestamp;
};

type Comment = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    commentText: string;
    createdAt: Timestamp;
};

type Reply = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    replyText: string;
    createdAt: Timestamp;
}

type Like = {
    id: string; // The UID of the user who liked
};

// Enriched Types for UI
type EnrichedReply = Reply & { userHasLiked: boolean; likeCount: number; };
type EnrichedComment = Comment & { userHasLiked: boolean; likeCount: number; replies: EnrichedReply[]; replyCount: number; };
type EnrichedPost = Post & { userHasLiked: boolean; likeCount: number; comments: EnrichedComment[]; commentCount: number; };


// #region Sub-components (ReplyCard, CommentCard)

function ReplyCard({ reply, postId, commentId }: { reply: EnrichedReply, postId: string, commentId: string }) {
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

    const handleLikeReply = () => {
        if (!user || !db) return;

        const replyRef = doc(db, 'forumPosts', postId, 'comments', commentId, 'replies', reply.id);
        const likeRef = doc(replyRef, 'likes', user.uid);

        runTransaction(db, async (transaction) => {
            const replyDoc = await transaction.get(replyRef);
            if (!replyDoc.exists()) throw "Reply does not exist!";
            
            const likeDoc = await transaction.get(likeRef);
            if (likeDoc.exists()) {
                transaction.delete(likeRef);
                transaction.update(replyRef, { likes: Math.max(0, (replyDoc.data().likes || 0) - 1) });
            } else {
                transaction.set(likeRef, { userId: user.uid });
                transaction.update(replyRef, { likes: (replyDoc.data().likes || 0) + 1 });
            }
        }).catch((err) => {
            const permissionError = new FirestorePermissionError({
                path: likeRef.path,
                operation: reply.userHasLiked ? 'delete' : 'create',
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    };
    
    const handleDeleteReply = async () => {
        if (!user || !db || user.uid !== reply.authorId) return;
        setIsDeleting(true);
        const replyRef = doc(db, 'forumPosts', postId, 'comments', commentId, 'replies', reply.id);
        deleteDoc(replyRef).then(() => {
            toast({ title: "Reply Deleted" });
        }).catch((err) => {
            const permissionError = new FirestorePermissionError({ path: replyRef.path, operation: 'delete' });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => {
            setIsDeleting(false);
            setDeleteAlertOpen(false);
        });
    };

    return (
        <div className="flex items-start gap-3 text-sm">
            <Avatar className="h-7 w-7">
                <AvatarImage src={reply.authorAvatar} />
                <AvatarFallback>{reply.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p>
                    <span className="font-semibold">{reply.authorName}</span>{" "}
                    <span className="text-muted-foreground text-xs">
                        {reply.createdAt ? formatDistanceToNow(reply.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                    </span>
                </p>
                <p>{reply.replyText}</p>
                <div className="flex items-center gap-2 mt-1">
                    <Button variant="ghost" size="sm" className="h-6 px-1 flex items-center gap-1 text-xs" onClick={handleLikeReply} disabled={!user}>
                        <ThumbsUp size={14} className={cn(reply.userHasLiked && "text-primary fill-primary")} /> {reply.likeCount}
                    </Button>
                    {user?.uid === reply.authorId && (
                         <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 px-1 flex items-center gap-1 text-xs text-destructive" disabled={isDeleting}>
                                    <Trash2 size={14} />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Delete Reply?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteReply}>Delete</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>
        </div>
    );
}

function CommentCard({ comment, postId }: { comment: EnrichedComment, postId: string }) {
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();
    
    const [showReplies, setShowReplies] = useState(false);
    const [newReplyText, setNewReplyText] = useState('');
    const [isPostingReply, setIsPostingReply] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

    const handleLikeComment = () => {
        if (!user || !db) return;
        
        const commentRef = doc(db, 'forumPosts', postId, 'comments', comment.id);
        const likeRef = doc(commentRef, 'likes', user.uid);
        
        runTransaction(db, async (transaction) => {
            const commentDoc = await transaction.get(commentRef);
            if (!commentDoc.exists()) throw "Comment does not exist!";
            
            const likeDoc = await transaction.get(likeRef);
            if (likeDoc.exists()) {
                transaction.delete(likeRef);
                transaction.update(commentRef, { likes: Math.max(0, (commentDoc.data().likes || 0) - 1) });
            } else {
                transaction.set(likeRef, { userId: user.uid });
                transaction.update(commentRef, { likes: (commentDoc.data().likes || 0) + 1 });
            }
        }).catch((err) => {
             const permissionError = new FirestorePermissionError({
                path: likeRef.path,
                operation: comment.userHasLiked ? 'delete' : 'create',
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    };

    const handlePostReply = async () => {
        if (!user || !db || !newReplyText.trim()) return;

        setIsPostingReply(true);
        const repliesCollectionRef = collection(db, 'forumPosts', postId, 'comments', comment.id, 'replies');
        const newReplyData = {
            authorId: user.uid,
            authorName: user.displayName || 'Anonymous',
            authorAvatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
            replyText: newReplyText,
            createdAt: serverTimestamp(),
            likes: 0
        };

        try {
            await addDoc(repliesCollectionRef, newReplyData);
            setNewReplyText('');
        } catch (err) {
            const permissionError = new FirestorePermissionError({ path: repliesCollectionRef.path, operation: 'create', requestResourceData: newReplyData });
            errorEmitter.emit('permission-error', permissionError);
        } finally {
            setIsPostingReply(false);
        }
    };
    
    const handleDeleteComment = async () => {
        if (!user || !db || user.uid !== comment.authorId) return;
        setIsDeleting(true);
        const commentRef = doc(db, 'forumPosts', postId, 'comments', comment.id);
        deleteDoc(commentRef).then(() => {
            toast({ title: "Comment Deleted" });
        }).catch((err) => {
            const permissionError = new FirestorePermissionError({ path: commentRef.path, operation: 'delete' });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => {
            setIsDeleting(false);
            setDeleteAlertOpen(false);
        });
    };

    return (
        <div className="flex items-start gap-3 text-sm">
            <Avatar className="h-8 w-8">
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
                <div className="flex items-center gap-2 mt-1">
                    <Button variant="ghost" size="sm" className="h-6 px-1 flex items-center gap-1 text-xs" onClick={handleLikeComment} disabled={!user}>
                        <ThumbsUp size={14} className={cn(comment.userHasLiked && "text-primary fill-primary")} /> {comment.likeCount}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-1 flex items-center gap-1 text-xs" onClick={() => setShowReplies(!showReplies)}>
                        <CornerDownRight size={14} /> {comment.replyCount} Replies
                    </Button>
                     {user?.uid === comment.authorId && (
                         <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 px-1 flex items-center gap-1 text-xs text-destructive" disabled={isDeleting}>
                                    <Trash2 size={14} />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Delete Comment?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteComment}>Delete</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
                {showReplies && (
                    <div className="mt-3 pl-6 border-l-2 space-y-4">
                        {comment.replies.map(reply => (
                            <ReplyCard key={reply.id} reply={reply} postId={postId} commentId={comment.id} />
                        ))}
                         {user && (
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Write a reply..."
                                    value={newReplyText}
                                    onChange={(e) => setNewReplyText(e.target.value)}
                                    className="h-8 text-xs"
                                    disabled={isPostingReply}
                                />
                                <Button size="sm" className="h-8" onClick={handlePostReply} disabled={isPostingReply || !newReplyText.trim()}>
                                    {isPostingReply ? 'Replying...' : 'Reply'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}


function PostCard({ post }: { post: EnrichedPost }) {
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();
    
    const [showComments, setShowComments] = useState(false);
    const [newCommentText, setNewCommentText] = useState('');
    const [isPostingComment, setIsPostingComment] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

    const handleLikePost = () => {
        if (!user || !db) return;

        const postRef = doc(db, 'forumPosts', post.id);
        const likeRef = doc(postRef, 'likes', user.uid);

        runTransaction(db, async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists()) throw "Post does not exist!";
            
            const likeDoc = await transaction.get(likeRef);
            if (likeDoc.exists()) {
                transaction.delete(likeRef);
                transaction.update(postRef, { likes: Math.max(0, (postDoc.data().likes || 0) - 1) });
            } else {
                transaction.set(likeRef, { userId: user.uid });
                transaction.update(postRef, { likes: (postDoc.data().likes || 0) + 1 });
            }
        }).catch((err) => {
             const permissionError = new FirestorePermissionError({
                path: likeRef.path,
                operation: post.userHasLiked ? 'delete' : 'create',
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    };

    const handlePostComment = async () => {
        if (!user || !db || !newCommentText.trim()) return;

        setIsPostingComment(true);
        const commentsCollectionRef = collection(db, 'forumPosts', post.id, 'comments');
        const newCommentData = {
            authorId: user.uid,
            authorName: user.displayName || 'Anonymous',
            authorAvatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
            commentText: newCommentText,
            createdAt: serverTimestamp(),
            likes: 0,
            replies: 0,
        };

        try {
            await addDoc(commentsCollectionRef, newCommentData);
            
            // Also increment comment count on post
            const postRef = doc(db, 'forumPosts', post.id);
            const commentsSnapshot = await getDocs(query(commentsCollectionRef));
            await updateDoc(postRef, { comments: commentsSnapshot.size });

            setNewCommentText('');
            toast({ title: "Comment Posted" });
        } catch (err) {
             const permissionError = new FirestorePermissionError({
                path: commentsCollectionRef.path,
                operation: 'create',
                requestResourceData: newCommentData
            });
            errorEmitter.emit('permission-error', permissionError);
        } finally {
            setIsPostingComment(false);
        }
    };
    
    const handleDeletePost = async () => {
        if (!user || !db || user.uid !== post.authorId) return;
        setIsDeleting(true);
        const postRef = doc(db, 'forumPosts', post.id);
        deleteDoc(postRef).then(() => {
            toast({ title: "Post Deleted" });
        }).catch((err) => {
            const permissionError = new FirestorePermissionError({ path: postRef.path, operation: 'delete' });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => {
            setIsDeleting(false);
            setDeleteAlertOpen(false);
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
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
                     {user?.uid === post.authorId && (
                         <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" disabled={isDeleting}>
                                    <Trash2 size={16} />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Delete Post?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. All comments and replies will also be deleted.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeletePost}>Delete</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <p className="text-sm">{post.question}</p>
            </CardContent>
            <CardFooter className="flex-col items-start p-6">
                 <div className="flex justify-between items-center w-full mb-4">
                    <div className="flex gap-2 text-sm text-muted-foreground">
                        <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={handleLikePost} disabled={!user}>
                            <ThumbsUp size={16} className={cn(post.userHasLiked && "text-primary fill-primary")} /> {post.likeCount}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => setShowComments(!showComments)}>
                            <MessageSquare size={16} /> {post.commentCount}
                        </Button>
                    </div>
                    {user && user?.uid !== post.authorId && (
                        <Button size="sm" asChild>
                            <Link href={`/dashboard/chat?with=${encodeURIComponent(post.authorName)}`}>
                                <MessageSquare className="mr-2 h-4 w-4"/> Chat with Author
                            </Link>
                        </Button>
                    )}
                </div>
                
                 {showComments && (
                    <div className="w-full mt-4 border-t pt-4 space-y-4">
                        <h3 className="text-md font-semibold">Comments</h3>
                        <div className="space-y-4">
                           {post.comments.map(comment => (
                               <CommentCard key={comment.id} comment={comment} postId={post.id} />
                           ))}
                           {post.comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
                        </div>
                        {user && (
                            <div className="flex gap-2 pt-2">
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

// #endregion

export default function CommunityForumPage() {
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();
    
    const [newPost, setNewPost] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Data Fetching ---
    const postsQuery = useMemoFirebase(() => db ? query(collection(db, 'forumPosts'), orderBy('createdAt', 'desc')) : null, [db]);
    const { data: posts, isLoading: isLoadingPosts } = useCollection<Post>(postsQuery);

    const [subcollectionData, setSubcollectionData] = useState<Record<string, any>>({});
    const [isLoadingSubcollections, setIsLoadingSubcollections] = useState(true);

    useEffect(() => {
        if (posts && db) {
            setIsLoadingSubcollections(true);
            const promises = posts.map(async (post) => {
                // Post-level
                const postLikesRef = collection(db, 'forumPosts', post.id, 'likes');
                const commentsRef = collection(db, 'forumPosts', post.id, 'comments');
                const commentsQuery = query(commentsRef, orderBy('createdAt', 'asc'));

                const [postLikesSnap, commentsSnap] = await Promise.all([getDocs(postLikesRef), getDocs(commentsQuery)]);

                const postLikes = postLikesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Like));
                const comments = commentsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
                
                // Comment-level
                const commentDetails = await Promise.all(comments.map(async (comment) => {
                    const commentLikesRef = collection(commentsRef, comment.id, 'likes');
                    const repliesRef = collection(commentsRef, comment.id, 'replies');
                    const repliesQuery = query(repliesRef, orderBy('createdAt', 'asc'));

                    const [commentLikesSnap, repliesSnap] = await Promise.all([getDocs(commentLikesRef), getDocs(repliesQuery)]);

                    const commentLikes = commentLikesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Like));
                    const replies = repliesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Reply));

                    // Reply-level
                    const replyDetails = await Promise.all(replies.map(async (reply) => {
                        const replyLikesRef = collection(repliesRef, reply.id, 'likes');
                        const replyLikesSnap = await getDocs(replyLikesRef);
                        const replyLikes = replyLikesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Like));
                        return { ...reply, likes: replyLikes };
                    }));

                    return { ...comment, likes: commentLikes, replies: replyDetails };
                }));

                return { postId: post.id, likes: postLikes, comments: commentDetails };
            });

            Promise.all(promises).then(results => {
                const dataMap = results.reduce((acc, current) => {
                    acc[current.postId] = { likes: current.likes, comments: current.comments };
                    return acc;
                }, {} as Record<string, any>);
                setSubcollectionData(dataMap);
                setIsLoadingSubcollections(false);
            });
        } else if (!posts && !isLoadingPosts) {
            setIsLoadingSubcollections(false);
        }
    }, [posts, db, isLoadingPosts]);

    const enrichedPosts = useMemo((): EnrichedPost[] => {
        if (!posts) return [];
        return posts.map(post => {
            const postData = subcollectionData[post.id] || { likes: [], comments: [] };
            
            const enrichedComments = (postData.comments || []).map((comment: any) => {
                 const enrichedReplies = (comment.replies || []).map((reply: any) => ({
                    ...reply,
                    likeCount: reply.likes?.length || 0,
                    userHasLiked: user ? reply.likes?.some((l: Like) => l.id === user.uid) : false,
                }));
                return {
                    ...comment,
                    likeCount: comment.likes?.length || 0,
                    userHasLiked: user ? comment.likes?.some((l: Like) => l.id === user.uid) : false,
                    replies: enrichedReplies,
                    replyCount: enrichedReplies.length,
                }
            });

            return {
                ...post,
                likeCount: postData.likes.length,
                userHasLiked: user ? postData.likes.some((l: Like) => l.id === user.uid) : false,
                comments: enrichedComments,
                commentCount: enrichedComments.length,
            };
        });
    }, [posts, subcollectionData, user]);

    const isLoading = isLoadingPosts || isLoadingSubcollections;
    // --- End Data Fetching ---

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
                const permissionError = new FirestorePermissionError({ path: postsCollection.path, operation: 'create', requestResourceData: postData });
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
                                    {isSubmitting ? 'Posting...' : ( <><PlusCircle className="mr-2 h-4 w-4"/>Create Post</> )}
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>

                    <div className="space-y-6">
                        {isLoading && ( <> <Skeleton className="h-48 w-full" /> <Skeleton className="h-48 w-full" /> </> )}
                        {!isLoading && enrichedPosts.map(post => <PostCard key={post.id} post={post} /> )}
                         {!isLoading && enrichedPosts.length === 0 && (
                             <Card><CardContent className="p-6"><p className="text-muted-foreground text-center">No posts yet. Be the first to ask a question!</p></CardContent></Card>
                         )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="md:w-1/4 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Search Forum</CardTitle></CardHeader>
                        <CardContent className="p-6">
                            <div className="relative">
                               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                               <Input placeholder="Search posts..." className="pl-8"/>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Top Contributors</CardTitle></CardHeader>
                        <CardContent className="space-y-4 p-6">
                           <div className="flex items-center gap-3">
                               <Avatar className="h-9 w-9"><AvatarImage src="https://i.pravatar.cc/150?u=contributor1" /><AvatarFallback>V</AvatarFallback></Avatar>
                               <div><p className="text-sm font-semibold">Vikram Singh</p><p className="text-xs text-muted-foreground">215 points</p></div>
                           </div>
                            <Separator />
                            <div className="flex items-center gap-3">
                               <Avatar className="h-9 w-9"><AvatarImage src="https://i.pravatar.cc/150?u=contributor2" /><AvatarFallback>A</AvatarFallback></Avatar>
                               <div><p className="text-sm font-semibold">Anjali Patel</p><p className="text-xs text-muted-foreground">180 points</p></div>
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
