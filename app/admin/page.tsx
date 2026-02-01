'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newsletter, NewsletterSection } from '@/types/database';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<NewsletterSection[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');

  // Check authentication
  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadNewsletters();
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('admin_auth', 'true');
        setIsAuthenticated(true);
        loadNewsletters();
      } else {
        setAuthError(data.error || 'Incorrect password');
      }
    } catch {
      setAuthError('Authentication failed. Please try again.');
    }
  };

  const loadNewsletters = async () => {
    try {
      const response = await fetch('/api/admin/newsletters');
      const data = await response.json();
      setNewsletters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load newsletters:', err);
      setNewsletters([]);
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingId(null);
    setTitle('');
    setSections([]);
    setIsPreview(false);
  };

  const handleEdit = (newsletter: Newsletter) => {
    setIsCreating(true);
    setEditingId(newsletter.id);
    setTitle(newsletter.title);
    setSections(newsletter.content);
    setIsPreview(false);
  };

  const addSection = () => {
    setSections([
      ...sections,
      { type: 'article', title: '', description: '', url: '' }
    ]);
  };

  const updateSection = (
    index: number,
    field: keyof NewsletterSection,
    value: string
  ) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/newsletters', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, title, content: sections })
      });

      if (response.ok) {
        setMessage('Newsletter saved successfully!');
        await loadNewsletters();
        setIsCreating(false);
      } else {
        setMessage('Failed to save newsletter');
      }
    } catch {
      setMessage('Error saving newsletter');
    } finally {
      setIsSaving(false);
    }
  };

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
        setMessage(`Newsletter sent successfully to ${data.sent} subscribers!`);
        await loadNewsletters();
      } else {
        setMessage(data.error || 'Failed to send newsletter');
      }
    } catch {
      setMessage('Error sending newsletter');
    } finally {
      setIsSending(false);
    }
  };

  // Authentication screen
  if (!isAuthenticated) {
    return (
      <div className='min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-6'>
        <div className='w-full max-w-md'>
          <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 text-center'>
            Admin Access
          </h1>
          <form
            onSubmit={handleAuth}
            className='bg-white dark:bg-zinc-900 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800'
          >
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter password'
              className='w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 mb-4'
            />
            {authError && (
              <p className='text-red-600 text-sm mb-4'>{authError}</p>
            )}
            <button
              type='submit'
              className='w-full px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200'
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Editor screen
  if (isCreating) {
    return (
      <div className='min-h-screen bg-zinc-50 dark:bg-zinc-950'>
        <header className='w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black'>
          <div className='mx-auto max-w-7xl px-6 py-4 flex justify-between items-center'>
            <h1 className='text-xl font-bold text-zinc-900 dark:text-zinc-100'>
              {editingId ? 'Edit Newsletter' : 'Create Newsletter'}
            </h1>
            <button
              onClick={() => setIsCreating(false)}
              className='text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            >
              Back to List
            </button>
          </div>
        </header>

        <main className='mx-auto max-w-4xl px-6 py-8'>
          {message && (
            <div className='mb-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100'>
              {message}
            </div>
          )}

          <div className='flex gap-4 mb-6'>
            <button
              onClick={() => setIsPreview(false)}
              className={`px-4 py-2 rounded-lg font-medium ${
                !isPreview
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setIsPreview(true)}
              className={`px-4 py-2 rounded-lg font-medium ${
                isPreview
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
              }`}
            >
              Preview
            </button>
          </div>

          {!isPreview ? (
            <div className='space-y-6'>
              <div>
                <label className='block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2'>
                  Newsletter Title
                </label>
                <input
                  type='text'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='e.g., Front-end Brief - Week of Feb 1, 2026'
                  className='w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                />
              </div>

              <div>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>
                    Content Sections
                  </h3>
                  <button
                    onClick={addSection}
                    className='px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium'
                  >
                    + Add Section
                  </button>
                </div>

                {sections.map((section, index) => (
                  <div
                    key={index}
                    className='mb-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg'
                  >
                    <div className='flex justify-between items-start mb-3'>
                      <select
                        value={section.type}
                        onChange={(e) =>
                          updateSection(index, 'type', e.target.value)
                        }
                        className='px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      >
                        <option value='article'>📚 Article</option>
                        <option value='tip'>💡 Tip</option>
                        <option value='tool'>🛠️ Tool</option>
                        <option value='text'>✍️ Text</option>
                      </select>
                      <button
                        onClick={() => removeSection(index)}
                        className='text-red-600 hover:text-red-800 text-sm'
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type='text'
                      value={section.title}
                      onChange={(e) =>
                        updateSection(index, 'title', e.target.value)
                      }
                      placeholder='Section title'
                      className='w-full px-3 py-2 mb-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    />
                    <textarea
                      value={section.description}
                      onChange={(e) =>
                        updateSection(index, 'description', e.target.value)
                      }
                      placeholder='Description'
                      rows={3}
                      className='w-full px-3 py-2 mb-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    />
                    <input
                      type='url'
                      value={section.url}
                      onChange={(e) =>
                        updateSection(index, 'url', e.target.value)
                      }
                      placeholder='URL (optional)'
                      className='w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving || !title}
                className='w-full px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50'
              >
                {isSaving ? 'Saving...' : 'Save Newsletter'}
              </button>
            </div>
          ) : (
            <div className='bg-white dark:bg-zinc-900 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800'>
              <h2 className='text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-6'>
                {title}
              </h2>
              <div className='space-y-6'>
                {sections.map((section, index) => (
                  <div
                    key={index}
                    className='border-b border-zinc-200 dark:border-zinc-800 pb-6'
                  >
                    <div className='flex items-start gap-3'>
                      <div className='text-2xl'>
                        {section.type === 'article' && '📚'}
                        {section.type === 'tip' && '💡'}
                        {section.type === 'tool' && '🛠️'}
                        {section.type === 'text' && '✍️'}
                      </div>
                      <div>
                        <h3 className='text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2'>
                          {section.title}
                        </h3>
                        {section.description && (
                          <p className='text-zinc-600 dark:text-zinc-400 mb-2'>
                            {section.description}
                          </p>
                        )}
                        {section.url && (
                          <a
                            href={section.url}
                            className='text-zinc-900 dark:text-zinc-100 hover:underline'
                          >
                            Read more →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // List screen
  return (
    <div className='min-h-screen bg-zinc-50 dark:bg-zinc-950'>
      <header className='w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black'>
        <div className='mx-auto max-w-7xl px-6 py-4 flex justify-between items-center'>
          <h1 className='text-xl font-bold text-zinc-900 dark:text-zinc-100'>
            Newsletter Admin
          </h1>
          <div className='flex gap-4'>
            <Link
              href='/'
              className='text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            >
              View Site
            </Link>
            <button
              onClick={() => {
                sessionStorage.removeItem('admin_auth');
                setIsAuthenticated(false);
              }}
              className='text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            >
              Logout
            </button>
          </div>
        </div>
      </header>

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
            href="/admin/new"
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
