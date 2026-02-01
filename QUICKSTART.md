# Quick Start Guide

Get Front-end Brief running in 5 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `supabase/schema.sql`
4. Click "Run" to create the tables

## 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Get these from Supabase Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Get this from Resend dashboard
RESEND_API_KEY=re_your_resend_api_key
RESEND_AUDIENCE_ID=your-audience-id  # Optional

# Set a secure password for admin access
ADMIN_PASSWORD=your-secure-admin-password

# Leave as is for local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Update Email Sender (Important!)

Open `app/api/admin/send/route.ts` and find line 80:

```typescript
from: 'Front-end Brief <newsletter@yourdomain.com>',
```

**For Development:** Change to:

```typescript
from: 'Front-end Brief <onboarding@resend.dev>',
```

**For Production:** Use your verified domain email

## 5. Update Admin Password

Open `app/admin/page.tsx` and find line 52:

```typescript
const adminPassword = 'changeme'; // TODO: Replace with your password
```

Change `'changeme'` to match what you set in `.env.local`

## 6. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 7. Test Everything

### Test Public Pages

1. ✅ Visit homepage - should see landing page
2. ✅ Enter your email and subscribe
3. ✅ Check Supabase dashboard for new subscriber

### Test Admin Panel

1. ✅ Visit [http://localhost:3000/admin](http://localhost:3000/admin)
2. ✅ Login with your admin password
3. ✅ Click "Create New"
4. ✅ Add a title: "Test Newsletter"
5. ✅ Click "+ Add Section"
6. ✅ Fill in section details
7. ✅ Click "Preview" tab to see how it looks
8. ✅ Click "Save Newsletter"

### Test Email Sending (Optional)

1. ⚠️ Make sure you have at least one subscriber (yourself)
2. ⚠️ Make sure email sender is configured correctly
3. ✅ In admin, click "Send" on your draft newsletter
4. ✅ Confirm the send
5. ✅ Check your inbox

## 🎉 You're All Set!

Your newsletter platform is ready to use!

## Common Issues

### "Error fetching newsletters"

- Check Supabase credentials in `.env.local`
- Verify SQL schema was run successfully

### "Failed to subscribe"

- Check Supabase credentials
- Check browser console for errors
- Verify `subscribers` table exists

### Emails not sending

- Verify Resend API key is correct
- Check email `from` address is valid
- For production, verify domain is set up in Resend

### Admin login not working

- Check password in `app/admin/page.tsx` line 52
- Clear browser cache/sessionStorage
- Try incognito mode

## Next Steps

- Read [SETUP.md](SETUP.md) for detailed configuration
- Read [README.md](README.md) for full documentation
- Deploy to Vercel for production

## Need Help?

Check these resources:

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Resend Docs](https://resend.com/docs)
