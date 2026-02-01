export interface Subscriber {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  unsubscribe_token: string;
  subscribed_at: string;
  updated_at: string;
}

export interface NewsletterSection {
  type: 'article' | 'tip' | 'tool' | 'text';
  title: string;
  description?: string;
  url?: string;
}

export interface Newsletter {
  id: string;
  title: string;
  content: NewsletterSection[];
  status: 'draft' | 'sent';
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}
