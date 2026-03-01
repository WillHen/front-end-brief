import { NewsletterSection } from '@/types/database';

interface SectionEditorProps {
  section: NewsletterSection;
  index: number;
  onUpdate: (index: number, field: keyof NewsletterSection, value: string) => void;
  onRemove: (index: number) => void;
  onAnalyzeUrl?: (index: number, url: string | undefined) => void;
  isAnalyzing?: boolean;
}

export default function SectionEditor({
  section,
  index,
  onUpdate,
  onRemove,
  onAnalyzeUrl,
  isAnalyzing = false
}: SectionEditorProps) {
  return (
    <div className='mb-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg'>
      <div className='flex justify-between items-start mb-3'>
        <select
          value={section.type}
          onChange={(e) => onUpdate(index, 'type', e.target.value)}
          className='px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
        >
          <option value='article'>📚 Article</option>
          <option value='tip'>💡 Tip</option>
          <option value='tool'>🛠️ Tool</option>
          <option value='text'>✍️ Text</option>
        </select>
        <button
          onClick={() => onRemove(index)}
          className='text-red-600 hover:text-red-800 text-sm'
        >
          Remove
        </button>
      </div>
      <input
        type='text'
        value={section.title}
        onChange={(e) => onUpdate(index, 'title', e.target.value)}
        placeholder='Section title'
        className='w-full px-3 py-2 mb-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
      />
      <textarea
        value={section.description}
        onChange={(e) => onUpdate(index, 'description', e.target.value)}
        placeholder='Description'
        rows={3}
        className='w-full px-3 py-2 mb-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
      />
      {onAnalyzeUrl ? (
        <div className='flex gap-2'>
          <input
            type='url'
            value={section.url}
            onChange={(e) => onUpdate(index, 'url', e.target.value)}
            placeholder='URL (optional)'
            className='flex-1 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
          />
          <button
            type='button'
            onClick={() => onAnalyzeUrl(index, section.url)}
            disabled={!section.url || isAnalyzing}
            className='px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isAnalyzing ? '...' : '✨ Analyze'}
          </button>
        </div>
      ) : (
        <input
          type='url'
          value={section.url}
          onChange={(e) => onUpdate(index, 'url', e.target.value)}
          placeholder='URL (optional)'
          className='w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
        />
      )}
    </div>
  );
}
