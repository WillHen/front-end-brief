import type { Metadata } from 'next';
import { Suspense } from 'react';
import UnsubscribeContent from './UnsubscribeContent';

export const metadata: Metadata = {
  title: 'Unsubscribe - Front-end Brief',
  description: 'Unsubscribe from the Front-end Brief newsletter.'
};

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-zinc-100'></div>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
