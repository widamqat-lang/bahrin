import * as admin from "firebase-admin";

// Firebase Admin configuration
const firebaseConfig = {
  type: "service_account",
  project_id: "mawashi-bh",
  private_key_id: "819e2a38d8bfd089a832e7bfc067de4a3207a4ef",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDt9A5JMDeFt0I7\nLI+6H4VGT2QxgB2ZCiX8m7yCEkUc4l2yOxUr6yy8o0O0DM7iKvK/Cl8QBTEH1Kuh\nFmesnQ58sFYXo9xMPEhMG/KyDEG/KrJm0rCy4lTMFnVlGs7lopglQHwzL5gwuMql\nU43+rviQSdn4ybGdYSNO7/OvgJfWt9rk8x3OX4BLN/o01VSZpoZqe1+o+AARCtn+\ndH+0DsrgnpUxsdB53M8KhMxBjMczXMyNqqkH8XD1zs60dBr0EgESQ+2zRFlnI/bY\nqO373JTwi0eRDHoodgZLAfhksz8fhu9UyiyLKJXqFGpOkcvvUEzy9xWhA8y/UKmV\nHoOhJXCTAgMBAAECggEAAlcDxgobbsF02kYcuSkv01GguQ21MSpXvuvl20ny4sNf\ndFDzgm/el5G9QD4ZF3AU3KT5AoUMAQTkFbbM9gHZXfv6pu5+70OGrEsbJ2azRbg+\nZt1anjHjBqwy9JqQytKQZs+O40jgcFaTw+1WJAfRWbwQLddNLQIC5A5H0UO4LuIO\njdPHBj9NSXt8r+/mrc4i8/ij4/yMOP824jmTYGjAynCbkQAuwyn48Igq0q8I0u2G\nNCuWJhMRTEiBuAf2D8TMq5NFQ453LtZPJLn9iQog7zwM6h6gbKaojG5inf87r9CB\nNz89goH9MVoihegK2NQqFXWRfCaZCMw1ljpjZUJOyQKBgQD5NFNlvkxmtgUb8kGL\nmRRvdhiYhWrqUjR/2bcqbGmOTEt0oKFxqWJP8fRJPFdEppoHHG/rHmcqyR1CjBfN\nG2Soq4gU2CRF3X84QN4/ZGoUuvylzUxAOwEK3mKmnMHUkx5SQskiAwuKCo+WT46K\njMg1cHZpm6l8jxDOBwoDsRaLVwKBgQD0cS/5aoz7uz4RXvsJy8aMa9OKCmxkeHYf\nysguP5z1r8GXmpbEHbg+U6yJ1SDCqgSWeSYs8qBxjPAqVR9YiNoYObBtYdv/8/F0\nZ3TY8H08iPJHWBoS/x58dDtzJDJ4wf7UIb+YDCiTqg0FYaCfU/lNbjOFrERbC63i\nK5ycrcP7JQKBgE0u4a2fdPZS5d4z+A0Oin/DKfcDS4vrjgsTGWHwVfkWtEAZCCe1\n+JceLzUHlVfT6dzN9/PwZK+hvog/75c9Jr3+8pTSJNnmsmJv5OXpadml2F5Z6YXz\nQG1nV1KXNolqT3fW64i3PLmyb6p0VYef9tpmTKaE6ceEYAYPtBBUptDdAoGBAIRF\nZ0dYr9db19dAhSkk2liL1FkjEMpBIPJNIYtdIssTgvdNUH3o8xTO5FNlP6f2piri\nfZTe6ZDoSeEuVJrs2s83EE/wH0LeNu7dOK5XW/1QwYF3nAxhfparsqu4j5MmroUN\nigZ1tdNJtmgODwOIRiPvGPQhZo+5vyrenI1vvdf9AoGAeaPcGa8mhdGQJyLETQ+6\nMvmBRhjG175eTSHEgPTeU5rsDbklGXFtMglNEeyTblcdNmjG6i9jWduYlAw9NSUp\nVAHErDT6DnBoksC4czJO0cpApPfUw7nJJ7quxlSLNuxclot2y+mzOta3rRwR/owH\nKbLZmQiFdkVWgqmAqsHmwQk=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@mawashi-bh.iam.gserviceaccount.com",
  client_id: "108608183769511146915",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40mawashi-bh.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// VAPID Key
export const VAPID_KEY = "BGKlH7RpwXm71PFhbOC9gQIMsVy_ymv1lk_tCZ2p5sHoES1RP6_p8_eiFitlUggqLM1jaaA1MBkQlgaCKJY_Zb0";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
  });
}

export const messaging = admin.messaging();

// Interface for notification payload
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, string>;
}

// Send push notification to a single device
export async function sendPushNotification(
  fcmToken: string,
  payload: NotificationPayload
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      android: {
        priority: "high" as const,
        notification: {
          channelId: "mawashi_orders",
          priority: "high" as const,
          defaultSound: true,
          defaultVibrateTimings: true,
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: "default",
            contentAvailable: true,
          },
        },
        headers: {
          "apns-priority": "10",
          "apns-push-type": "alert",
        },
      },
      webpush: {
        headers: {
          Urgency: "high",
        },
        notification: {
          icon: payload.icon || "/icon-192.png",
          badge: payload.badge || "/icon-192.png",
          tag: payload.tag || "mawashi-notification",
          requireInteraction: true,
          dir: "rtl",
          lang: "ar",
        },
        fcmOptions: {
          link: `${process.env.VITE_API_URL || "https://mawashi-bahrain.up.railway.app"}/admin/orders`,
        },
      },
      data: payload.data,
    };

    const messageId = await messaging.send(message);
    return { success: true, messageId };
  } catch (error: any) {
    console.error("Error sending push notification:", error);
    
    // Handle specific Firebase errors
    if (error.code === "messaging/registration-token-not-registered") {
      return { success: false, error: "TOKEN_NOT_REGISTERED: الجهاز غير مسجل" };
    }
    if (error.code === "messaging/invalid-argument") {
      return { success: false, error: "INVALID_TOKEN: رمز الجهاز غير صالح" };
    }
    if (error.code === "messaging/quota-exceeded") {
      return { success: false, error: "QUOTA_EXCEEDED: تم تجاوز الحد المسموح للإشعارات" };
    }
    
    return { success: false, error: error.message || "خطأ غير معروف" };
  }
}

// Send push notification to multiple devices
export async function sendPushNotificationToMultiple(
  fcmTokens: string[],
  payload: NotificationPayload
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const token of fcmTokens) {
    const result = await sendPushNotification(token, payload);
    if (result.success) {
      success++;
    } else {
      failed++;
      errors.push(`${token.slice(0, 10)}...: ${result.error}`);
    }
  }

  return { success, failed, errors };
}

// Send test notification
export async function sendTestNotification(
  fcmToken: string,
  adminName: string = "المدير"
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return sendPushNotification(fcmToken, {
    title: "✅ تم تفعيل الإشعارات!",
    body: `مرحباً ${adminName}، تم تفعيل الإشعارات بنجاح. ستستلم إشعارات الطلبات الجديدة هنا.`,
    tag: "test-notification",
    data: {
      type: "test",
      timestamp: new Date().toISOString(),
    },
  });
}
