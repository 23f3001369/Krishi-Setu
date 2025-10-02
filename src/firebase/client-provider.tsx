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
    // Firebase initialization is asynchronous.
    // We use an effect to initialize it on the client.
    const init = async () => {
      const { firebaseApp, auth, firestore } = await initializeFirebase();
      setFirebase({ firebaseApp, auth, firestore });
    };

    init();
  }, []);

  // While Firebase is initializing, we can return a loading state or null.
  // This prevents child components from rendering and trying to access
  // Firebase services before they are ready.
  if (!firebase) {
    return null;
  }

  // Once Firebase is initialized, we render the provider with the
  // initialized services.
  return <FirebaseProvider {...firebase}>{children}</FirebaseProvider>;
}
