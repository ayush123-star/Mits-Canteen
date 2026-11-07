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

export const sendBrowserNotification = (title, body, options = {}) => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }
  if (Notification.permission !== 'granted') {
    return null;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: '/images/mits/mits-logo.png',
      badge: '/images/mits/mits-logo.png',
      tag: options.tag || 'mits-canteen-order',
      renotify: true,
      silent: false,
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      if (options.url) {
        window.location.href = options.url;
      }
      notification.close();
    };

    return notification;
  } catch (err) {
    return null;
  }
};
