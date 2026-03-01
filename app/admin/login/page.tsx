'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/admin';

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        // Cookie is set by the API route — just redirect
        router.push(from);
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Incorrect password');
      }
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-6'>
      <div className='w-full max-w-md'>
        <div className='flex justify-center mb-8'>
          <Image
            src='/logo.svg'
            alt='Front-end Brief'
            width={250}
            height={60}
            className='h-10 w-auto'
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className='bg-white dark:bg-zinc-900 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800'
        >
          <h1 className='text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6 text-center'>
            Admin Access
          </h1>

          <label htmlFor='password' className='sr-only'>
            Password
          </label>
          <input
            id='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Enter password'
            required
            autoFocus
            className='w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 mb-4'
          />

          {error && (
            <p className='text-red-600 dark:text-red-400 text-sm mb-4'>
              {error}
            </p>
          )}

          <button
            type='submit'
            disabled={isLoading}
            className='w-full px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
