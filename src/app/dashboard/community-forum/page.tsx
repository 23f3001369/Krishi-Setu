'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


// Main Data Types (Adjusted to use denormalized counts)
type Post = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    question: string;
    likes: number; // Denormalized count
    comments: number; // Denormalized count
    createdAt: Timestamp;
};

type Comment = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    commentText: string;
    likes: number; // Denormalized count
    replies: number; // Denormalized count
    createdAt: Timestamp;
};

type Reply = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    replyText: string;
    likes: number; // Denormalized count
    createdAt: Timestamp;
}

type Like = {
    id: string; // The UID of the user who liked - Only used for subcollection query
    userId: string;
};


// Enriched Types for UI (now derive from the denormalized counts)
type EnrichedReply = Reply & { userHasLiked: boolean; };
type EnrichedComment = Comment & { userHasLiked: boolean; replies: EnrichedReply[]; };
type EnrichedPost = Post & { userHasLiked: boolean; comments: EnrichedComment[]; };


// #region Sub-components (ReplyCard, CommentCard)

function ReplyCard({ reply, postId, commentId, postAuthorId }: { reply: EnrichedReply, postId: string, commentId: string, postAuthorId: string }) { // Added postAuthorId prop
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

    // Fetch likes for this specific reply
    const replyLikesQuery = useMemoFirebase(() => {
        if (!db) return null;
        return collection(db, 'forumPosts', postId, 'comments', commentId, 'replies', reply.id, 'likes');
    }, [db, postId, commentId, reply.id]);
    const { data: currentReplyLikes } = useCollection<Like>(replyLikesQuery); // Use useCollection for real-time like status
    const userHasLikedReply = useMemo(() => currentReplyLikes?.some(like => like.id === user?.uid) ?? false, [currentReplyLikes, user]);


    const handleLikeReply = async () => { // Made async for awaits in transaction
        if (!user || !db) {
            toast({ title: 'Sign in required', description: 'You must be signed in to like replies.', variant: 'destructive' });
            return;
        }

        const replyRef = doc(db, 'forumPosts', postId, 'comments', commentId, 'replies', reply.id);
        const likeRef = doc(replyRef, 'likes', user.uid); // Document ID for the like is the user's UID

        try {
            await runTransaction(db, async (transaction) => {
                const replyDoc = await transaction.get(replyRef);
                if (!replyDoc.exists()) throw new Error("Reply does not exist!");

                const currentLikesCount = replyDoc.data().likes || 0;
                const likeDocSnapshot = await transaction.get(likeRef); // Get specific like doc

                if (likeDocSnapshot.exists()) {
                    // Unlike: Delete the like document and decrement the count
                    transaction.delete(likeRef);
                    transaction.update(replyRef, { likes: Math.max(0, currentLikesCount - 1) });
                } else {
                    // Like: Create the like document and increment the count
                    transaction.set(likeRef, { userId: user.uid });
                    transaction.update(replyRef, { likes: currentLikesCount + 1 });
                }
            });
        } catch (serverError) {
            const error = serverError as Error;
            const permissionError = new FirestorePermissionError({
                path: likeRef.path,
                operation: userHasLikedReply ? 'delete' : 'create',
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
                title: 'Error Liking Reply',
                description: error.message || 'An unknown error occurred.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteReply = async () => {
        // --- Conditional check for deletion ---
        if (!user || !db || user.uid !== reply.authorId) { // Post owner cannot delete replies directly
            toast({ title: 'Permission Denied', description: 'You can only delete your own replies.', variant: 'destructive' });
            setDeleteAlertOpen(false);
            return;
        }
        setIsDeleting(true);
        const replyRef = doc(db, 'forumPosts', postId, 'comments', commentId, 'replies', reply.id);
        const commentRef = doc(db, 'forumPosts', postId, 'comments', commentId);

        try {
            await runTransaction(db, async (transaction) => {
                const commentDoc = await transaction.get(commentRef);
                if (!commentDoc.exists()) throw new Error("Parent comment does not exist!");

                transaction.delete(replyRef);
                transaction.update(commentRef, { replies: Math.max(0, (commentDoc.data().replies || 0) - 1) });
            });
            toast({ title: "Reply Deleted", description: "Your reply has been removed." });
            // TODO: Implement Cloud Function to recursively delete subcollections (likes) of this reply
        } catch (serverError) {
            const error = serverError as Error;
            const permissionError = new FirestorePermissionError({ path: replyRef.path, operation: 'delete' });
            errorEmitter.emit('permission-error', permissionError);
            toast({ title: "Error Deleting Reply", description: error.message || "An unknown error occurred.", variant: 'destructive' });
        } finally {
            setIsDeleting(false);
            setDeleteAlertOpen(false);
        }
    };

    const canDeleteReply = user?.uid === reply.authorId; // Only author can delete reply

    return (
        <div className="flex items-start gap-3 text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Avatar className="h-6 w-6">
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
                <p className="mt-1">{reply.replyText}</p>
                <div className="flex items-center gap-2 mt-1">
                    <Button variant="ghost" size="sm" className="h-6 px-1 flex items-center gap-1 text-xs" onClick={handleLikeReply} disabled={!user}>
                        <ThumbsUp size={14} className={cn(userHasLikedReply && "text-primary fill-primary")} /> {reply.likes}
                    </Button>
                    {canDeleteReply && ( // Show delete button if user can delete
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

function CommentCard({ comment, postId, postAuthorId }: { comment: EnrichedComment, postId: string, postAuthorId: string }) { // Added postAuthorId prop
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();

    const [showReplies, setShowReplies] = useState(false);
    const [newReplyText, setNewReplyText] = useState('');
    const [isPostingReply, setIsPostingReply] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

    // Fetch likes for this specific comment
    const commentLikesQuery = useMemoFirebase(() => {
        if (!db) return null;
        return collection(db, 'forumPosts', postId, 'comments', comment.id, 'likes');
    }, [db, postId, comment.id]);
    const { data: currentCommentLikes } = useCollection<Like>(commentLikesQuery); // Use useCollection for real-time like status
    const userHasLikedComment = useMemo(() => currentCommentLikes?.some(like => like.id === user?.uid) ?? false, [currentCommentLikes, user]);

    // Fetch replies for this specific comment
    const repliesQuery = useMemoFirebase(() => {
        if (!db) return null;
        return query(collection(db, 'forumPosts', postId, 'comments', comment.id, 'replies'), orderBy('createdAt', 'asc'));
    }, [db, postId, comment.id]);
    const { data: replies, isLoading: isLoadingReplies } = useCollection<Reply>(repliesQuery);

    // Enriched replies for UI
    const enrichedReplies = useMemo(() => {
        if (!replies) return [];
        // Pass postAuthorId to ReplyCard as well
        return replies.map(reply => ({ ...reply, userHasLiked: false }));
    }, [replies]);


    const handleLikeComment = async () => { // Made async for awaits in transaction
        if (!user || !db) {
            toast({ title: 'Sign in required', description: 'You must be signed in to like comments.', variant: 'destructive' });
            return;
        }

        const commentRef = doc(db, 'forumPosts', postId, 'comments', comment.id);
        const likeRef = doc(commentRef, 'likes', user.uid);

        try {
            await runTransaction(db, async (transaction) => {
                const commentDoc = await transaction.get(commentRef);
                if (!commentDoc.exists()) throw new Error("Comment does not exist!");

                const currentLikesCount = commentDoc.data().likes || 0;
                const likeDocSnapshot = await transaction.get(likeRef); // Get specific like doc

                if (likeDocSnapshot.exists()) {
                    // Unlike: Delete the like document and decrement the count
                    transaction.delete(likeRef);
                    transaction.update(commentRef, { likes: Math.max(0, currentLikesCount - 1) });
                } else {
                    // Like: Create the like document and increment the count
                    transaction.set(likeRef, { userId: user.uid });
                    transaction.update(commentRef, { likes: currentLikesCount + 1 });
                }
            });
        } catch (serverError) {
            const error = serverError as Error;
            const permissionError = new FirestorePermissionError({
                path: likeRef.path,
                operation: userHasLikedComment ? 'delete' : 'create',
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
                title: 'Error Liking Comment',
                description: error.message || 'An unknown error occurred.',
                variant: 'destructive',
            });
        }
    };

    const handlePostReply = async () => {
        if (!user || !db || !newReplyText.trim()) {
            toast({ title: 'Error', description: 'Reply cannot be empty.', variant: 'destructive' });
            return;
        }

        setIsPostingReply(true);
        const commentRef = doc(db, 'forumPosts', postId, 'comments', comment.id);
        const repliesCollectionRef = collection(commentRef, 'replies');

        try {
            const newReplyData = {
                    authorId: user.uid,
                    authorName: user.displayName || 'Anonymous',
                    authorAvatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
                    replyText: newReplyText,
                    likes: 0, // Initialize likes for replies
                    createdAt: serverTimestamp(),
                };
            
            await runTransaction(db, async (transaction) => {
                const commentDoc = await transaction.get(commentRef);
                if (!commentDoc.exists()) throw new Error("Parent comment does not exist!");

                const currentRepliesCount = commentDoc.data().replies || 0;

                
                const newReplyDocRef = doc(repliesCollectionRef); // Let Firestore generate ID
                transaction.set(newReplyDocRef, newReplyData);

                // Increment the replies count on the parent comment
                transaction.update(commentRef, { replies: currentRepliesCount + 1 });
            });

            setNewReplyText('');
            toast({ title: "Reply Posted", description: "Your reply has been added." });
        } catch (serverError) {
            const error = serverError as Error;
            const permissionError = new FirestorePermissionError({
                path: repliesCollectionRef.path,
                operation: 'create',
                requestResourceData: { authorId: user.uid, replyText: newReplyText },
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
                title: 'Error Posting Reply',
                description: error.message || 'An unknown error occurred.',
                variant: 'destructive',
            });
        } finally {
            setIsPostingReply(false);
        }
    };

    const handleDeleteComment = async () => {
        // --- Conditional check for deletion ---
        if (!user || !db || (user.uid !== comment.authorId && user.uid !== postAuthorId)) { // Allow comment author OR post author to delete
            toast({ title: 'Permission Denied', description: 'You can only delete your own comments or comments on your posts.', variant: 'destructive' });
            setDeleteAlertOpen(false);
            return;
        }
        setIsDeleting(true);
        const commentRef = doc(db, 'forumPosts', postId, 'comments', comment.id);
        const postRef = doc(db, 'forumPosts', postId);

        try {
            await runTransaction(db, async (transaction) => {
                const postDoc = await transaction.get(postRef);
                if (!postDoc.exists()) throw new Error("Parent post does not exist!");

                transaction.delete(commentRef);
                transaction.update(postRef, { comments: Math.max(0, (postDoc.data().comments || 0) - 1) });
            });
            toast({ title: "Comment Deleted", description: "Your comment has been removed." });
            // TODO: Implement Cloud Function to recursively delete subcollections (likes, replies) of this comment
        } catch (serverError) {
            const error = serverError as Error;
            const permissionError = new FirestorePermissionError({ path: commentRef.path, operation: 'delete' });
            errorEmitter.emit('permission-error', permissionError);
            toast({ title: "Error Deleting Comment", description: error.message || "An unknown error occurred.", variant: 'destructive' });
        } finally {
            setIsDeleting(false);
            setDeleteAlertOpen(false);
        }
    };

    const canDeleteComment = user?.uid === comment.authorId || user?.uid === postAuthorId; // Comment author OR Post author

    return (
        <div className="flex items-start gap-3 text-sm p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
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
                <p className="mt-1">{comment.commentText}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <Button variant="ghost" size="sm" className="h-6 px-2 flex items-center gap-1" onClick={handleLikeComment} disabled={!user}>
                        <ThumbsUp size={14} className={cn(userHasLikedComment && "text-primary fill-primary")} /> {comment.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 flex items-center gap-1" onClick={() => setShowReplies(!showReplies)}>
                        <CornerDownRight size={14} /> {comment.replies} Repl{comment.replies === 1 ? 'y' : 'ies'}
                    </Button>
                     {canDeleteComment && ( // Show delete button if user can delete
                         <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 px-2 flex items-center gap-1 text-xs text-destructive" disabled={isDeleting}>
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
                    <div className="mt-4 pl-4 border-l">
                        <div className="space-y-2 mb-3">
                            {isLoadingReplies ? (
                                <Skeleton className="h-8 w-full" />
                            ) : enrichedReplies.length > 0 ? (
                                enrichedReplies.map(reply => (
                                    // Pass postAuthorId to ReplyCard
                                    <ReplyCard key={reply.id} reply={reply} postId={postId} commentId={comment.id} postAuthorId={postAuthorId} />
                                ))
                            ) : (
                                <p className="text-xs text-muted-foreground">No replies yet.</p>
                            )}
                        </div>
                        {user && (
                            <div className="flex gap-2 mt-3">
                                <Input
                                    placeholder="Write a reply..."
                                    value={newReplyText}
                                    onChange={(e) => setNewReplyText(e.target.value)}
                                    disabled={isPostingReply}
                                    className="h-8 text-sm"
                                />
                                <Button onClick={handlePostReply} disabled={isPostingReply || !newReplyText.trim()} className="h-8 text-sm">
                                    {isPostingReply ? 'Replying...' : 'Reply'}
                                </Button>
                            </div>
                        )}
                        {!user && (
                            <p className="text-xs text-muted-foreground mt-3">Sign in to reply.</p>
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

    // Fetch likes for this specific post
    const postLikesQuery = useMemoFirebase(() => {
        if (!db) return null;
        return collection(db, 'forumPosts', post.id, 'likes');
    }, [db, post.id]);
    const { data: currentPostLikes } = useCollection<Like>(postLikesQuery); // Use useCollection for real-time like status
    const userHasLikedPost = useMemo(() => currentPostLikes?.some(like => like.id === user?.uid) ?? false, [currentPostLikes, user]);

    // Fetch comments for this specific post
    const commentsQuery = useMemoFirebase(() => {
        if (!db) return null;
        return query(collection(db, 'forumPosts', post.id, 'comments'), orderBy('createdAt', 'asc'));
    }, [db, post.id]);
    const { data: comments, isLoading: isLoadingComments } = useCollection<Comment>(commentsQuery);

    // Enriched comments for UI
    const enrichedComments = useMemo(() => {
        if (!comments) return [];
        return comments.map(comment => ({ ...comment, userHasLiked: false, replies: [] })); // userHasLiked and replies are handled in CommentCard now
    }, [comments]);


    const handleLikePost = async () => { // Made async for awaits in transaction
        if (!user || !db) {
            toast({ title: 'Sign in required', description: 'You must be signed in to like posts.', variant: 'destructive' });
            return;
        }

        const postRef = doc(db, 'forumPosts', post.id);
        const likeRef = doc(postRef, 'likes', user.uid); // Document ID for the like is the user's UID

        try {
            await runTransaction(db, async (transaction) => {
                const postDoc = await transaction.get(postRef);
                if (!postDoc.exists()) throw new Error("Post does not exist!");

                const currentLikesCount = postDoc.data().likes || 0;
                const likeDocSnapshot = await transaction.get(likeRef); // Get specific like doc

                if (likeDocSnapshot.exists()) {
                    // Unlike: Delete the like document and decrement the count
                    transaction.delete(likeRef);
                    transaction.update(postRef, { likes: Math.max(0, currentLikesCount - 1) });
                } else {
                    // Like: Create the like document and increment the count
                    transaction.set(likeRef, { userId: user.uid });
                    transaction.update(postRef, { likes: currentLikesCount + 1 });
                }
            });
        } catch (serverError) {
            const error = serverError as Error;
            const permissionError = new FirestorePermissionError({
                path: likeRef.path,
                operation: userHasLikedPost ? 'delete' : 'create',
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
                title: 'Error Liking Post',
                description: error.message || 'An unknown error occurred.',
                variant: 'destructive',
            });
        }
    };

    const handlePostComment = async () => {
        if (!user || !db || !newCommentText.trim()) {
            toast({ title: 'Error', description: 'Comment cannot be empty.', variant: 'destructive' });
            return;
        }

        setIsPostingComment(true);
        const postRef = doc(db, 'forumPosts', post.id);
        const commentsCollectionRef = collection(postRef, 'comments');
        const newCommentData = {
            authorId: user.uid,
            authorName: user.displayName || 'Anonymous',
            authorAvatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
            commentText: newCommentText,
            likes: 0, // Initialize likes for comments
            replies: 0, // Initialize replies for comments
            createdAt: serverTimestamp(),
        };

        try {
            await runTransaction(db, async (transaction) => {
                const postDoc = await transaction.get(postRef);
                if (!postDoc.exists()) throw new Error("Post does not exist!");

                const currentCommentsCount = postDoc.data().comments || 0;

                const newCommentDocRef = doc(commentsCollectionRef); // Let Firestore generate ID
                transaction.set(newCommentDocRef, newCommentData);

                // Increment the comment count on the parent post
                transaction.update(postRef, { comments: currentCommentsCount + 1 });
            });

            setNewCommentText('');
            toast({ title: "Comment Posted", description: "Your comment has been added." });
        } catch (serverError) {
            const error = serverError as Error;
            const permissionError = new FirestorePermissionError({
                path: commentsCollectionRef.path,
                operation: 'create',
                requestResourceData: { authorId: user.uid, commentText: newCommentText },
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
                title: 'Error Posting Comment',
                description: error.message || 'An unknown error occurred.',
                variant: 'destructive',
            });
        } finally {
            setIsPostingComment(false);
        }
    };

    const handleDeletePost = async () => {
        if (!user || !db || user.uid !== post.authorId) {
            toast({ title: 'Permission Denied', description: 'You can only delete your own posts.', variant: 'destructive' });
            setDeleteAlertOpen(false);
            return;
        }
        setIsDeleting(true);
        const postRef = doc(db, 'forumPosts', post.id);

        try {
            await deleteDoc(postRef);
            toast({ title: "Post Deleted", description: "The post has been removed." });
            // TODO: Implement Cloud Function to recursively delete subcollections (likes, comments, replies, comment-likes, reply-likes) of this post
        } catch (serverError) {
            const error = serverError as Error;
            const permissionError = new FirestorePermissionError({ path: postRef.path, operation: 'delete'});
            errorEmitter.emit('permission-error', permissionError);
            toast({ title: "Error Deleting Post", description: error.message || "An unknown error occurred.", variant: 'destructive' });
        } finally {
            setIsDeleting(false);
            setDeleteAlertOpen(false);
        }
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
                                <AlertDialogHeader><AlertDialogTitle>Delete Post?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. All comments and replies will also be deleted. (Requires Cloud Function)</AlertDialogDescription></AlertDialogHeader>
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
                            <ThumbsUp size={16} className={cn(userHasLikedPost && "text-primary fill-primary")} /> {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => setShowComments(!showComments)}>
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
                </div>

                 {showComments && (
                    <div className="w-full mt-4 border-t pt-4 space-y-4">
                        <h3 className="text-md font-semibold">Comments</h3>
                        <div className="space-y-4">
                           {isLoadingComments ? (
                               <>
                                   <Skeleton className="h-16 w-full" />
                                   <Skeleton className="h-16 w-full" />
                               </>
                           ) : enrichedComments.length > 0 ? (
                               enrichedComments.map(comment => (
                                   // Pass postAuthorId to CommentCard
                                   <CommentCard key={comment.id} comment={comment} postId={post.id} postAuthorId={post.authorId} />
                               ))
                           ) : (
                               <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
                           )}
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
                        {!user && (
                            <p className="text-sm text-muted-foreground pt-2">Sign in to leave a comment.</p>
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
    const { data: posts, isLoading: isLoadingPosts } = useCollection<Post>(postsQuery); // This now fetches Post with denormalized counts

    const enrichedPosts = useMemo((): EnrichedPost[] => {
        if (!posts) return [];
        return posts.map(post => ({
            ...post,
            userHasLiked: false, // This will be determined by useCollection inside PostCard
            comments: [] // This will be determined by useCollection inside PostCard
        }));
    }, [posts]);

    const isLoading = isLoadingPosts; // Only depend on main posts loading

    // --- End Data Fetching ---

    const handleCreatePost = async () => {
        if (!user || !db || !newPost.trim()) return;

        setIsSubmitting(true);
        const postData = {
            authorId: user.uid,
            authorName: user.displayName || 'Anonymous',
            authorAvatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
            question: newPost,
            likes: 0, // Initialize denormalized counts
            comments: 0, // Initialize denormalized counts
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
                        {!isLoading && enrichedPosts.length > 0 && enrichedPosts.map(post => <PostCard key={post.id} post={post} /> )}
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
                </div>
            </div>
        </div>
    )
}
