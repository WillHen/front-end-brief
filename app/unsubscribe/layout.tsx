import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unsubscribe - Front-end Brief',
  description: 'Unsubscribe from the Front-end Brief newsletter.'
};

export default function UnsubscribeLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
