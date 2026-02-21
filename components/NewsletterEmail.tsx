import { NewsletterSection } from '@/types/database';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Section,
  Text
} from '@react-email/components';
import * as React from 'react';

interface NewsletterEmailProps {
  title: string;
  content: NewsletterSection[];
  unsubscribeUrl: string;
  issueNumber?: string;
}

export function NewsletterEmail({
  title,
  content,
  unsubscribeUrl,
  issueNumber
}: NewsletterEmailProps) {
  // Extract date from title or use current date
  const getFormattedDate = () => {
    const dateMatch = title.match(/(\w+ \d+, \d{4})/);
    if (dateMatch) {
      const date = new Date(dateMatch[1]);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      });
    }
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  // Separate hero story (first text section) from other articles
  const heroStory = content.find((s) => s.type === 'text');
  const articles = content.filter((s) => s.type === 'article');

  // Parse hero story description for subtitle and why it matters
  const parseHeroDescription = (desc: string) => {
    const parts = desc.split('\n\n');
    const subtitle = parts[0] || '';
    const whyItMatters =
      parts[1]?.replace('**Why it matters:**', '').trim() || '';
    return { subtitle, whyItMatters };
  };

  // Extract category from article description
  const extractCategory = (desc: string) => {
    const match = desc.match(/\*Category: ([^*]+)\*/);
    return match ? match[1].trim() : null;
  };

  // Get category badge color
  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      React: '#61dafb',
      CSS: '#264de4',
      JavaScript: '#f7df1e',
      Tooling: '#8b5cf6',
      AI: '#10b981',
      Performance: '#f59e0b',
      Design: '#ec4899'
    };
    return colors[category || ''] || '#6b7280';
  };

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='316' height='88' viewBox='0 0 3162 879'%3E%3Cg transform='scale(8.108) translate(10, 10)'%3E%3Cg transform='matrix(0.0326,0,0,0.0326,6.136,32.137)' fill='%233e8dc8'%3E%3Cpath d='M893.3,160.7c0,88.7-72,160.9-160.7,161.2v-0.5h-0.5v-0.5h-0.5v0.5h0.5v0.5h0.5v0h-0.5c-88.9,0-161.2-72.3-161.2-161.2c0-88.9,72.3-161.2,161.2-161.2S893.3,71.8,893.3,160.7z'/%3E%3Ccircle cx='160.7' cy='160.7' r='72'/%3E%3Cellipse transform='matrix(0.7071 -0.7071 0.7071 0.7071 4.0354 331.1821)' cx='401.8' cy='160.7' rx='116.6' ry='116.6'/%3E%3Ccircle cx='1062.5' cy='160.7' r='116.6'/%3E%3Cellipse transform='matrix(0.9871 -0.1602 0.1602 0.9871 -8.9104 210.8861)' cx='1303.6' cy='160.7' rx='71.9' ry='71.9'/%3E%3Cellipse transform='matrix(0.7071 -0.7071 0.7071 0.7071 -237.0375 231.3207)' cx='160.7' cy='401.8' rx='116.6' ry='116.6'/%3E%3Cellipse transform='matrix(0.2298 -0.9732 0.9732 0.2298 -90.6223 778.3138)' cx='446.4' cy='446.4' rx='71.9' ry='71.9'/%3E%3Cellipse transform='matrix(0.7071 -0.7071 0.7071 0.7071 -132.8 661.5322)' cx='732.1' cy='491.1' rx='116.6' ry='116.6'/%3E%3Cellipse transform='matrix(0.1602 -0.9871 0.9871 0.1602 414.154 1379.5999)' cx='1017.8' cy='446.4' rx='71.9' ry='72'/%3E%3Ccircle cx='1303.6' cy='401.8' r='116.6'/%3E%3Cpath d='M321.9,732.1c0,88.7-72,160.9-160.7,161.2v-0.5h-0.5v-0.5h-0.5v0.5h0.5v0.5h0.5v0h-0.5C71.8,893.4-0.5,821-0.5,732.1c0-88.9,72.3-161.2,161.2-161.2S321.9,643.2,321.9,732.1z'/%3E%3Cellipse transform='matrix(0.2298 -0.9732 0.9732 0.2298 -334.3244 1041.8427)' cx='491' cy='732.1' rx='116.6' ry='116.6'/%3E%3Cellipse transform='matrix(0.1602 -0.9871 0.9871 0.1602 -107.7927 1337.5253)' cx='732.1' cy='732.1' rx='71.9' ry='71.9'/%3E%3Cellipse transform='matrix(0.7071 -0.7071 0.7071 0.7071 -232.6544 902.6021)' cx='973.2' cy='732.1' rx='116.6' ry='116.6'/%3E%3Cellipse transform='matrix(0.7071 -0.7071 0.7071 0.7071 -135.9015 1136.2052)' cx='1303.6' cy='732.2' rx='161.2' ry='161.2'/%3E%3Ccircle cx='160.7' cy='1062.5' r='116.6'/%3E%3Ccircle cx='446.4' cy='1017.8' r='71.9'/%3E%3Cpath d='M848.7,973.2c0,64.3-52.3,116.5-116.6,116.5c-64.3,0-116.6-52.3-116.6-116.5c0-64.3,52.3-116.6,116.6-116.6S848.7,908.9,848.7,973.2z'/%3E%3Ccircle cx='1017.8' cy='1017.8' r='72'/%3E%3Ccircle cx='1303.6' cy='1062.5' r='116.6'/%3E%3Ccircle cx='160.7' cy='1303.5' r='72'/%3E%3Cellipse transform='matrix(0.7071 -0.7071 0.7071 0.7071 -804.0676 665.9094)' cx='401.8' cy='1303.6' rx='116.6' ry='116.6'/%3E%3Ccircle cx='732.1' cy='1303.6' r='161.2'/%3E%3Ccircle cx='1062.5' cy='1303.5' r='116.6'/%3E%3Cellipse transform='matrix(0.7071 -0.7071 0.7071 0.7071 -539.9423 1303.5642)' cx='1303.6' cy='1303.6' rx='71.9' ry='71.9'/%3E%3C/g%3E%3Cg transform='matrix(4.157,0,0,4.157,68.055,5.102)' fill='%233e8dc8'%3E%3Cpath d='M1.791,6.043h2.901v1.845h-3.168l0.548,0.401v2.901h1.845v1.845h-2.393l0.548,0.414v6.591h-1.604V7.366c0-0.749,0.575-1.324,1.324-1.324z M4.719,20.053v-8.382l-0.334-0.414h3.209c0.735,0,1.31,0.575,1.31,1.324v0.508h-3.128l0.548,0.414v6.551h-1.604z M10.348,13.035l0.548,0.401v4.719h1.818v-5.12h-2.366z M14.318,12.513v6.163c0,0.709-0.615,1.324-1.324,1.324h-2.38c-0.749,0-1.324-0.615-1.324-1.324v-6.163c0-0.749,0.575-1.324,1.324-1.324h2.38c0.749,0,1.324,0.615,1.324,1.324z M15.12,19.987v-8.382l-0.334-0.414h4.037c0.709,0,1.324,0.575,1.324,1.324v7.473h-1.604v-6.965h-2.366l0.548,0.414v6.551h-1.604z M21.992,13.075l0.548,0.401v4.679h2.58v1.818h-2.861c-0.735,0-1.31-0.575-1.31-1.31V7.982h1.591v3.262h1.805v1.818h-2.353z M28.57,14.051h-2.914v-2.112h2.914v2.112z M30.241,13.048l0.548,0.414v1.417h1.818v-1.832h-2.366z M30.508,11.217h2.38c0.735,0,1.31,0.575,1.31,1.324v2.861c0,0.749-0.575,1.324-1.31,1.324h-2.099v1.457h3.409v0.521c0,0.735-0.575,1.31-1.31,1.31h-2.38c-0.749,0-1.324-0.575-1.324-1.31v-6.163c0-0.749,0.575-1.324,1.324-1.324z M34.88,19.987v-8.382l-0.334-0.414h4.037c0.709,0,1.324,0.575,1.324,1.324v7.473h-1.604v-6.965h-2.366l0.548,0.414v6.551h-1.604z M41.751,12.995l0.548,0.414v4.733h1.832v-5.147h-2.38z M42.019,11.15h2.112V6.404l-0.334-0.414h1.939v13.997h-3.717c-0.749,0-1.324-0.575-1.324-1.324v-6.19c0-0.749,0.575-1.324,1.324-1.324z M50.989,13.008l0.548,0.414v4.733h1.832v-5.147h-2.38z M54.973,12.487v6.203c0,0.709-0.575,1.324-1.324,1.324h-3.73V6.431l-0.334-0.414h1.952v5.147h2.112c0.749,0,1.324,0.575,1.324,1.324z M55.789,20.053v-8.382l-0.334-0.414h3.209c0.735,0,1.31,0.575,1.31,1.324v0.508h-3.128l0.548,0.414v6.551h-1.604z M61.939,19.947h-1.578v-8.275l-0.334-0.401h1.912v8.676z M61.939,8.556v1.805h-1.578V8.556h1.578z M63.757,13.048l0.548,0.414v1.417h1.818v-1.832h-2.366z M64.024,11.217h2.38c0.735,0,1.31,0.575,1.31,1.324v2.861c0,0.749-0.575,1.324-1.31,1.324h-2.099v1.457h3.409v0.521c0,0.735-0.575,1.31-1.31,1.31h-2.38c-0.749,0-1.324-0.575-1.324-1.31v-6.163c0-0.749,0.575-1.324,1.324-1.324z M69.733,6.043h2.901v1.845h-3.168l0.548,0.401v2.901h1.845v1.845h-2.393l0.548,0.414v6.591h-1.604V7.366c0-0.749,0.575-1.324,1.324-1.324z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"
              alt='Front-end Brief'
              height='40'
              style={{
                width: 'auto',
                margin: '0 auto 16px',
                display: 'block'
              }}
            />
            <Text style={brandSubtitle}>
              The weekly brief for modern front-end developers.
            </Text>
            {issueNumber && (
              <Text style={issueText}>
                Issue #{issueNumber} — {getFormattedDate()}
              </Text>
            )}
          </Section>

          <Section style={contentDivider} />

          {/* Hero Story */}
          {heroStory &&
            (() => {
              const { subtitle, whyItMatters } = parseHeroDescription(
                heroStory.description || ''
              );
              return (
                <Section style={heroSection}>
                  <Text style={heroLabel}>Featured Story</Text>
                  <Heading as='h2' style={heroTitle}>
                    {heroStory.title}
                  </Heading>
                  <Text style={heroSubtitle}>{subtitle}</Text>

                  {whyItMatters && (
                    <>
                      <Text style={whyMattersLabel}>Why it matters</Text>
                      <Text style={whyMattersText}>{whyItMatters}</Text>
                    </>
                  )}

                  {heroStory.url && (
                    <Link href={heroStory.url} style={heroCta}>
                      Read the full article →
                    </Link>
                  )}
                </Section>
              );
            })()}

          {/* Divider */}
          <Section style={{ padding: '30px 40px' }}>
            <Hr style={divider} />
          </Section>

          {/* Articles */}
          <Section style={{ padding: '0 40px 20px' }}>
            <Heading as='h3' style={articlesHeading}>
              This Week&apos;s Articles
            </Heading>
          </Section>

          {articles.map((article) => {
            const category = extractCategory(article.description || '');
            const summary = article.description?.split('\n')[0] || '';
            const source =
              article.description?.match(/\*Source: ([^*]+)\*/)?.[1] || '';

            return (
              <Section key={`${article.type}-${article.title}`} style={articleSection}>
                {category && (
                  <table width='100%' cellPadding='0' cellSpacing='0'>
                    <tr>
                      <td>
                        <Text
                          style={{
                            ...categoryBadge,
                            backgroundColor: getCategoryColor(category)
                          }}
                        >
                          {category}
                        </Text>
                      </td>
                    </tr>
                  </table>
                )}

                <Heading as='h4' style={articleTitle}>
                  {article.title}
                </Heading>

                <Text style={articleSummary}>{summary}</Text>

                <table width='100%' cellPadding='0' cellSpacing='0'>
                  <tr>
                    <td>
                      {source && (
                        <Text style={articleSource}>Source: {source}</Text>
                      )}
                    </td>
                    <td align='right'>
                      {article.url && (
                        <Link href={article.url} style={articleCta}>
                          Read →
                        </Link>
                      )}
                    </td>
                  </tr>
                </table>
              </Section>
            );
          })}

          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this because you subscribed to Front-end
              Brief.
            </Text>
            <Link href={unsubscribeUrl} style={unsubscribeLink}>
              Unsubscribe
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  backgroundColor: '#fafafa',
  margin: 0,
  padding: '40px 20px'
};

