import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { resend } from '@/lib/resend';
import { render } from '@react-email/components';
import { NewsletterEmail } from '@/components/NewsletterEmail';
import { Newsletter, Subscriber } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const { newsletterId } = await request.json();

    if (!newsletterId) {
      return NextResponse.json(
        { error: 'Newsletter ID is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Fetch newsletter
    const { data: newsletter, error: newsletterError } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', newsletterId)
      .single();

    if (newsletterError || !newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    const typedNewsletter = newsletter as Newsletter;

    if (typedNewsletter.status === 'sent') {
      return NextResponse.json(
        { error: 'Newsletter has already been sent' },
        { status: 400 }
      );
    }

    // Fetch active subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('status', 'active');

    if (subscribersError) {
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No active subscribers found' },
        { status: 400 }
      );
    }

    const typedSubscribers = subscribers as Subscriber[];

    // Send emails in batches
    const batchSize = 100; // Resend's batch limit
    const batches = [];

    for (let i = 0; i < typedSubscribers.length; i += batchSize) {
      const batch = typedSubscribers.slice(i, i + batchSize);
      batches.push(batch);
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const batch of batches) {
      const emailPromises = batch.map(async (subscriber) => {
        try {
          const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe?token=${subscriber.unsubscribe_token}`;

          const emailHtml = await render(
            NewsletterEmail({
              title: typedNewsletter.title,
              content: typedNewsletter.content,
              unsubscribeUrl
            })
          );

          await resend.emails.send({
            from: 'Front-end Brief <onboarding@resend.dev>',
            to: subscriber.email,
            subject: typedNewsletter.title,
            html: emailHtml
          });

          sentCount++;
        } catch (error) {
          console.error(`Failed to send to ${subscriber.email}:`, error);
          failedCount++;
        }
      });

      await Promise.all(emailPromises);
    }

    // Update newsletter status
    const { error: updateError } = await supabase
      .from('newsletters')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', newsletterId);

    if (updateError) {
      console.error('Failed to update newsletter status:', updateError);
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: typedSubscribers.length
    });
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to send newsletter' },
      { status: 500 }
    );
  }
}
