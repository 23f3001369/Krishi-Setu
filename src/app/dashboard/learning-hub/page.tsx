'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function LearningHubRedirectPage() {
  useEffect(() => {
    redirect('/dashboard/krishi-ai');
  }, []);

  return null; // This component will redirect before rendering anything
}
