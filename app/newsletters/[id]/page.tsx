import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServiceSupabase } from '@/lib/supabase';
import { Newsletter, NewsletterSection } from '@/types/database';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = getServiceSupabase();
  const { data: newsletter } = await supabase
    .from('newsletters')
    .select('title')
    .eq('id', id)
    .eq('status', 'sent')
    .single();

  return {
    title: newsletter ? `${newsletter.title} - Front-end Brief` : 'Newsletter - Front-end Brief',
    description: newsletter
      ? `Read ${newsletter.title} from Front-end Brief.`
      : 'Read this edition of Front-end Brief.'
  };
}

export default async function NewsletterPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = getServiceSupabase();

  const { data: newsletter, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', id)
    .eq('status', 'sent')
    .single();

  if (error || !newsletter) {
    notFound();
  }

  const typedNewsletter = newsletter as Newsletter;

  return (
    <div className='min-h-screen bg-zinc-50 dark:bg-zinc-950'>
      {/* Header */}
      <header className='w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black'>
        <div className='mx-auto max-w-7xl px-6 py-4 flex justify-between items-center'>
          <Link
            href='/'
            className='text-xl font-bold text-zinc-900 dark:text-zinc-100'
          >
            Front-end Brief
          </Link>
          <Link
            href='/newsletters'
            className='text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors'
          >
            All Newsletters
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className='mx-auto max-w-3xl px-6 py-16'>
        <Link
          href='/newsletters'
          className='inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 transition-colors'
        >
          ← Back to all newsletters
        </Link>

        <article>
          <header className='mb-12'>
            <h1 className='text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4'>
              {typedNewsletter.title}
            </h1>
            <p className='text-zinc-600 dark:text-zinc-400'>
              {typedNewsletter.sent_at
                ? new Date(typedNewsletter.sent_at).toLocaleDateString(
                    'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }
                  )
                : 'Draft'}
            </p>
          </header>

          <div className='space-y-8'>
            {typedNewsletter.content.map(
              (section: NewsletterSection) => (
                <section
                  key={`${section.type}-${section.title}`}
                  className='p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg'
                >
                  <div className='flex items-start gap-4'>
                    <div className='flex-shrink-0 text-2xl'>
                      {section.type === 'article' && '📚'}
                      {section.type === 'tip' && '💡'}
                      {section.type === 'tool' && '🛠️'}
                      {section.type === 'text' && '✍️'}
                    </div>
                    <div className='flex-1'>
                      <h2 className='text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2'>
                        {section.title}
                      </h2>
                      {section.description && (
                        <p className='text-zinc-600 dark:text-zinc-400 mb-3'>
                          {section.description}
                        </p>
                      )}
                      {section.url && (
                        <a
                          href={section.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-zinc-900 dark:text-zinc-100 hover:underline font-medium'
                        >
                          Read more →
                        </a>
                      )}
                    </div>
                  </div>
                </section>
              )
            )}
          </div>
        </article>

        {/* Call to Action */}
        <div className='mt-16 p-8 bg-zinc-900 dark:bg-zinc-100 rounded-lg text-center'>
          <h3 className='text-2xl font-bold text-white dark:text-zinc-900 mb-4'>
            Want more content like this?
          </h3>
          <p className='text-zinc-300 dark:text-zinc-700 mb-6'>
            Subscribe to get weekly front-end development insights delivered to
            your inbox.
          </p>
          <Link
            href='/'
            className='inline-block px-6 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors'
          >
            Subscribe Now
          </Link>
        </div>
      </main>
    </div>
  );
}
