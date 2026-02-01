// Test Supabase connection
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    return Response.json({
      hasKey: !!serviceKey,
      keyLength: serviceKey?.length,
      keyStart: serviceKey?.substring(0, 20),
      url: process.env.NEXT_PUBLIC_SUPABASE_URL
    });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}