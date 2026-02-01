# Front-end Brief

A newsletter platform for front-end developers to stay updated with the latest articles, tools, and insights in web development.

## Features

- **Email Signup**: Simple newsletter subscription with email validation
- **Newsletter Archive**: Browse and read past newsletters
- **Admin Interface**: Password-protected admin panel to create, edit, preview, and send newsletters
- **Email Templates**: Professional, responsive email templates using React Email
- **Unsubscribe**: Token-based unsubscribe functionality
- **Database Storage**: Supabase for subscriber and newsletter management
- **Email Delivery**: Resend for reliable email sending

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Email Service**: Resend
- **Email Templates**: React Email

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API to find your:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret!)
3. Go to SQL Editor and run the schema from `supabase/schema.sql`

### 3. Set Up Resend

1. Create an account at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Create an audience (optional but recommended)
4. Verify your domain or use their test domain for development

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your actual values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend
RESEND_API_KEY=your-resend-api-key
RESEND_AUDIENCE_ID=your-audience-id  # Optional

# Admin
ADMIN_PASSWORD=your-secure-password

# App URL (for unsubscribe links)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Update for production
```

### 5. Update Email Sender

Edit `app/api/admin/send/route.ts` and update the `from` field with your verified domain:

```typescript
from: 'Front-end Brief <newsletter@yourdomain.com>',
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### Public Pages

- **Home** (`/`): Landing page with email signup form
- **Newsletters** (`/newsletters`): Browse past newsletters
- **Newsletter Detail** (`/newsletters/[id]`): Read individual newsletter
- **Unsubscribe** (`/unsubscribe?token=...`): Unsubscribe from newsletter

### Admin Panel

1. Navigate to `/admin`
2. Enter the password you set in `.env.local`
3. Create, edit, preview, and send newsletters

### Creating a Newsletter

1. Go to `/admin`
2. Click "Create New"
3. Add a title (e.g., "Front-end Brief - Week of Feb 1, 2026")
4. Add content sections:
   - **Article**: 📚 For blog posts and articles
   - **Tip**: 💡 For quick tips and best practices
   - **Tool**: 🛠️ For new tools and libraries
   - **Text**: ✍️ For custom text content
5. Preview your newsletter
6. Save as draft
7. When ready, click "Send" to send to all active subscribers

## Database Schema

### Subscribers Table

- `id`: UUID (primary key)
- `email`: Subscriber email (unique)
- `status`: 'active' | 'unsubscribed'
- `unsubscribe_token`: UUID for unsubscribe links
- `subscribed_at`: Timestamp
- `updated_at`: Timestamp

### Newsletters Table

- `id`: UUID (primary key)
- `title`: Newsletter title
- `content`: JSONB array of sections
- `status`: 'draft' | 'sent'
- `sent_at`: Timestamp (when sent)
- `created_at`: Timestamp
- `updated_at`: Timestamp

## API Routes

- `POST /api/subscribe`: Subscribe to newsletter
- `POST /api/unsubscribe`: Unsubscribe from newsletter
- `GET /api/admin/newsletters`: List all newsletters
- `POST /api/admin/newsletters`: Create new newsletter
- `PUT /api/admin/newsletters`: Update newsletter
- `POST /api/admin/send`: Send newsletter to subscribers

## Future Enhancements

- AI agent for content discovery from front-end blogs
- AI agent for content verification and quality checks
- User preferences and topic selection
- Analytics and engagement tracking
- Scheduled sending
- A/B testing for subject lines
- RSS feed integration

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Don't forget to update:

- `NEXT_PUBLIC_APP_URL`: Your production domain
- Email `from` address in send route

## License

MIT
