import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushSubscription(userId) {
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!userId || !VAPID_PUBLIC_KEY || subscribedRef.current) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    let cancelled = false;

    async function subscribe() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const registration = await navigator.serviceWorker.ready;
        let sub = await registration.pushManager.getSubscription();

        if (!sub) {
          sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
        }

        if (cancelled) return;

        const { endpoint, keys } = sub.toJSON();
        await supabase.from('push_subscriptions').upsert(
          {
            user_id: userId,
            endpoint,
            p256dh: keys.p256dh,
            auth_key: keys.auth,
          },
          { onConflict: 'endpoint' }
        );

        subscribedRef.current = true;
      } catch {
        // Notifications blocked or SW not available — silently skip
      }
    }

    subscribe();

    return () => { cancelled = true; };
  }, [userId]);
}
