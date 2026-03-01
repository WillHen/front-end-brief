'use client';

import { useReducer, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Newsletter, NewsletterSection } from '@/types/database';

// Helper function to get default newsletter title
const getDefaultTitle = () => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };
  const dateStr = now.toLocaleDateString('en-US', options);
  return `Front-end Brief - Week of ${dateStr}`;
};

interface AdminState {
  isAuthenticated: boolean;
  password: string;
  authError: string;
  newsletters: Newsletter[];
  isCreating: boolean;
  title: string;
  sections: NewsletterSection[];
  isPreview: boolean;
  isSaving: boolean;
  isSending: boolean;
  message: string;
}

type AdminAction =
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_PASSWORD'; payload: string }
  | { type: 'SET_AUTH_ERROR'; payload: string }
  | { type: 'SET_NEWSLETTERS'; payload: Newsletter[] }
  | { type: 'SET_CREATING'; payload: boolean }
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_SECTIONS'; payload: NewsletterSection[] }
  | { type: 'SET_PREVIEW'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_SENDING'; payload: boolean }
  | { type: 'SET_MESSAGE'; payload: string }
  | { type: 'AUTH_SUCCESS'; payload: Newsletter[] }
  | { type: 'UPDATE_SECTION'; payload: { index: number; field: keyof NewsletterSection; value: string } }
  | { type: 'REMOVE_SECTION'; payload: number }
  | { type: 'ADD_SECTION' };

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_PASSWORD':
      return { ...state, password: action.payload };
    case 'SET_AUTH_ERROR':
      return { ...state, authError: action.payload };
    case 'SET_NEWSLETTERS':
      return { ...state, newsletters: action.payload };
    case 'SET_CREATING':
      return { ...state, isCreating: action.payload };
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'SET_SECTIONS':
      return { ...state, sections: action.payload };
    case 'SET_PREVIEW':
      return { ...state, isPreview: action.payload };
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    case 'SET_SENDING':
      return { ...state, isSending: action.payload };
    case 'SET_MESSAGE':
      return { ...state, message: action.payload };
    case 'AUTH_SUCCESS':
      return { ...state, isAuthenticated: true, newsletters: action.payload };
    case 'ADD_SECTION':
      return { ...state, sections: [...state.sections, { type: 'article', title: '', description: '', url: '' }] };
    case 'UPDATE_SECTION': {
      const updated = [...state.sections];
      updated[action.payload.index] = { ...updated[action.payload.index], [action.payload.field]: action.payload.value };
      return { ...state, sections: updated };
    }
    case 'REMOVE_SECTION':
      return { ...state, sections: state.sections.filter((_, i) => i !== action.payload) };
    default:
      return state;
  }
}

const initialState: AdminState = {
  isAuthenticated: false,
  password: '',
  authError: '',
  newsletters: [],
  isCreating: false,
  title: getDefaultTitle(),
  sections: [],
  isPreview: false,
  isSaving: false,
  isSending: false,
  message: ''
};

export default function AdminPage() {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const {
    isAuthenticated, password, authError, newsletters, isCreating,
    title, sections, isPreview, isSaving, isSending, message
  } = state;

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  // Only fetch newsletters when authenticated
  const { data: fetchedNewsletters, mutate: mutateNewsletters } = useSWR<Newsletter[]>(
    isAuthenticated ? '/api/admin/newsletters' : null,
    fetcher
  );

  // Sync SWR data into reducer state
  useEffect(() => {
    if (fetchedNewsletters) {
      dispatch({ type: 'SET_NEWSLETTERS', payload: fetchedNewsletters });
    }
  }, [fetchedNewsletters]);

  // Check authentication on mount
  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_AUTH_ERROR', payload: '' });

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
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      } else {
        dispatch({ type: 'SET_AUTH_ERROR', payload: data.error || 'Incorrect password' });
      }
    } catch {
      dispatch({ type: 'SET_AUTH_ERROR', payload: 'Authentication failed. Please try again.' });
    }
  };

  const addSection = () => {
    dispatch({ type: 'ADD_SECTION' });
  };

  const updateSection = (
    index: number,
    field: keyof NewsletterSection,
    value: string
  ) => {
    dispatch({ type: 'UPDATE_SECTION', payload: { index, field, value } });
  };

  const removeSection = (index: number) => {
    dispatch({ type: 'REMOVE_SECTION', payload: index });
  };

  const handleSave = async () => {
    dispatch({ type: 'SET_SAVING', payload: true });
    dispatch({ type: 'SET_MESSAGE', payload: '' });

    try {
      const response = await fetch('/api/admin/newsletters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content: sections })
      });

      if (response.ok) {
        dispatch({ type: 'SET_MESSAGE', payload: 'Newsletter saved successfully!' });
        await mutateNewsletters();
        dispatch({ type: 'SET_CREATING', payload: false });
      } else {
        dispatch({ type: 'SET_MESSAGE', payload: 'Failed to save newsletter' });
      }
    } catch {
      dispatch({ type: 'SET_MESSAGE', payload: 'Error saving newsletter' });
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
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

    dispatch({ type: 'SET_SENDING', payload: true });
    dispatch({ type: 'SET_MESSAGE', payload: '' });

    try {
      const response = await fetch('/api/admin/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletterId: id })
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({ type: 'SET_MESSAGE', payload: `Newsletter sent successfully to ${data.sent} subscribers!` });
        await mutateNewsletters();
      } else {
        dispatch({ type: 'SET_MESSAGE', payload: data.error || 'Failed to send newsletter' });
      }
    } catch {
      dispatch({ type: 'SET_MESSAGE', payload: 'Error sending newsletter' });
    } finally {
      dispatch({ type: 'SET_SENDING', payload: false });
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
              onChange={(e) => dispatch({ type: 'SET_PASSWORD', payload: e.target.value })}
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
              Create Newsletter
            </h1>
            <button
              onClick={() => dispatch({ type: 'SET_CREATING', payload: false })}
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
              onClick={() => dispatch({ type: 'SET_PREVIEW', payload: false })}
              className={`px-4 py-2 rounded-lg font-medium ${
                !isPreview
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_PREVIEW', payload: true })}
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
                <label htmlFor='newsletter-title' className='block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2'>
                  Newsletter Title
                </label>
                <input
                  id='newsletter-title'
                  type='text'
                  value={title}
                  onChange={(e) => dispatch({ type: 'SET_TITLE', payload: e.target.value })}
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
                    key={section.title ? `edit-${section.type}-${section.title}` : `edit-new-${sections.indexOf(section)}`}
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
                {sections.map((section) => (
                  <div
                    key={section.title ? `preview-${section.type}-${section.title}` : `preview-new-${sections.indexOf(section)}`}
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
                dispatch({ type: 'SET_AUTHENTICATED', payload: false });
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
