import { supabase } from "@/integrations/supabase/client";

const PUBLIC_VAPID_KEY = "BNxW7xZ8vH_qK9yC3mL4nR5pT6vX8wY9zA1bC2dE3fG4hJ5kL6mN7oP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7iJ8k";

export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    throw new Error("This browser does not support notifications");
  }

  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers are not supported");
  }

  // Check if permission is already denied
  if (Notification.permission === "denied") {
    throw new Error("Notifications are blocked. Please enable them in your browser settings.");
  }

  // Request permission if not already granted
  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    
    if (permission !== "granted") {
      throw new Error("Please allow notifications to receive wellness reminders.");
    }
    
    return permission;
  }

  return Notification.permission;
}

export async function subscribeUserToPush() {
  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
    });

    return subscription;
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
    throw error;
  }
}

export async function saveSubscription(subscription: PushSubscription) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const subscriptionJson = subscription.toJSON();
  
  const { error } = await supabase.from("push_subscriptions").upsert({
    user_id: user.id,
    endpoint: subscription.endpoint,
    p256dh: subscriptionJson.keys?.p256dh || "",
    auth: subscriptionJson.keys?.auth || "",
  });

  if (error) throw error;
}

export async function unsubscribeFromPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", user.id)
          .eq("endpoint", subscription.endpoint);
      }
    }
  } catch (error) {
    console.error("Error unsubscribing:", error);
    throw error;
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
