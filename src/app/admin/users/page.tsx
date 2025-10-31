
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { MoreHorizontal, Search, Users, Trash2, Eye, Ban, AlertTriangle, Wheat } from "lucide-react";
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
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, Timestamp, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Data Types from Firestore
type Farmer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: Timestamp;
  photoURL?: string;
};

type Farm = {
  id: string;
  farmerId: string;
  name: string;
  mainCrops: string[];
};

// Combined type for UI
type EnrichedFarmer = Farmer & {
  farmName?: string;
  majorCrops?: string;
};


export default function UserManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<EnrichedFarmer | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const db = useFirestore();
    const { toast } = useToast();

    // Fetch all farmers
    const farmersQuery = useMemoFirebase(() => db ? collection(db, 'farmers') : null, [db]);
    const { data: farmers, isLoading: isLoadingFarmers } = useCollection<Farmer>(farmersQuery);

    // Fetch all farms
    const farmsQuery = useMemoFirebase(() => db ? collection(db, 'farms') : null, [db]);
    const { data: farms, isLoading: isLoadingFarms } = useCollection<Farm>(farmsQuery);

    // Combine farmer and farm data
    const enrichedUsers = useMemo((): EnrichedFarmer[] => {
        if (!farmers || !farms) return [];

        const farmsByFarmerId = new Map<string, Farm[]>();
        farms.forEach(farm => {
            if (!farmsByFarmerId.has(farm.farmerId)) {
                farmsByFarmerId.set(farm.farmerId, []);
            }
            farmsByFarmerId.get(farm.farmerId)!.push(farm);
        });

        return farmers.map(farmer => {
            const userFarms = farmsByFarmerId.get(farmer.id);
            const mainFarm = userFarms?.[0]; // Get the first farm for simplicity
            return {
                ...farmer,
                farmName: mainFarm?.name || 'N/A',
                majorCrops: mainFarm?.mainCrops?.join(', ') || 'N/A',
            };
        });
    }, [farmers, farms]);
    
    const filteredUsers = useMemo(() => {
         return enrichedUsers.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.farmName && user.farmName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [enrichedUsers, searchTerm]);


    const handleViewDetails = (user: EnrichedFarmer) => {
        setSelectedUser(user);
        setIsDetailsOpen(true);
    };

    const handleSuspendUser = async (user: EnrichedFarmer) => {
        if (!db) return;
        const userDocRef = doc(db, 'farmers', user.id);
        const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await updateDoc(userDocRef, { status: newStatus });
            toast({
                title: `User ${newStatus === 'Active' ? 'Activated' : 'Suspended'}`,
                description: `${user.name}'s account status has been updated.`,
            });
        } catch (error) {
            console.error("Error updating user status:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update user status.' });
        }
    };
    
    const openDeleteConfirm = (user: EnrichedFarmer) => {
        setSelectedUser(user);
        setIsDeleteConfirmOpen(true);
    };

    const handleDeleteUser = async () => {
        if (!selectedUser || !db) return;
        const userDocRef = doc(db, 'farmers', selectedUser.id);
        try {
            await deleteDoc(userDocRef);
            toast({
                title: 'User Deleted',
                description: `${selectedUser.name}'s account has been permanently deleted.`,
            });
            // Note: This only deletes the farmer doc. Associated farms/etc. would need a Cloud Function.
        } catch (error) {
            console.error("Error deleting user:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete user account.' });
        }
        setIsDeleteConfirmOpen(false);
        setSelectedUser(null);
    };
    
    const isLoading = isLoadingFarmers || isLoadingFarms;

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
                  Total: {enrichedUsers.length} users.
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
                {isLoading ? (
                    [...Array(4)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground md:hidden">
                          {user.email}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{user.farmName}</TableCell>
                    <TableCell className="hidden md:table-cell">{user.createdAt ? user.createdAt.toDate().toLocaleDateString() : 'N/A'}</TableCell>
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
                          <DropdownMenuItem onSelect={() => handleSuspendUser(user)}>
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
            {!isLoading && filteredUsers.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                    {searchTerm ? "No users match your search." : "No registered users yet."}
                </div>
            )}
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
                        <AvatarImage src={selectedUser.photoURL} alt={selectedUser.name} />
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
                        <div>{selectedUser.createdAt ? selectedUser.createdAt.toDate().toLocaleDateString() : 'N/A'}</div>
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
    