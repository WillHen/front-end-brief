import { SignupForm } from '@/components/SignupForm';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className='flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black'>
      {/* Header */}
      <header className='w-full border-b border-zinc-200 dark:border-zinc-800'>
        <div className='mx-auto max-w-7xl px-6 py-4 flex justify-between items-center'>
          <Link href='/' className='flex items-center'>
            <Image
              src='/logo.svg'
              alt='Front-end Brief'
              width={250}
              height={60}
              priority
              className='h-10 w-auto'
            />
          </Link>
          <Link
            href='/newsletters'
            className='text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors'
          >
            Past Newsletters
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className='flex-1 flex items-center justify-center px-6 py-16'>
        <div className='max-w-3xl text-center'>
          <h2 className='text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl'>
            Stay ahead in front-end development
          </h2>
          <p className='mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400'>
            Get the latest articles, tools, and insights delivered to your inbox
            every week. Curated content to help you build better web
            experiences.
          </p>

          {/* Signup Form */}
          <div className='mt-10'>
            <SignupForm />
          </div>

          {/* Features */}
          <div className='mt-16 grid gap-8 sm:grid-cols-3'>
            <div className='flex flex-col items-center'>
              <div className='text-2xl mb-2'>📚</div>
              <h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
                Curated Articles
              </h3>
              <p className='mt-2 text-sm text-zinc-600 dark:text-zinc-400'>
                Handpicked posts from top developers
              </p>
            </div>
            <div className='flex flex-col items-center'>
              <div className='text-2xl mb-2'>🛠️</div>
              <h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
                Tools & Libraries
              </h3>
              <p className='mt-2 text-sm text-zinc-600 dark:text-zinc-400'>
                Discover the latest frameworks and tools
              </p>
            </div>
            <div className='flex flex-col items-center'>
              <div className='text-2xl mb-2'>💡</div>
              <h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
                Weekly Insights
              </h3>
              <p className='mt-2 text-sm text-zinc-600 dark:text-zinc-400'>
                Tips and best practices every week
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='w-full border-t border-zinc-200 dark:border-zinc-800 py-8'>
        <div className='mx-auto max-w-7xl px-6 text-center text-sm text-zinc-500 dark:text-zinc-500'>
          © {new Date().getFullYear()} Front-end Brief. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
