/**
 * Native Browser Notifications for MITS Smart Campus Canteen
 * Provides real-time desktop / mobile push notification banners
 */

export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return Notification.permission;
  } catch (err) {
    return 'denied';
  }
};

export const sendBrowserNotification = (title, bodyOrOptions, options = {}) => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }
  if (Notification.permission !== 'granted') {
    return null;
  }

  try {
    const text = typeof bodyOrOptions === 'string' ? bodyOrOptions : bodyOrOptions?.body || '';
    const extraOpts = typeof bodyOrOptions === 'object' ? { ...bodyOrOptions, ...options } : options;

    const notification = new Notification(title, {
      body: String(text || ''),
      icon: extraOpts.icon || '/images/mits/mits-logo.png',
      badge: extraOpts.badge || '/images/mits/mits-logo.png',
      tag: extraOpts.tag || 'mits-canteen-order',
      renotify: true,
      silent: false,
      ...extraOpts,
    });

    notification.onclick = () => {
      window.focus();
      if (extraOpts.url) {
        window.location.href = extraOpts.url;
      }
      notification.close();
    };

    return notification;
  } catch (err) {
    return null;
  }
};
