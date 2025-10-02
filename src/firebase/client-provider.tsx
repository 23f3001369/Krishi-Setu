
// src/firebase/client-provider.tsx
'use client';
import { useState, useEffect } from 'react';
import type { FirebaseContextType } from './provider';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebase, setFirebase] = useState<FirebaseContextType | null>(null);

  useEffect(() => {
    // Firebase initialization is asynchronous.
    // We use an effect to initialize it on the client.
    const init = () => {
      const { firebaseApp, auth, firestore } = initializeFirebase();
      setFirebase({ firebaseApp, auth, firestore });
    };

    if (typeof window !== 'undefined') {
        init();
    }
  }, []);

  // While Firebase is initializing, we return a loading state.
  // This prevents child components from rendering and trying to access
  // Firebase services before they are ready.
  if (!firebase) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
            <div className="w-full max-w-md">
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                             <Skeleton className="h-4 w-24" />
                             <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                             <Skeleton className="h-4 w-24" />
                             <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
  }

  // Once Firebase is initialized, we render the provider with the
  // initialized services.
  return <FirebaseProvider {...firebase}>{children}</FirebaseProvider>;
}