const container = {
  maxWidth: '600px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  overflow: 'hidden',
  margin: '0 auto'
};

const header = {
  padding: '40px 40px 40px',
  backgroundColor: '#18181b',
  textAlign: 'center' as const
};

const brandSubtitle = {
  margin: '0 0 16px',
  fontSize: '16px',
  fontWeight: '400',
  color: 'rgba(255, 255, 255, 0.8)',
  lineHeight: '1.4'
};

const issueText = {
  margin: '0',
  fontSize: '14px',
  fontWeight: '500',
  color: 'rgba(255, 255, 255, 0.6)',
  lineHeight: '1.4'
};

const contentDivider = {
  height: '1px',
  backgroundColor: '#27272a',
  margin: '0'
};

const heroSection = {
  padding: '40px 40px',
  backgroundColor: '#fafafa'
};

const heroLabel = {
  margin: '0 0 8px',
  fontSize: '12px',
  fontWeight: '600',
  color: '#3b82f6',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em'
};

const heroTitle = {
  margin: '0 0 12px',
  fontSize: '28px',
  fontWeight: 'bold',
  lineHeight: '1.3',
  color: '#18181b'
};

const heroSubtitle = {
  margin: '0 0 20px',
  fontSize: '18px',
  lineHeight: '1.5',
  color: '#52525b',
  fontWeight: '400'
};

