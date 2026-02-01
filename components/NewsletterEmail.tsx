import { NewsletterSection } from '@/types/database';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Section,
  Text
} from '@react-email/components';
import * as React from 'react';

interface NewsletterEmailProps {
  title: string;
  content: NewsletterSection[];
  unsubscribeUrl: string;
}

export function NewsletterEmail({
  title,
  content,
  unsubscribeUrl
}: NewsletterEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>Front-end Brief</Heading>
          </Section>

          <Section style={titleSection}>
            <Heading style={newsletterTitle}>{title}</Heading>
          </Section>

          {content.map((section, index) => (
            <Section key={index} style={contentSection}>
              <table width='100%' cellPadding='0' cellSpacing='0'>
                <tr>
                  <td width='40' style={iconCell}>
                    {section.type === 'article' && '📚'}
                    {section.type === 'tip' && '💡'}
                    {section.type === 'tool' && '🛠️'}
                    {section.type === 'text' && '✍️'}
                  </td>
                  <td>
                    <Heading as='h3' style={sectionTitle}>
                      {section.title}
                    </Heading>
                    {section.description && (
                      <Text style={sectionDescription}>
                        {section.description}
                      </Text>
                    )}
                    {section.url && (
                      <Link href={section.url} style={sectionLink}>
                        Read more →
                      </Link>
                    )}
                  </td>
                </tr>
              </table>
            </Section>
          ))}

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
  padding: '40px 40px 20px',
  backgroundColor: '#18181b'
};

const headerTitle = {
  margin: 0,
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#ffffff'
};

const titleSection = {
  padding: '0 40px 40px',
  backgroundColor: '#18181b'
};

const newsletterTitle = {
  margin: 0,
  fontSize: '28px',
  fontWeight: 'bold',
  lineHeight: '1.3',
  color: '#ffffff'
};

const contentSection = {
  padding: '30px 40px',
  borderBottom: '1px solid #e4e4e7'
};

const iconCell = {
  paddingRight: '16px',
  fontSize: '24px',
  verticalAlign: 'top'
};

const sectionTitle = {
  margin: '0 0 12px',
  fontSize: '20px',
  fontWeight: '600',
  color: '#18181b'
};

const sectionDescription = {
  margin: '0 0 12px',
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#52525b'
};

const sectionLink = {
  display: 'inline-block',
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '500',
  textDecoration: 'none'
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
