import { getMessaging, getToken } from "firebase/messaging";
import { app } from "../firebase";

export async function getFcmToken() {
  try {
    const messaging = getMessaging(app);
    // VAPID key must be set in your Firebase project settings
    const vapidKey = "BOYFVt6rhMqZqBZJjnWaF_xnWGpCvJqq-d6wipy9XlOmv3h1H_SzSN8i33sL2BS9ciOEFbYerQc3HvRuQF-3LVo";
    const currentToken = await getToken(messaging, { vapidKey });
    if (currentToken) { 
      return currentToken;
    } else {
      console.warn("No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving FCM token:", err);
    return null;
  }
}