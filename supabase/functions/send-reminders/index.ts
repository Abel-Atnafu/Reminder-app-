// Supabase Edge Function: send-reminders
// Triggered every minute by pg_cron.
// Queries todos whose reminder is due within the current minute, sends Web Push, records sends.
//
// Required secrets (set via `supabase secrets set` or Dashboard):
//   VAPID_PUBLIC_KEY   — from `npx web-push generate-vapid-keys`
//   VAPID_PRIVATE_KEY  — from `npx web-push generate-vapid-keys`
//   VAPID_EMAIL        — e.g. mailto:you@example.com

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;
const vapidEmail = Deno.env.get('VAPID_EMAIL')!;

webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

const supabase = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async () => {
  try {
    // Find todos whose reminder fires within this minute window
    const { data: dueTodos, error: queryError } = await supabase.rpc('get_due_reminders');

    if (queryError) {
      console.error('Query error:', queryError.message);
      return new Response(JSON.stringify({ error: queryError.message }), { status: 500 });
    }

    if (!dueTodos || dueTodos.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    let sent = 0;

    for (const todo of dueTodos) {
      // Fetch all push subscriptions for this user
      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth_key')
        .eq('user_id', todo.user_id);

      if (!subs || subs.length === 0) continue;

      const payload = JSON.stringify({
        title: `Reminder: ${todo.title}`,
        body: todo.description
          ? `${todo.description}\nDue: ${todo.due_time}`
          : `Due at ${todo.due_time}`,
        tag: todo.id,
      });

      for (const sub of subs) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
            payload
          );
        } catch (err) {
          // If subscription is expired/invalid, remove it
          if (err.statusCode === 404 || err.statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
          }
        }
      }

      // Record that we sent this reminder (prevents re-sending on the next cron tick)
      await supabase.from('sent_reminders').insert({ todo_id: todo.id }).throwOnError();
      sent++;
    }

    return new Response(JSON.stringify({ sent }), { status: 200 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
