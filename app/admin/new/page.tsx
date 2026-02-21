'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { NewsletterSection } from '@/types/database';

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

export default function NewNewsletterPage() {
  const router = useRouter();
  const [state, setState] = useState({
    title: getDefaultTitle(),
    sections: [] as NewsletterSection[],
    isPreview: false,
    isSaving: false,
    message: ''
  });
  const [analyzingIndexes, setAnalyzingIndexes] = useState<Set<number>>(
    new Set()
  );
  const [isDiscovering, setIsDiscovering] = useState(false);

  const truncateText = (text: string, maxLength: number = 350): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const addSection = () => {
    setState((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { type: 'article', title: '', description: '', url: '' }
      ]
    }));
  };

  const updateSection = (
    index: number,
    field: keyof NewsletterSection,
    value: string
  ) => {
    setState((prev) => {
      const updated = [...prev.sections];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, sections: updated };
    });
  };

  const removeSection = (index: number) => {
    setState((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const analyzeUrl = async (index: number, url: string | undefined) => {
    if (!url || !url.startsWith('http')) return;

    setAnalyzingIndexes((prev) => new Set(prev).add(index));

    try {
      const response = await fetch('/api/admin/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (response.ok) {
        const data = await response.json();
        setState((prev) => {
          const updated = [...prev.sections];
          updated[index] = {
            ...updated[index],
            title: data.title,
            description: data.description,
            type: data.type
          };
          return { ...prev, sections: updated };
        });
      }
    } catch (error) {
      console.error('Failed to analyze URL:', error);
    } finally {
      setAnalyzingIndexes((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const discoverContent = async () => {
    setIsDiscovering(true);
    setState((prev) => ({ ...prev, message: 'Discovering content...' }));

    try {
      const response = await fetch('/api/admin/discover-content', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setState((prev) => ({
          ...prev,
          sections: data.articles,
          message: `Added ${data.count} articles from content discovery!`
        }));
        setTimeout(() => {
          setState((prev) => ({ ...prev, message: '' }));
        }, 3000);
      } else {
        const error = await response.json();
        setState((prev) => ({
          ...prev,
          message: error.error || 'Failed to discover content'
        }));
      }
    } catch (error) {
      console.error('Failed to discover content:', error);
      setState((prev) => ({
        ...prev,
        message: 'Error discovering content'
      }));
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleSave = async () => {
    setState((prev) => ({ ...prev, isSaving: true, message: '' }));

    try {
      const response = await fetch('/api/admin/newsletters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: state.title, content: state.sections })
      });

      if (response.ok) {
        setState((prev) => ({
          ...prev,
          message: 'Newsletter saved successfully!'
        }));
        setTimeout(() => router.push('/admin'), 1500);
      } else {
        setState((prev) => ({ ...prev, message: 'Failed to save newsletter' }));
      }
    } catch {
      setState((prev) => ({ ...prev, message: 'Error saving newsletter' }));
    } finally {
      setState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  return (
    <div className='min-h-screen bg-zinc-50 dark:bg-zinc-950'>
      <header className='w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black'>
        <div className='mx-auto max-w-7xl px-6 py-4 flex justify-between items-center'>
          <Link href='/admin' className='flex items-center'>
            <Image
              src='/logo.svg'
              alt='Front-end Brief'
              width={250}
              height={60}
              className='h-10 w-auto'
            />
          </Link>
          <Link
            href='/admin'
            className='text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          >
            Back to List
          </Link>
        </div>
      </header>

      <main className='mx-auto max-w-4xl px-6 py-8'>
        {state.message && (
          <div className='mb-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100'>
            {state.message}
          </div>
        )}

        <div className='flex gap-4 mb-6'>
          <button
            onClick={() => setState((prev) => ({ ...prev, isPreview: false }))}
            className={`px-4 py-2 rounded-lg font-medium ${
              !state.isPreview
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setState((prev) => ({ ...prev, isPreview: true }))}
            className={`px-4 py-2 rounded-lg font-medium ${
              state.isPreview
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
            }`}
          >
            Preview
          </button>
        </div>

        {!state.isPreview ? (
          <div className='space-y-6'>
            <div>
              <label
                htmlFor='newsletter-title'
                className='block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2'
              >
                Newsletter Title
              </label>
              <input
                id='newsletter-title'
                type='text'
                value={state.title}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder='e.g., Front-end Brief - Week of Feb 1, 2026'
                className='w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
              />
            </div>

            <div>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>
                  Content Sections
                </h3>
                <div className='flex gap-2'>
                  <button
                    onClick={discoverContent}
                    disabled={isDiscovering}
                    className='px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isDiscovering
                      ? '🔍 Discovering...'
                      : '🔍 Discover Content'}
                  </button>
                  <button
                    onClick={addSection}
                    className='px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium'
                  >
                    + Add Section
                  </button>
                </div>
              </div>

              {state.sections.map((section, index) => (
                <div
                  key={
                    section.title
                      ? `edit-${section.type}-${section.title}`
                      : `edit-new-${state.sections.indexOf(section)}`
                  }
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
                  <div className='flex gap-2'>
                    <input
                      type='url'
                      value={section.url}
                      onChange={(e) =>
                        updateSection(index, 'url', e.target.value)
                      }
                      placeholder='URL (optional)'
                      className='flex-1 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    />
                    <button
                      type='button'
                      onClick={() => analyzeUrl(index, section.url)}
                      disabled={!section.url || analyzingIndexes.has(index)}
                      className='px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {analyzingIndexes.has(index) ? '...' : '✨ Analyze'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={state.isSaving || !state.title}
              className='w-full px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50'
            >
              {state.isSaving ? 'Saving...' : 'Save Newsletter'}
            </button>
          </div>
        ) : (
          <div className='bg-white dark:bg-zinc-900 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800'>
            <h2 className='text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-6'>
              {state.title || 'Untitled Newsletter'}
            </h2>
            <div className='space-y-6'>
              \n{' '}
              {state.sections.map((section) => (
                <div
                  key={
                    section.title
                      ? `preview-${section.type}-${section.title}`
                      : `preview-new-${state.sections.indexOf(section)}`
                  }
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
                        {section.title || 'Untitled'}
                      </h3>
                      {section.description && (
                        <p className='text-zinc-600 dark:text-zinc-400 mb-2 text-[15px] leading-[1.5]'>
                          {truncateText(section.description)}
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
