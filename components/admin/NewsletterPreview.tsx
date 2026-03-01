import { NewsletterSection } from '@/types/database';

interface NewsletterPreviewProps {
  title: string;
  sections: NewsletterSection[];
}

const SECTION_ICONS: Record<string, string> = {
  article: '📚',
  tip: '💡',
  tool: '🛠️',
  text: '✍️'
};

const truncateText = (text: string, maxLength: number = 350): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export default function NewsletterPreview({
  title,
  sections
}: NewsletterPreviewProps) {
  return (
    <div className='bg-white dark:bg-zinc-900 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800'>
      <h2 className='text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-6'>
        {title || 'Untitled Newsletter'}
      </h2>
      <div className='space-y-6'>
        {sections.map((section) => (
          <div
            key={
              section.title
                ? `preview-${section.type}-${section.title}`
                : `preview-new-${sections.indexOf(section)}`
            }
            className='border-b border-zinc-200 dark:border-zinc-800 pb-6'
          >
            <div className='flex items-start gap-3'>
              <div className='text-2xl'>{SECTION_ICONS[section.type]}</div>
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
  );
}
