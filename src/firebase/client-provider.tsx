// src/firebase/client-provider.tsx
'use client';
import { useState, useEffect } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

import { FirebaseProvider, type FirebaseContextType } from './provider';
import { initializeFirebase } from './index';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebase, setFirebase] = useState<FirebaseContextType | null>(null);

  useEffect(() => {
    const init = async () => {
      const { firebaseApp, auth, firestore } = await initializeFirebase();
      setFirebase({ firebaseApp, auth, firestore });
    };

    init();
  }, []);

  if (!firebase) {
    // You can return a loading spinner here
    return null;
  }

  return <FirebaseProvider {...firebase}>{children}</FirebaseProvider>;
}
