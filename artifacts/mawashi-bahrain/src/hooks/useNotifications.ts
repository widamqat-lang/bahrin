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

// Sound URLs - Notification sounds
const SOUND_URLS: Record<NotificationType, string> = {
  // Notification ringtone sound
  customer: 'https://assets.mixkit.co/active_storage/sfx/2807/2807-preview.mp3',
  
  // Same ringtone for order
  order: 'https://assets.mixkit.co/active_storage/sfx/2807/2807-preview.mp3',
  
  // Alert sound (like call/warning - longer)
  payment: 'https://assets.mixkit.co/active_storage/sfx/113/113-preview.mp3',
  
  // Ringtone style (like phone ring)
  otp: 'https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3',
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

// Audio pool to ensure sounds work properly
const audioPool: Record<NotificationType, HTMLAudioElement> = {
  customer: new Audio(),
  order: new Audio(),
  payment: new Audio(),
  otp: new Audio(),
};

// Initialize audio pool
function initAudioPool() {
  (Object.keys(SOUND_URLS) as NotificationType[]).forEach((type) => {
    audioPool[type].src = SOUND_URLS[type];
    audioPool[type].volume = 0.7;
    audioPool[type].preload = 'auto';
  });
}

// Initialize on first use
initAudioPool();

// Play sound
function playSound(type: NotificationType): void {
  const audio = audioPool[type];
  if (!audio) {
    console.log('[NOTIFICATION] No audio element for type:', type);
    return;
  }
  
  try {
    audio.currentTime = 0;
    audio.play().then(() => {
      console.log('[NOTIFICATION] Sound played for:', type);
    }).catch((error) => {
      console.log('[NOTIFICATION] Sound play failed:', type, error);
    });
  } catch (error) {
    console.log('[NOTIFICATION] Sound error:', type, error);
  }
}

// Global state
let globalNotifications: Notification[] = [];
let globalUnreadCount = 0;
const globalListeners: Set<(notifications: Notification[], unreadCount: number) => void> = new Set();

// Notify all listeners
function notifyListeners() {
  globalListeners.forEach((listener) => {
    try {
      listener([...globalNotifications], globalUnreadCount);
    } catch (e) {
      // Ignore listener errors
    }
  });
}

// Global function to add notification
export function addGlobalNotification(type: NotificationType, name?: string) {
  console.log('[NOTIFICATION] addGlobalNotification called:', type, name);
  
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
  
  // Play sound immediately
  console.log('[NOTIFICATION] Playing sound for:', type);
  playSound(type);
  
  notifyListeners();
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
    globalListeners.add(listener);
    return () => {
      globalListeners.delete(listener);
    };
  }, []);

  // Save sound preference
  useEffect(() => {
    localStorage.setItem('notification_sound_enabled', String(soundEnabled));
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
