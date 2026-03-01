'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface AdminHeaderProps {
  backHref?: string;
  backLabel?: string;
  showLogout?: boolean;
}

export default function AdminHeader({
  backHref = '/admin',
  backLabel = 'Back to List',
  showLogout = true
}: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <header className='w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black'>
      <div className='mx-auto max-w-7xl px-6 py-4 flex justify-between items-center'>
        <Link href={backHref} className='flex items-center'>
          <Image
            src='/logo.svg'
            alt='Front-end Brief'
            width={250}
            height={60}
            className='h-10 w-auto'
          />
        </Link>
        <div className='flex items-center gap-4'>
          <Link
            href={backHref}
            className='text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          >
            {backLabel}
          </Link>
          {showLogout && (
            <button
              onClick={handleLogout}
              className='text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
