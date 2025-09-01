import { supabase } from '../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Update last_seen timestamp using upsert to handle cases where profile might not exist
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId,
        last_seen: new Date().toISOString(),
        is_online: true 
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error updating user activity:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in user activity endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}