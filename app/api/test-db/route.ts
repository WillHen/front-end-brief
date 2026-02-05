// Test Supabase connection

export async function GET() {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    return Response.json({
      hasKey: !!serviceKey,
      keyLength: serviceKey?.length,
      keyStart: serviceKey?.substring(0, 20),
      url: process.env.NEXT_PUBLIC_SUPABASE_URL
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
