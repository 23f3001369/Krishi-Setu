'use client';

import React, { useState, useEffect, Suspense, useMemo, useRef } from 'react';
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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Timestamp, addDoc, doc, serverTimestamp, updateDoc, getDocs, writeBatch, getDoc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// Data types from Firestore
type Chat = {
    id: string;
    participants: string[]; // array of user UIDs
    participantDetails: {
        [uid: string]: {
            name: string;
            avatar: string;
        }
    };
    lastMessage: string;
    lastMessageTimestamp: Timestamp;
    lastMessageSenderId: string;
};

type Message = {
    id: string;
    senderId: string;
    text: string;
    timestamp: Timestamp;
}

// Function to create a chat if it doesn't exist, or return existing chat ID
const getOrCreateChat = async (db: any, currentUserUid: string, otherUserUid: string) => {
    // Create a consistent chat ID
    const chatId = [currentUserUid, otherUserUid].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
        const currentUserDoc = await getDoc(doc(db, 'farmers', currentUserUid));
        const otherUserDoc = await getDoc(doc(db, 'farmers', otherUserUid));

        if (!currentUserDoc.exists() || !otherUserDoc.exists()) {
            throw new Error("One or both users do not have a profile in the 'farmers' collection.");
        }
        
        const currentUserData = currentUserDoc.data();
        const otherUserData = otherUserDoc.data();

        const newChatData = {
            participants: [currentUserUid, otherUserUid],
            participantDetails: {
                [currentUserUid]: {
                    name: currentUserData.name || 'Anonymous',
                    avatar: `https://i.pravatar.cc/150?u=${currentUserUid}`
                },
                [otherUserUid]: {
                    name: otherUserData.name || 'Anonymous',
                    avatar: `https://i.pravatar.cc/150?u=${otherUserUid}`
                }
            },
            lastMessage: '',
            lastMessageTimestamp: serverTimestamp(),
            lastMessageSenderId: ''
        };
        await setDoc(chatRef, newChatData);
    }
    return chatId;
}


