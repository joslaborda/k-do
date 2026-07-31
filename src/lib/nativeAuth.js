import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { appParams } from '@/lib/app-params';

const CALLBACK_URL = 'com.kodotravel.app://auth-callback';

export function isNative() {
  return Capacitor.isNativePlatform();
}

export async function openNativeLogin() {
  if (!isNative()) return;
  const loginUrl = `${appParams.appBaseUrl}/login?from_url=${encodeURIComponent(CALLBACK_URL)}`;
  try {
    await Browser.open({ url: loginUrl });
  } catch {}
}

export function listenForLoginCallback(onToken) {
  if (!isNative()) return () => {};
  const handlePromise = App.addListener('appUrlOpen', ({ url }) => {
    if (!url || !url.startsWith(CALLBACK_URL)) return;
    try {
      const parsed = new URL(url);
      const token = parsed.searchParams.get('access_token');
      if (token) {
        Browser.close().catch(() => {});
        onToken(token);
      }
    } catch {}
  });
  return () => {
    handlePromise.then(handle => handle.remove()).catch(() => {});
  };
}
