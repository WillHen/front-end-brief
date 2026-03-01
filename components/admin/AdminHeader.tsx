import Link from 'next/link';
import Image from 'next/image';

interface AdminHeaderProps {
  backHref?: string;
  backLabel?: string;
}

export default function AdminHeader({
  backHref = '/admin',
  backLabel = 'Back to List'
}: AdminHeaderProps) {
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
        <Link
          href={backHref}
          className='text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
        >
          {backLabel}
        </Link>
      </div>
    </header>
  );
}
