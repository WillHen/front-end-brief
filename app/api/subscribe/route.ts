import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { resend } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Check if email already exists
    const { data: existing, error: checkError } = await supabase
      .from('subscribers')
      .select('email, status')
      .eq('email', email.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is fine
      console.error('Database check error:', checkError);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 400 }
        );
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabase
          .from('subscribers')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('email', email.toLowerCase());

        if (updateError) {
          console.error('Reactivation error:', updateError);
          return NextResponse.json(
            { error: 'Failed to reactivate subscription' },
            { status: 500 }
          );
        }
      }
    } else {
      // Insert new subscriber
      const { error: insertError } = await supabase
        .from('subscribers')
        .insert([{ email: email.toLowerCase() }]);

      if (insertError) {
        console.error('Insert error:', insertError);
        return NextResponse.json(
          { error: 'Failed to subscribe' },
          { status: 500 }
        );
      }
    }

    // Add to Resend audience
    try {
      const audienceId = process.env.RESEND_AUDIENCE_ID;
      if (audienceId) {
        await resend.contacts.create({
          email: email.toLowerCase(),
          audienceId: audienceId
        });
      }
    } catch (resendError) {
      // Log but don't fail the subscription if Resend fails
      console.error('Resend error:', resendError);
    }

    // Send confirmation email
    try {
      await resend.emails.send({
        from: 'Front-end Brief <onboarding@resend.dev>',
        to: email.toLowerCase(),
        subject: "✅ You're subscribed to Front-end Brief!",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #18181b; font-size: 24px; margin-bottom: 16px;">Welcome to Front-end Brief! 🎉</h1>
            <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
              Thanks for subscribing! You'll now receive weekly updates with:
            </p>
            <ul style="color: #3f3f46; font-size: 16px; line-height: 1.8; margin-bottom: 24px;">
              <li>📚 Curated articles from top front-end developers</li>
              <li>🛠️ New tools and libraries to boost your workflow</li>
              <li>💡 Tips and best practices for modern web development</li>
            </ul>
            <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Your first newsletter will arrive next week. In the meantime, feel free to browse our archive at 
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/newsletters" style="color: #18181b; text-decoration: underline;">
                ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/newsletters
              </a>
            </p>
            <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 32px 0;" />
            <p style="color: #71717a; font-size: 14px; line-height: 1.6;">
              Not interested anymore? You can 
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #71717a; text-decoration: underline;">
                unsubscribe here
              </a>.
            </p>
          </div>
        `
      });
    } catch (emailError) {
      // Log but don't fail the subscription if email fails
      console.error('Confirmation email error:', emailError);
    }

    return NextResponse.json(
      { message: 'Successfully subscribed!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
