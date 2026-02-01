'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Newsletter, NewsletterSection } from '@/types/database';

export default function EditNewsletterPage() {
  const router = useRouter();
  const params = useParams();
  const newsletterId = params.id as string;

  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({
    title: '',
    sections: [] as NewsletterSection[],
    isPreview: false,
    isSaving: false,
    isDeleting: false,
    message: ''
  });

  useEffect(() => {
    loadNewsletter();
  }, [newsletterId]);

  const loadNewsletter = async () => {
    try {
      const response = await fetch('/api/admin/newsletters');
      const data = await response.json();
      const found = data.find((n: Newsletter) => n.id === newsletterId);
      
      if (found) {
        setNewsletter(found);
        setState(prev => ({
          ...prev,
          title: found.title,
          sections: found.content
        }));
      } else {
        setState(prev => ({ ...prev, message: 'Newsletter not found' }));
      }
    } catch (err) {
      console.error('Failed to load newsletter:', err);
      setState(prev => ({ ...prev, message: 'Error loading newsletter' }));
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    setState(prev => ({
      ...prev,
      sections: [...prev.sections, { type: 'article', title: '', description: '', url: '' }]
    }));
  };

  const updateSection = (index: number, field: keyof NewsletterSection, value: string) => {
    setState(prev => {
      const updated = [...prev.sections];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, sections: updated };
    });
  };

  const removeSection = (index: number) => {
    setState(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setState(prev => ({ ...prev, isSaving: true, message: '' }));

    try {
      const response = await fetch('/api/admin/newsletters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newsletterId, title: state.title, content: state.sections }),
      });

      if (response.ok) {
        setState(prev => ({ ...prev, message: 'Newsletter updated successfully!' }));
        setTimeout(() => router.push('/admin'), 1500);
      } else {
        setState(prev => ({ ...prev, message: 'Failed to update newsletter' }));
      }
    } catch {
      setState(prev => ({ ...prev, message: 'Error updating newsletter' }));
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this newsletter?')) return;

    setState(prev => ({ ...prev, isDeleting: true, message: '' }));

    try {
      const response = await fetch('/api/admin/newsletters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newsletterId }),
      });

      if (response.ok) {
        setState(prev => ({ ...prev, message: 'Newsletter deleted successfully!' }));
        setTimeout(() => router.push('/admin'), 1500);
      } else {
        setState(prev => ({ ...prev, message: 'Failed to delete newsletter' }));
      }
    } catch {
      setState(prev => ({ ...prev, message: 'Error deleting newsletter' }));
    } finally {
      setState(prev => ({ ...prev, isDeleting: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!newsletter) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-900 dark:text-zinc-100 mb-4">Newsletter not found</p>
          <Link
            href="/admin"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Back to List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
        <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Edit Newsletter
          </h1>
          <Link
            href="/admin"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Back to List
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {state.message && (
          <div className="mb-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100">
            {state.message}
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setState(prev => ({ ...prev, isPreview: false }))}
            className={`px-4 py-2 rounded-lg font-medium ${
              !state.isPreview
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setState(prev => ({ ...prev, isPreview: true }))}
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
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                Newsletter Title
              </label>
              <input
                type="text"
                value={state.title}
                onChange={(e) => setState(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Front-end Brief - Week of Feb 1, 2026"
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Content Sections
                </h3>
                <button
                  onClick={addSection}
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium"
                >
                  + Add Section
                </button>
              </div>

              {state.sections.map((section, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-3">
                    <select
                      value={section.type}
                      onChange={(e) => updateSection(index, 'type', e.target.value)}
                      className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="article">📚 Article</option>
                      <option value="tip">💡 Tip</option>
                      <option value="tool">🛠️ Tool</option>
                      <option value="text">✍️ Text</option>
                    </select>
                    <button
                      onClick={() => removeSection(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(index, 'title', e.target.value)}
                    placeholder="Section title"
                    className="w-full px-3 py-2 mb-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                  <textarea
                    value={section.description}
                    onChange={(e) => updateSection(index, 'description', e.target.value)}
                    placeholder="Description"
                    rows={3}
                    className="w-full px-3 py-2 mb-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                  <input
                    type="url"
                    value={section.url}
                    onChange={(e) => updateSection(index, 'url', e.target.value)}
                    placeholder="URL (optional)"
                    className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={state.isSaving || !state.title}
                className="flex-1 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
              >
                {state.isSaving ? 'Saving...' : 'Update Newsletter'}
              </button>
              <button
                onClick={handleDelete}
                disabled={state.isDeleting}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {state.isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
              {state.title || 'Untitled Newsletter'}
            </h2>
            <div className="space-y-6">
              {state.sections.map((section, index) => (
                <div key={index} className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">
                      {section.type === 'article' && '📚'}
                      {section.type === 'tip' && '💡'}
                      {section.type === 'tool' && '🛠️'}
                      {section.type === 'text' && '✍️'}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                        {section.title || 'Untitled'}
                      </h3>
                      {section.description && (
                        <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                          {section.description}
                        </p>
                      )}
                      {section.url && (
                        <a href={section.url} className="text-zinc-900 dark:text-zinc-100 hover:underline">
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
