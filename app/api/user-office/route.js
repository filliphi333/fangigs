// app/api/user-office/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;           // don’t pre-render
export const runtime = 'nodejs';       // ensure Node runtime

function readSupabaseEnv() {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use SERVICE_ROLE on server if you need elevated access; otherwise anon
  const key =
    process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url, key };
}

export async function GET() {
  try {
    const { url, key } = readSupabaseEnv();
    if (!url || !key) {
      return NextResponse.json(
        { ok: false, error: 'Supabase env not configured on server' },
        { status: 500 }
      );
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key, { auth: { persistSession: false } });

    // TODO: replace with your actual query/logic
    const { data, error } = await supabase
      .from('user_office')         // or whatever table you need
      .select('*')
      .limit(1);

    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