const whyMattersLabel = {
  margin: '0 0 8px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#18181b'
};

const whyMattersText = {
  margin: '0 0 20px',
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#52525b',
  fontStyle: 'italic' as const
};

const heroCta = {
  display: 'inline-block',
  padding: '12px 24px',
  backgroundColor: '#18181b',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: '500'
};

const divider = {
  borderColor: '#e4e4e7',
  margin: '0'
};

const articlesHeading = {
  margin: '0 0 20px',
  fontSize: '22px',
  fontWeight: 'bold',
  color: '#18181b'
};

const articleSection = {
  padding: '20px 40px',
  borderBottom: '1px solid #f4f4f5'
};

const categoryBadge = {
  display: 'inline-block',
  padding: '4px 10px',
  fontSize: '11px',
  fontWeight: '600',
  color: '#ffffff',
  borderRadius: '4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: '0 0 12px'
};

const articleTitle = {
  margin: '0 0 10px',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '1.4',
  color: '#18181b'
};

const articleSummary = {
  margin: '0 0 12px',
  fontSize: '15px',
  lineHeight: '1.5',
  color: '#52525b'
};

const articleSource = {
  margin: '0',
  fontSize: '13px',
  color: '#a1a1aa',
  fontStyle: 'italic' as const
};

const articleCta = {
  display: 'inline-block',
  color: '#3b82f6',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500'
};

const footer = {
  padding: '30px 40px',
  backgroundColor: '#fafafa',
  textAlign: 'center' as const
};

const footerText = {
  margin: '0 0 10px',
  fontSize: '14px',
  color: '#71717a'
};

const unsubscribeLink = {
  color: '#71717a',
  fontSize: '14px',
  textDecoration: 'underline'
};
