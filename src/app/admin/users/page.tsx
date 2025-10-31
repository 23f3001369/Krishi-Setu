
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, BookOpen, Settings, Search, Users, Trash2, Eye, Ban, AlertTriangle, Wheat } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

// Mock data for users
const initialUsers = [
  {
    id: "usr_1",
    name: "Farmer",
    email: "farmer@agriassist.com",
    farmName: "Sunny Meadows Farm",
    status: "Active",
    joined: "2023-10-26",
    majorCrops: "Corn, Soybeans",
    profilePicUrl: "https://i.pravatar.cc/150?u=usr_1",
  },
  {
    id: "usr_2",
    name: "Jane Doe",
    email: "jane.d@example.com",
    farmName: "Green Acres",
    status: "Active",
    joined: "2023-09-15",
    majorCrops: "Wheat, Barley",
    profilePicUrl: "https://i.pravatar.cc/150?u=usr_2",
  },
  {
    id: "usr_3",
    name: "Peter Jones",
    email: "p.jones@example.com",
    farmName: "Harvest Moon Fields",
    status: "Pending",
    joined: "2023-11-01",
    majorCrops: "Potatoes, Carrots",
    profilePicUrl: "https://i.pravatar.cc/150?u=usr_3",
  },
   {
    id: "usr_4",
    name: "Maria Garcia",
    email: "maria.g@example.com",
    farmName: "El Sol Ranch",
    status: "Inactive",
    joined: "2023-05-20",
    majorCrops: "Tomatoes, Peppers",
    profilePicUrl: "https://i.pravatar.cc/150?u=usr_4",
  },
];

type User = typeof initialUsers[0];

export default function UserManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState(initialUsers);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.farmName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewDetails = (user: User) => {
        setSelectedUser(user);
        setIsDetailsOpen(true);
    };

    const handleSuspendUser = (userId: string) => {
        setUsers(users.map(user => 
            user.id === userId ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' } : user
        ));
    };

    const handleDeleteUser = () => {
        if (selectedUser) {
            setUsers(users.filter(user => user.id !== selectedUser.id));
        }
        setIsDeleteConfirmOpen(false);
        setSelectedUser(null);
    };
    
    const openDeleteConfirm = (user: User) => {
        setSelectedUser(user);
        setIsDeleteConfirmOpen(true);
    };


  return (
    <>
      <div className="space-y-8">
        <div className="mb-8">
            <h1 className="text-3xl font-bold font-headline">User Management</h1>
            <p className="text-muted-foreground">View and manage farmer accounts.</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Users
                </CardTitle>
                <CardDescription>
                  Total: {users.length} users.
                </CardDescription>
              </div>
              <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      type="search"
                      placeholder="Search users..."
                      className="pl-8 sm:w-[300px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Farm Name</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground md:hidden">
                          {user.email}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{user.farmName}</TableCell>
                    <TableCell className="hidden md:table-cell">{new Date(user.joined).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'Active' ? 'default' : user.status === 'Pending' ? 'secondary' : 'destructive'}>
                        {user.status}
                      </Badge>
                    </TableCell>
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
                          <DropdownMenuItem onSelect={() => handleViewDetails(user)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleSuspendUser(user.id)}>
                            <Ban className="mr-2 h-4 w-4" />
                            {user.status === 'Active' ? 'Suspend' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onSelect={() => openDeleteConfirm(user)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
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
      
      {/* User Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information for {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
             <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedUser.profilePicUrl} alt={selectedUser.name} />
                        <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    </div>
                </div>
                <Separator />
                <div className="text-sm space-y-3">
                  <h4 className="font-medium text-base">Farm Details</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="font-semibold text-muted-foreground">Farm Name:</div>
                      <div>{selectedUser.farmName}</div>
                      <div className="font-semibold text-muted-foreground flex items-center gap-1"><Wheat className="w-3 h-3"/> Major Crops:</div>
                      <div>{selectedUser.majorCrops}</div>
                  </div>
                </div>
                <Separator />
                 <div className="text-sm space-y-3">
                    <h4 className="font-medium text-base">Account Details</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div className="font-semibold text-muted-foreground">Status:</div>
                        <div>
                            <Badge variant={selectedUser.status === 'Active' ? 'default' : selectedUser.status === 'Pending' ? 'secondary' : 'destructive'}>
                                {selectedUser.status}
                            </Badge>
                        </div>
                        <div className="font-semibold text-muted-foreground">Joined Date:</div>
                        <div>{new Date(selectedUser.joined).toLocaleDateString()}</div>
                    </div>
                 </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-destructive"/>
                Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account for <strong>{selectedUser?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">
                Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
