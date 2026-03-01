'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Newsletter } from '@/types/database';
import AdminHeader from '@/components/admin/AdminHeader';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminPage() {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');

  const { data: newsletters = [], mutate: mutateNewsletters } = useSWR<
    Newsletter[]
  >('/api/admin/newsletters', fetcher);

  const handleSend = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to send this newsletter to all subscribers?'
      )
    ) {
      return;
    }

    setIsSending(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletterId: id })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          `Newsletter sent successfully to ${data.sent} subscribers!`
        );
        await mutateNewsletters();
      } else {
        setMessage(data.error || 'Failed to send newsletter');
      }
    } catch {
      setMessage('Error sending newsletter');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className='min-h-screen bg-zinc-50 dark:bg-zinc-950'>
      <AdminHeader backHref='/' backLabel='View Site' />

      <main className='mx-auto max-w-6xl px-6 py-8'>
        {message && (
          <div className='mb-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100'>
            {message}
          </div>
        )}

        <div className='flex justify-between items-center mb-8'>
          <h2 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>
            All Newsletters
          </h2>
          <Link
            href='/admin/new'
            className='px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200'
          >
            Create New
          </Link>
        </div>

        <div className='space-y-4'>
          {newsletters.map((newsletter) => (
            <div
              key={newsletter.id}
              className='p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg'
            >
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1'>
                    {newsletter.title}
                  </h3>
                  <p className='text-sm text-zinc-600 dark:text-zinc-400'>
                    Status: {newsletter.status} • {newsletter.content.length}{' '}
                    sections
                    {newsletter.sent_at &&
                      ` • Sent ${new Date(newsletter.sent_at).toLocaleDateString()}`}
                  </p>
                </div>
                <div className='flex gap-2'>
                  <Link
                    href={`/admin/edit/${newsletter.id}`}
                    className='px-4 py-2 text-sm bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700'
                  >
                    Edit
                  </Link>
                  {newsletter.status === 'draft' && (
                    <button
                      onClick={() => handleSend(newsletter.id)}
                      disabled={isSending}
                      className='px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50'
                    >
                      {isSending ? 'Sending...' : 'Send'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {newsletters.length === 0 && (
            <p className='text-center text-zinc-500 dark:text-zinc-500 py-8'>
              No newsletters yet. Create your first one!
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
