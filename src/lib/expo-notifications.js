export const AndroidImportance = { MAX: 5, HIGH: 4, DEFAULT: 3, LOW: 2, MIN: 1 };

export function setNotificationHandler() {}

export async function getPermissionsAsync() {
  if (!("Notification" in window)) return { status: "denied" };
  return { status: Notification.permission === "granted" ? "granted" : Notification.permission === "denied" ? "denied" : "undetermined" };
}

export async function requestPermissionsAsync() {
  if (!("Notification" in window)) return { status: "denied" };
  const perm = await Notification.requestPermission();
  return { status: perm };
}

export async function scheduleNotificationAsync({ content, trigger }) {
  const { status } = await getPermissionsAsync();
  if (status !== "granted") return;
  try {
    new Notification(content.title || "Smart-A", { body: content.body || "", icon: "/assets/icon.png" });
  } catch {}
}

export async function setNotificationChannelAsync() {}

export function addNotificationReceivedListener(handler) {
  return { remove: () => {} };
}

export function addNotificationResponseReceivedListener(handler) {
  return { remove: () => {} };
}

export function removeNotificationSubscription() {}

export async function getExpoPushTokenAsync() {
  return { data: null };
}

export async function getBadgeCountAsync() { return 0; }
export async function setBadgeCountAsync() {}
export async function dismissAllNotificationsAsync() {}
export async function getPresentedNotificationsAsync() { return []; }
export async function cancelScheduledNotificationAsync() {}
export async function cancelAllScheduledNotificationsAsync() {}
