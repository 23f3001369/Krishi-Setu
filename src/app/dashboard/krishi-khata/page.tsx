
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { PlusCircle, ArrowUpCircle, ArrowDownCircle, Trash2, TrendingUp, TrendingDown, MinusCircle } from "lucide-react";
import { PlaceHolderImages } from '@/lib/placeholder-images';

type Transaction = {
    id: string;
    type: 'income' | 'expense';
    category: string;
    description: string;
    amount: number;
    date: string;
};

const initialTransactions: Transaction[] = [
    { id: '1', type: 'expense', category: 'Seeds', description: 'Corn seeds for 10 acres', amount: 5000, date: '2024-07-01' },
    { id: '2', type: 'expense', category: 'Fertilizer', description: 'Urea and DAP', amount: 8000, date: '2024-07-05' },
    { id: '3', type: 'expense', category: 'Labor', description: 'Wages for planting', amount: 12000, date: '2024-07-06' },
    { id: '4', type: 'income', category: 'Sale', description: 'Sold last season\'s wheat', amount: 75000, date: '2024-07-10' },
    { id: '5', type: 'expense', category: 'Pesticides', description: 'Pest control spray', amount: 3500, date: '2024-07-15' },
];

const expenseCategories = ['Seeds', 'Fertilizer', 'Pesticides', 'Labor', 'Machinery', 'Utilities', 'Other'];
const incomeCategories = ['Sale', 'Subsidy', 'Other'];

export default function KrishiKhataPage() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const heroImage = PlaceHolderImages.find(p => p.id === "krishi-khata-hero");

  const { totalIncome, totalExpenses, profitLoss } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      totalIncome: income,
      totalExpenses: expenses,
      profitLoss: income - expenses,
    };
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...transaction, id: crypto.randomUUID() }]);
    setIsDialogOpen(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Krishi Khata</h1>
        <p className="text-muted-foreground">Your digital ledger for tracking farm finances.</p>
      </div>

      {heroImage && (
        <div className="relative h-48 w-full overflow-hidden rounded-lg">
            <Image src={heroImage.imageUrl} alt={heroImage.description} data-ai-hint={heroImage.imageHint} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <h2 className="text-4xl font-bold text-white font-headline">Financial Overview</h2>
            </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalIncome.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className={profitLoss >= 0 ? 'border-green-500/50' : 'border-red-500/50'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit / Loss</CardTitle>
            <MinusCircle className={`h-4 w-4 ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{Math.abs(profitLoss).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{profitLoss >= 0 ? 'Profit' : 'Loss'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>A record of all your income and expenses.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Transaction
                </Button>
            </DialogTrigger>
            <TransactionDialog onSubmit={addTransaction} />
          </Dialog>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                        <TableRow key={t.id}>
                            <TableCell>{t.date}</TableCell>
                            <TableCell>
                                {t.type === 'income' ? 
                                    <span className="flex items-center gap-2 text-green-600"><ArrowUpCircle size={16}/> Income</span> : 
                                    <span className="flex items-center gap-2 text-red-600"><ArrowDownCircle size={16}/> Expense</span>
                                }
                            </TableCell>
                            <TableCell>{t.category}</TableCell>
                            <TableCell>{t.description}</TableCell>
                            <TableCell className="text-right font-medium">₹{t.amount.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => deleteTransaction(t.id)}>
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function TransactionDialog({ onSubmit }: { onSubmit: (data: Omit<Transaction, 'id'>) => void}) {
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const categories = type === 'income' ? incomeCategories : expenseCategories;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !amount || !date) {
            // Basic validation
            return;
        }
        onSubmit({
            type,
            category,
            amount: Number(amount),
            description,
            date
        });
        // Reset form
        setCategory('');
        setAmount('');
        setDescription('');
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>
                    Record a new income or expense to keep your ledger up to date.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Transaction Type</Label>
                        <Select onValueChange={(v: 'income' | 'expense') => setType(v)} value={type}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="expense">Expense</SelectItem>
                                <SelectItem value="income">Income</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Category</Label>
                         <Select onValueChange={setCategory} value={category}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (₹)</Label>
                        <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Bags of urea" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required/>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save Transaction</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}

