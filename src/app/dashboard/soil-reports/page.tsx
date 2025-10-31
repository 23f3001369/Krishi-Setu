
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { FlaskConical, FileText, Image as ImageIcon, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

type SoilReport = {
  id: string;
  reportText: string;
  reportImage?: string;
  createdAt: Timestamp;
};

export default function SoilReportsPage() {
  const { user } = useUser();
  const db = useFirestore();

  const reportsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    // Removed orderBy from the query to prevent indexing issues.
    // Sorting will be handled on the client-side.
    return query(collection(db, 'farmers', user.uid, 'soilReports'));
  }, [db, user?.uid]);

  const { data: reports, isLoading } = useCollection<SoilReport>(reportsQuery);

  // Sort reports on the client side after fetching
  const sortedReports = React.useMemo(() => {
    if (!reports) return [];
    return [...reports].sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
  }, [reports]);

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Soil Health Reports</h1>
        <p className="text-muted-foreground">A history of all your saved soil analysis reports.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Reports</CardTitle>
          <CardDescription>
            Review past soil reports to track changes over time.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          )}

          {!isLoading && sortedReports && sortedReports.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {sortedReports.map((report) => (
                <AccordionItem value={report.id} key={report.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4 text-left">
                        <FlaskConical className="h-5 w-5 text-primary" />
                        <div>
                            <p className="font-semibold">Soil Report</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Saved on {format(report.createdAt.toDate(), 'PPP')}
                            </p>
                        </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4" />
                            Analysis Text
                        </h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
                            {report.reportText}
                        </p>
                    </div>
                    {report.reportImage && (
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-semibold flex items-center gap-2 mb-2">
                                <ImageIcon className="h-4 w-4" />
                                Saved Image
                            </h4>
                            <div className="relative aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-md border">
                                <Image
                                src={report.reportImage}
                                alt="Soil report"
                                fill
                                className="object-contain"
                                />
                            </div>
                        </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : !isLoading && (
            <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                <FileText className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">No Reports Found</h3>
                <p className="mt-1 text-sm">
                    Your saved soil reports will appear here.
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
