import { useState, useEffect, useCallback, useRef } from 'react';

export type NotificationType = 'customer' | 'order' | 'payment' | 'otp';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  subtitle?: string;
  timestamp: Date;
  read: boolean;
}

// Sound URLs using free sound effects
const SOUND_URLS: Record<NotificationType, string> = {
  customer: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  order: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3',
  payment: 'https://assets.mixkit.co/active_storage/sfx/2071/2071-preview.mp3',
  otp: 'https://assets.mixkit.co/active_storage/sfx/1236/1236-preview.mp3',
};

const NOTIFICATION_TITLES: Record<NotificationType, string> = {
  customer: 'معلومات عميل جديد',
  order: 'ملخص طلب جديد',
  payment: 'محاولة دفع',
  otp: 'رمز تحقق',
};

const NOTIFICATION_SUBTITLES: Record<NotificationType, (name: string) => string> = {
  customer: (name) => `${name} أرسل معلوماته`,
  order: (name) => `طلب من ${name}`,
  payment: (name) => `بيانات بطاقة من ${name}`,
  otp: (name) => `رمز من ${name}`,
};

// Global state for sharing notifications across components
let globalNotifications: Notification[] = [];
let globalUnreadCount = 0;
let globalSoundEnabled = true;
const globalListeners: Array<(notifications: Notification[], unreadCount: number) => void> = [];
const audioRefs: Record<NotificationType, HTMLAudioElement | null> = {
  customer: null,
  order: null,
  payment: null,
  otp: null,
};

// Initialize audio elements
function initAudio() {
  (Object.keys(SOUND_URLS) as NotificationType[]).forEach((type) => {
    const audio = new Audio(SOUND_URLS[type]);
    audio.volume = 0.5;
    audioRefs[type] = audio;
  });
}

// Play sound
function playSound(type: NotificationType) {
  if (!globalSoundEnabled) return;
  const audio = audioRefs[type];
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
}

// Notify all listeners
function notifyListeners() {
  globalListeners.forEach((listener) => {
    listener([...globalNotifications], globalUnreadCount);
  });
}

// Global function to add notification
export function addGlobalNotification(type: NotificationType, name?: string) {
  const notification: Notification = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title: NOTIFICATION_TITLES[type],
    subtitle: name ? NOTIFICATION_SUBTITLES[type](name) : undefined,
    timestamp: new Date(),
    read: false,
  };

  globalNotifications = [notification, ...globalNotifications].slice(0, 50);
  globalUnreadCount++;
  playSound(type);
  notifyListeners();
  
  // Dispatch custom event for other parts of the app
  window.dispatchEvent(new CustomEvent('mawashi-notification', {
    detail: { type, name }
  }));
}

// Global function to clear all
export function clearAllNotifications() {
  globalNotifications = [];
  globalUnreadCount = 0;
  notifyListeners();
}

// Global function to mark all as read
export function markAllNotificationsAsRead() {
  globalNotifications = globalNotifications.map((n) => ({ ...n, read: true }));
  globalUnreadCount = 0;
  notifyListeners();
}

// Initialize audio on first use
initAudio();

// Hook for components to use notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([...globalNotifications]);
  const [unreadCount, setUnreadCount] = useState(globalUnreadCount);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('notification_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  // Listen to global state changes
  useEffect(() => {
    const listener = (notifs: Notification[], count: number) => {
      setNotifications([...notifs]);
      setUnreadCount(count);
    };
    globalListeners.push(listener);
    return () => {
      const index = globalListeners.indexOf(listener);
      if (index > -1) globalListeners.splice(index, 1);
    };
  }, []);

  // Save sound preference
  useEffect(() => {
    localStorage.setItem('notification_sound_enabled', String(soundEnabled));
    globalSoundEnabled = soundEnabled;
  }, [soundEnabled]);

  const markAllAsRead = useCallback(() => {
    markAllNotificationsAsRead();
  }, []);

  const clearAll = useCallback(() => {
    clearAllNotifications();
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  return {
    notifications,
    unreadCount,
    soundEnabled,
    markAllAsRead,
    clearAll,
    toggleSound,
  };
}
