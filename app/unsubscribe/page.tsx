'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid unsubscribe link');
        return;
      }
      try {
        const response = await fetch('/api/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('You have been successfully unsubscribed.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to unsubscribe. Please try again.');
        }
      } catch {
        setStatus('error');
        setMessage('An error occurred. Please try again later.');
      }
    };

    unsubscribe();
  }, [token]);

  return (
    <div className='min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-6'>
      <div className='max-w-md w-full text-center'>
        <div className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8'>
          {status === 'loading' && (
            <>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-zinc-100 mx-auto mb-4'></div>
              <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2'>
                Processing...
              </h1>
              <p className='text-zinc-600 dark:text-zinc-400'>
                Please wait while we unsubscribe you.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className='text-5xl mb-4'>✓</div>
              <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2'>
                Unsubscribed
              </h1>
              <p className='text-zinc-600 dark:text-zinc-400 mb-6'>{message}</p>
              <p className='text-sm text-zinc-500 dark:text-zinc-500 mb-6'>
                We&apos;re sorry to see you go! You won&apos;t receive any more
                newsletters from us.
              </p>
              <Link
                href='/'
                className='inline-block px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors'
              >
                Return to Home
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className='text-5xl mb-4'>✕</div>
              <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2'>
                Error
              </h1>
              <p className='text-zinc-600 dark:text-zinc-400 mb-6'>{message}</p>
              <Link
                href='/'
                className='inline-block px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors'
              >
                Return to Home
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
