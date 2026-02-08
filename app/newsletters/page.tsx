import Link from 'next/link';
import Image from 'next/image';
import { getServiceSupabase } from '@/lib/supabase';
import { Newsletter } from '@/types/database';

export default async function NewslettersPage() {
  const supabase = getServiceSupabase();

  const { data: newsletters, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('status', 'sent')
    .order('sent_at', { ascending: false });

  if (error) {
    console.error('Error fetching newsletters:', error);
  }

  return (
    <div className='min-h-screen bg-zinc-50 dark:bg-zinc-950'>
      {/* Header */}
      <header className='w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black'>
        <div className='mx-auto max-w-7xl px-6 py-4 flex justify-between items-center'>
          <Link href='/' className='flex items-center'>
            <Image
              src='/logo.svg'
              alt='Front-end Brief'
              width={250}
              height={60}
              className='h-10 w-auto'
            />
          </Link>
          <Link
            href='/'
            className='text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors'
          >
            Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className='mx-auto max-w-4xl px-6 py-16'>
        <h1 className='text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4'>
          Past Newsletters
        </h1>
        <p className='text-lg text-zinc-600 dark:text-zinc-400 mb-12'>
          Browse our archive of front-end development newsletters.
        </p>

        {!newsletters || newsletters.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-zinc-500 dark:text-zinc-500'>
              No newsletters published yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className='space-y-6'>
            {(newsletters as Newsletter[]).map((newsletter) => (
              <Link
                key={newsletter.id}
                href={`/newsletters/${newsletter.id}`}
                className='block p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors'
              >
                <div className='flex justify-between items-start mb-2'>
                  <h2 className='text-xl font-semibold text-zinc-900 dark:text-zinc-100'>
                    {newsletter.title}
                  </h2>
                  <span className='text-sm text-zinc-500 dark:text-zinc-500 whitespace-nowrap ml-4'>
                    {newsletter.sent_at
                      ? new Date(newsletter.sent_at).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }
                        )
                      : 'Draft'}
                  </span>
                </div>
                <p className='text-zinc-600 dark:text-zinc-400'>
                  {newsletter.content.length} items • Click to read more
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
