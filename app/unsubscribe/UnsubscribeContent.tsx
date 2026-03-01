'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const unsubscribeFetcher = async (token: string) => {
  const response = await fetch('/api/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to unsubscribe. Please try again.');
  }

  return data;
};

export default function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { data, error, isLoading } = useSWR(
    token ? ['unsubscribe', token] : null,
    ([, t]) => unsubscribeFetcher(t),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const state = !token
    ? { status: 'error' as const, message: 'Invalid unsubscribe link' }
    : isLoading
      ? { status: 'loading' as const, message: '' }
      : error
        ? { status: 'error' as const, message: error.message || 'An error occurred. Please try again later.' }
        : data
          ? { status: 'success' as const, message: 'You have been successfully unsubscribed.' }
          : { status: 'loading' as const, message: '' };

  return (
    <div className='min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-6'>
      <div className='max-w-md w-full text-center'>
        <div className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8'>
          {state.status === 'loading' && (
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

          {state.status === 'success' && (
            <>
              <div className='text-5xl mb-4'>✓</div>
              <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2'>
                Unsubscribed
              </h1>
              <p className='text-zinc-600 dark:text-zinc-400 mb-6'>{state.message}</p>
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

          {state.status === 'error' && (
            <>
              <div className='text-5xl mb-4'>✕</div>
              <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2'>
                Error
              </h1>
              <p className='text-zinc-600 dark:text-zinc-400 mb-6'>{state.message}</p>
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
