# Setup Checklist for Front-end Brief

Follow these steps to get your newsletter up and running.

## ✅ Prerequisites

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## ✅ Supabase Setup

- [ ] Create account at https://supabase.com
- [ ] Create a new project
- [ ] Copy Project URL from Settings → API
- [ ] Copy `anon` key from Settings → API
- [ ] Copy `service_role` key from Settings → API (keep secret!)
- [ ] Go to SQL Editor
- [ ] Paste contents of `supabase/schema.sql`
- [ ] Run the SQL script
- [ ] Verify tables created: `subscribers` and `newsletters`

## ✅ Resend Setup

- [ ] Create account at https://resend.com
- [ ] Get API key from dashboard
- [ ] (Optional) Create an audience for subscriber management
- [ ] For production: Add and verify your domain
- [ ] For development: You can use Resend's test domain

## ✅ Local Environment Setup

- [ ] Clone/download the project
- [ ] Run `npm install` in project directory
- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in Supabase credentials in `.env.local`
- [ ] Fill in Resend API key in `.env.local`
- [ ] Set a secure admin password in `.env.local`
- [ ] Verify all environment variables are set

## ✅ Email Configuration

- [ ] Open `app/api/admin/send/route.ts`
- [ ] Update line 80: Change `from: 'Front-end Brief <newsletter@yourdomain.com>'`
- [ ] For development: Use `onboarding@resend.dev`
- [ ] For production: Use your verified domain email

## ✅ Test the Application

- [ ] Run `npm run dev`
- [ ] Visit http://localhost:3000
- [ ] Test email signup form
- [ ] Check Supabase dashboard for new subscriber
- [ ] Visit http://localhost:3000/admin
- [ ] Login with your admin password
- [ ] Create a test newsletter
- [ ] Preview the newsletter
- [ ] (Optional) Send test newsletter to yourself

## ✅ Production Deployment (Vercel)

- [ ] Push code to GitHub
- [ ] Connect repository to Vercel
- [ ] Add all environment variables in Vercel dashboard
- [ ] Update `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Update email `from` address to use your verified domain
- [ ] Deploy
- [ ] Test production site
- [ ] Test signup, admin, and email sending

## 🚀 You're Ready!

Your Front-end Brief newsletter is now live and ready to start building your subscriber base.

## Need Help?

- Check the README.md for detailed documentation
- Supabase docs: https://supabase.com/docs
- Resend docs: https://resend.com/docs
- Next.js docs: https://nextjs.org/docs

## Next Steps (Future Enhancements)

- Set up custom domain email
- Add analytics tracking
- Implement AI content discovery
- Schedule newsletter sends
- Add subscriber preferences