function ChatPageContent() {
    const searchParams = useSearchParams();
    const db = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    
    // State
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Get chat partner's UID from URL if present
    const chatWithUid = searchParams.get('with');

    // Fetch conversations for the current user
    const chatsQuery = useMemoFirebase(() => {
        if (!db || !user?.uid) return null;
        return query(collection(db, 'chats'), where('participants', 'array-contains', user.uid), orderBy('lastMessageTimestamp', 'desc'));
    }, [db, user?.uid]);
    const { data: conversations, isLoading: isLoadingConversations } = useCollection<Chat>(chatsQuery);

    // Fetch messages for the selected conversation
    const messagesQuery = useMemoFirebase(() => {
        if (!db || !selectedChat) return null;
        return query(collection(db, 'chats', selectedChat.id, 'messages'), orderBy('timestamp', 'asc'));
    }, [db, selectedChat]);
    const { data: messages, isLoading: isLoadingMessages } = useCollection<Message>(messagesQuery);
    
    // Effect to handle creating/selecting a chat from URL param
    useEffect(() => {
        if (chatWithUid && db && user?.uid && user.uid !== chatWithUid) {
            const findAndSetChat = async () => {
                try {
                    const chatId = await getOrCreateChat(db, user.uid, chatWithUid);
                    const chatDoc = await getDoc(doc(db, 'chats', chatId));
                    if(chatDoc.exists()) {
                       setSelectedChat({ id: chatDoc.id, ...chatDoc.data() } as Chat);
                    }
                } catch (error) {
                    console.error("Error creating or fetching chat:", error);
                    toast({ title: 'Error', description: 'Could not start chat. User profile may not exist.', variant: 'destructive' });
                }
            };
            findAndSetChat();
        } else if (!chatWithUid && conversations && conversations.length > 0 && !selectedChat) {
             setSelectedChat(conversations[0]);
        }
    }, [chatWithUid, db, user, conversations, toast, selectedChat]);

    // Effect to scroll to the bottom of the messages list
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedChat || !user || !db) return;
        setIsSending(true);

        const chatRef = doc(db, 'chats', selectedChat.id);
        const messagesColRef = collection(chatRef, 'messages');

        const messageData = {
            senderId: user.uid,
            text: newMessage,
            timestamp: serverTimestamp()
        };

        const lastMessageData = {
            lastMessage: newMessage,
            lastMessageTimestamp: serverTimestamp(),
            lastMessageSenderId: user.uid
        };

        try {
            const batch = writeBatch(db);
            batch.set(doc(messagesColRef), messageData); // Add new message
            batch.update(chatRef, lastMessageData); // Update last message on chat
            await batch.commit();

            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            toast({ title: 'Error', description: 'Could not send message.', variant: 'destructive' });
        } finally {
            setIsSending(false);
        }
    };

    const getOtherParticipant = (chat: Chat) => {
        const otherId = chat.participants.find(p => p !== user?.uid);
        return otherId ? chat.participantDetails[otherId] : { name: 'Unknown', avatar: '' };
    }

  return (
        <div className="grid grid-cols-1 md:grid-cols-3 h-full gap-4">
            <Card className={cn(
                "md:flex flex-col",
                selectedChat && "hidden"
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
                        {isLoadingConversations && <ChatListSkeleton />}
                        {!isLoadingConversations && conversations?.map(conv => {
                            const otherUser = getOtherParticipant(conv);
                            return (
                            <button
                                key={conv.id}
                                className={cn(
                                    "w-full text-left p-2 rounded-lg flex items-center gap-3 transition-colors",
                                    selectedChat?.id === conv.id ? "bg-muted" : "hover:bg-muted/50"
                                )}
                                onClick={() => setSelectedChat(conv)}
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                                    <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 truncate">
                                    <p className="font-semibold">{otherUser.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                                </div>
                                <div className="text-xs text-muted-foreground text-right">
                                    {conv.lastMessageTimestamp && <p>{formatDistanceToNow(conv.lastMessageTimestamp.toDate(), { addSuffix: true })}</p>}
                                </div>
                            </button>
                        )})}
                   </div>
                </CardContent>
            </Card>

            <Card className={cn(
                "md:col-span-2 flex-col",
                !selectedChat && "hidden",
                selectedChat && "flex"
            )}>
                {selectedChat && user ? (
                    <>
                        <CardHeader className="flex flex-row items-center gap-4 border-b p-4">
                             <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedChat(null)}>
                                <ArrowLeft />
                            </Button>
                            <Avatar>
                                <AvatarImage src={getOtherParticipant(selectedChat).avatar} />
                                <AvatarFallback>{getOtherParticipant(selectedChat).name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <CardTitle>{getOtherParticipant(selectedChat).name}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                           {isLoadingMessages && [...Array(5)].map((_, i) => <MessageSkeleton key={i} self={i % 2 === 0}/>)}
                           {!isLoadingMessages && messages?.map(msg => {
                                const isMe = msg.senderId === user.uid;
                                const senderDetails = isMe ? { name: 'Me', avatar: '' } : selectedChat.participantDetails[msg.senderId];
                               return (
                               <div key={msg.id} className={cn(
                                   "flex items-end gap-2",
                                   isMe ? 'justify-end' : ''
                               )}>
                                   {!isMe && 
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={senderDetails.avatar} />
                                    </Avatar>
                                   }
                                   <div className={cn(
                                       "rounded-lg p-3 max-w-xs lg:max-w-md",
                                       isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                   )}>
                                       <p className="text-sm">{msg.text}</p>
                                       {msg.timestamp && <p className={cn("text-xs mt-1",  isMe ? 'text-primary-foreground/70' : 'text-muted-foreground/70')}>{formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true })}</p>}
                                   </div>
                                    {isMe && 
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`} />
                                    </Avatar>
                                   }
                               </div>
                           )})}
                           <div ref={messagesEndRef} />
                        </CardContent>
                        <CardFooter className="border-t p-4">
                            <div className="flex w-full items-center gap-2">
                                <Input 
                                    placeholder="Type a message..." 
                                    value={newMessage} 
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                    disabled={isSending}
                                />
                                <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                                    {isSending ? 'Sending...' : <Send className="h-4 w-4" />}
                                    <span className="sr-only">Send</span>
                                </Button>
                            </div>
                        </CardFooter>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="h-16 w-16" />
                        <p className="mt-4 text-center">Select a conversation or start a new one from the community forum.</p>
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
             <Suspense fallback={<ChatPageSkeleton />}>
                <ChatPageContent />
             </Suspense>
        </div>
    );
}

function ChatListSkeleton() {
    return (
        <div className="space-y-1">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
            ))}
        </div>
    )
}

function MessageSkeleton({ self }: { self: boolean }) {
    return (
        <div className={cn("flex items-end gap-2", self && 'justify-end')}>
            {!self && <Skeleton className="h-8 w-8 rounded-full" />}
            <Skeleton className={cn("h-16 rounded-lg", self ? 'w-48' : 'w-40')} />
            {self && <Skeleton className="h-8 w-8 rounded-full" />}
        </div>
    )
}

function ChatPageSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 h-full gap-4">
            <Card className="hidden md:flex flex-col">
                <CardHeader>
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-10 w-full mt-2" />
                </CardHeader>
                <CardContent className="flex-1 p-2">
                    <ChatListSkeleton />
                </CardContent>
            </Card>
            <Card className="md:col-span-2 flex flex-col">
                 <CardHeader className="flex flex-row items-center gap-4 border-b p-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="flex-1 p-4 space-y-4">
                    <MessageSkeleton self={false} />
                    <MessageSkeleton self={true} />
                    <MessageSkeleton self={false} />
                </CardContent>
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
