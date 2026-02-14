import { http, HttpResponse, delay } from 'msw';
import newslettersData from './data/newsletters.json';
import subscribersData from './data/subscribers.json';

export const handlers = [
  // Admin newsletters - GET
  http.get('/api/admin/newsletters', () => {
    return HttpResponse.json(newslettersData);
  }),

  // Admin newsletters - POST (create)
  http.post('/api/admin/newsletters', async ({ request }) => {
    const body = (await request.json()) as {
      title: string;
      content: unknown;
    };
    const newNewsletter = {
      id: `test-newsletter-${Date.now()}`,
      title: body.title,
      content: body.content,
      status: 'draft',
      created_at: new Date().toISOString(),
      sent_at: null,
      updated_at: new Date().toISOString()
    };
    return HttpResponse.json(newNewsletter, { status: 201 });
  }),

  // Admin newsletters - PUT (update)
  http.put('/api/admin/newsletters/:id', async ({ request, params }) => {
    const body = (await request.json()) as {
      title?: string;
      content?: unknown;
    };
    const newsletter = newslettersData.find((n) => n.id === params.id);

    if (!newsletter) {
      return HttpResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    const updated = {
      ...newsletter,
      title: body.title ?? newsletter.title,
      content: body.content ?? newsletter.content,
      updated_at: new Date().toISOString()
    };
    return HttpResponse.json(updated);
  }),

  // Admin newsletters - DELETE
  http.delete('/api/admin/newsletters/:id', ({ params }) => {
    const newsletter = newslettersData.find((n) => n.id === params.id);

    if (!newsletter) {
      return HttpResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ success: true });
  }),

  // Admin auth
  http.post('/api/admin/auth', async ({ request }) => {
    const body = await request.json();

    if ((body as { password?: string }).password === 'test-password') {
      return HttpResponse.json({ success: true });
    }

    return HttpResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }),

  // Subscribe
  http.post('/api/subscribe', async ({ request }) => {
    await delay(100); // Add delay to simulate network request

    const body = await request.json();
    const email = (body as { email?: string }).email;

    if (!email) {
      return HttpResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if already subscribed
    const existing = subscribersData.find((s) => s.email === email);
    if (existing) {
      return HttpResponse.json(
        { error: 'Already subscribed' },
        { status: 400 }
      );
    }

    const newSubscriber = {
      id: `test-subscriber-${Date.now()}`,
      email,
      subscribed_at: new Date().toISOString(),
      is_active: true
    };

    return HttpResponse.json(newSubscriber, { status: 201 });
  }),

  // Unsubscribe
  http.post('/api/unsubscribe', async ({ request }) => {
    const body = await request.json();
    const email = (body as { email?: string }).email;

    const subscriber = subscribersData.find((s) => s.email === email);

    if (!subscriber) {
      return HttpResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ success: true });
  }),

  // Send newsletter
  http.post('/api/admin/send', async ({ request }) => {
    const body = await request.json();
    const newsletterId = (body as { newsletterId?: string }).newsletterId;

    const newsletter = newslettersData.find((n) => n.id === newsletterId);

    if (!newsletter) {
      return HttpResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      sent: subscribersData.filter((s) => s.is_active).length
    });
  })
];
