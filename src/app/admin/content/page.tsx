
'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, BookOpen, Video } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Mock data - in a real app, this would come from a database
const initialArticles = [
  {
    id: '1',
    title: 'The Ultimate Guide to Drip Irrigation Systems',
    description:
      'Learn how to set up, maintain, and optimize a drip irrigation system to conserve water and maximize crop yield.',
    imageId: 'learning-hub-article-2',
  },
  {
    id: '2',
    title: 'Understanding Soil pH and Its Importance',
    description:
      'A deep dive into what soil pH means, how to test it, and how to adjust it for optimal plant health.',
    imageId: 'learning-hub-article-1',
  },
  {
    id: '3',
    title: 'Natural Pest Control Methods for Your Farm',
    description:
      'Explore effective and eco-friendly ways to manage common farm pests without resorting to harsh chemicals.',
    imageId: 'learning-hub-article-3',
  },
];

const initialVideos = [
  {
    id: '1',
    title: 'How to Properly Plant Seeds for Maximum Germination',
    description:
      'This step-by-step video guide shows you the best techniques for planting seeds to ensure a high germination rate.',
    imageId: 'learning-hub-video-1',
  },
  {
    id: '2',
    title: 'Techniques for a Successful and Efficient Harvest',
    description:
      'Watch expert farmers demonstrate their techniques for harvesting various crops quickly and without damage.',
    imageId: 'learning-hub-video-2',
  },
];

type ContentItem = {
    id: string;
    title: string;
    description: string;
    imageId?: string;
};

export default function ContentManagementPage() {
    const [articles, setArticles] = useState(initialArticles);
    const [videos, setVideos] = useState(initialVideos);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<ContentItem> | null>(null);
    const [contentType, setContentType] = useState<'article' | 'video' | null>(null);

    const handleAdd = (type: 'article' | 'video') => {
        setContentType(type);
        setEditingItem({});
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!editingItem || !contentType) return;
        
        const newItem = {
            id: editingItem.id || Date.now().toString(),
            title: editingItem.title || '',
            description: editingItem.description || '',
            imageId: editingItem.imageId || 'learning-hub-article-1'
        };

        if (contentType === 'article') {
            setArticles(prev => [...prev, newItem]);
        } else {
            setVideos(prev => [...prev, newItem]);
        }
        
        setIsDialogOpen(false);
        setEditingItem(null);
        setContentType(null);
    };
    
    return (
      <>
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Content Management</h1>
                <p className="text-muted-foreground">Manage the articles and videos available in the Learning Hub.</p>
            </div>

            <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <CardTitle>Articles</CardTitle>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleAdd('article')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Article
                </Button>
                </div>
                <CardDescription>Total: {articles.length} articles.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {articles.map((article) => (
                    <TableRow key={article.id}>
                        <TableCell className="font-medium">{article.title}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{article.description}</TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    <CardTitle>Videos</CardTitle>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleAdd('video')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Video
                </Button>
                </div>
                <CardDescription>Total: {videos.length} videos.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {videos.map((video) => (
                    <TableRow key={video.id}>
                        <TableCell className="font-medium">{video.title}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{video.description}</TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
            </Card>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New {contentType === 'article' ? 'Article' : 'Video'}</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new {contentType}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={editingItem?.title || ''}
                            onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={editingItem?.description || ''}
                            onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </>
    );
}
