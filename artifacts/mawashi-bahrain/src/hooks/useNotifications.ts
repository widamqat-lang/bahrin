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
  customer: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', // Short ding
  order: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3', // Pop sound
  payment: 'https://assets.mixkit.co/active_storage/sfx/2857/2857-preview.mp3', // Alert/alarm sound (longer)
  otp: 'https://assets.mixkit.co/active_storage/sfx/3006/3006-preview.mp3', // Messenger-like notification
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

// Create audio elements with preloading
const createAudioElement = (type: NotificationType): HTMLAudioElement => {
  const audio = new Audio();
  audio.src = SOUND_URLS[type];
  audio.volume = 0.7;
  audio.preload = 'auto';
  return audio;
};

// Audio pool to ensure sounds work properly
const audioPool: Record<NotificationType, HTMLAudioElement[]> = {
  customer: [],
  order: [],
  payment: [],
  otp: [],
};

// Initialize audio pool
const POOL_SIZE = 3;
(Object.keys(SOUND_URLS) as NotificationType[]).forEach((type) => {
  for (let i = 0; i < POOL_SIZE; i++) {
    audioPool[type].push(createAudioElement(type));
  }
});

// Get audio from pool
function getAudioFromPool(type: NotificationType): HTMLAudioElement | null {
  const pool = audioPool[type];
  // Find an audio that's not currently playing
  for (const audio of pool) {
    if (audio.paused || audio.ended) {
      return audio;
    }
  }
  // If all are playing, reuse the first one
  return pool[0] || null;
}

// Play sound with retry
async function playSound(type: NotificationType, retryCount = 0): Promise<void> {
  const audio = getAudioFromPool(type);
  if (!audio) return;
  
  try {
    audio.currentTime = 0;
    await audio.play();
  } catch (error) {
    // If autoplay blocked, try user interaction
    if (retryCount < 2) {
      setTimeout(() => playSound(type, retryCount + 1), 500);
    }
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
