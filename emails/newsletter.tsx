import { NewsletterEmail } from '../components/NewsletterEmail';

export default function NewsletterPreview() {
  return (
    <NewsletterEmail
      title='Front-end Brief - Week of Feb 14, 2026'
      issueNumber='12'
      content={[
        // Hero Story (text type)
        {
          type: 'text',
          title: 'React 19 Brings Major Performance Wins and New Hooks',
          description:
            'The React team unveils their most ambitious release yet, with automatic batching improvements and the new useOptimistic hook\n\n**Why it matters:** React 19 fundamentally changes how we handle async state and optimistic updates, eliminating common boilerplate patterns that developers have relied on for years. The new compiler optimizations mean less manual memoization and faster apps out of the box, which could reshape best practices across the entire React ecosystem.',
          url: 'https://react.dev/blog/2024/04/25/react-19'
        },
        // Articles
        {
          type: 'article',
          title: 'View Transitions API Now Supported in All Major Browsers',
          description:
            'Native browser support for smooth page transitions without JavaScript libraries. Chrome, Safari, and Firefox now offer built-in animation capabilities for SPA navigation.\n\n*Source: web.dev*\n*Category: CSS*',
          url: 'https://web.dev/articles/view-transitions'
        },
        {
          type: 'article',
          title: 'Vercel Launches AI SDK 3.0 with Streaming Support',
          description:
            'New SDK simplifies integrating AI models into Next.js apps with built-in streaming, rate limiting, and multi-model support for OpenAI, Anthropic, and more.\n\n*Source: Vercel Blog*\n*Category: Tooling*',
          url: 'https://vercel.com/blog/introducing-ai-sdk-3-0'
        },
        {
          type: 'article',
          title: 'Scroll-Driven Animations Land in Baseline 2024',
          description:
            'Create parallax effects and scroll-triggered animations purely with CSS using @scroll-timeline and animation-timeline properties.\n\n*Source: MDN Web Docs*\n*Category: CSS*',
          url: 'https://developer.mozilla.org/en-US/blog/scroll-driven-animations/'
        },
        {
          type: 'article',
          title: 'Web Components: A Complete Introduction for React Developers',
          description:
            'Understanding the native web component standard and when to use it alongside or instead of framework-specific components.\n\n*Source: CSS-Tricks*\n*Category: JavaScript*',
          url: 'https://css-tricks.com/an-introduction-to-web-components/'
        },
        {
          type: 'article',
          title: 'TypeScript 5.4 Adds NoInfer Utility Type',
          description:
            'The new NoInfer utility helps prevent unwanted type inference in generic functions, giving developers more control over type narrowing.\n\n*Source: TypeScript Blog*\n*Category: JavaScript*',
          url: 'https://devblogs.microsoft.com/typescript/'
        }
      ]}
      unsubscribeUrl='http://localhost:3000/unsubscribe?email=test@example.com'
    />
  );
}
