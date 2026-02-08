import { NewsletterEmail } from '@/components/NewsletterEmail';

export default function NewsletterPreview() {
  return (
    <NewsletterEmail
      title="Front-end Brief - Week of Feb 2, 2026"
      content={[
        {
          type: 'article',
          title: 'Cache components in Next.js: Faster pages with partial pre-rendering',
          description:
            'Cache components change how rendering decisions are made in Next.js, allowing static and dynamic UI to coexist on the same page without blocking the initial render.',
          url: 'https://example.com/article-1'
        },
        {
          type: 'tip',
          title: 'CSS Grid Tips for 2026',
          description:
            'Master modern CSS Grid with these practical tips for building responsive layouts.',
          url: 'https://example.com/article-2'
        },
        {
          type: 'tool',
          title: 'Vite 6.0 Released',
          description:
            'The latest version brings incredible performance improvements and new features.',
          url: 'https://example.com/tool-1'
        }
      ]}
      unsubscribeUrl="http://localhost:3000/unsubscribe?email=test@example.com"
    />
  );
}
