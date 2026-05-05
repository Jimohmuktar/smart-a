async function requestWebPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const perm = await Notification.requestPermission();
  return perm === "granted";
}

export async function registerForPushNotifications() {
  return await requestWebPermission() ? "granted" : null;
}

export async function sendLocalNotification({ title, body }) {
  const ok = await requestWebPermission();
  if (!ok) return;
  try {
    new Notification(title, { body, icon: "/assets/icon.png" });
  } catch {}
}

export async function sendQuestionAnsweredNotification(studentName, questionText) {
  await sendLocalNotification({
    title: "Your question was answered!",
    body: `The instructor answered: "${questionText.slice(0, 80)}${questionText.length > 80 ? "…" : ""}"`,
  });
}

export async function sendAdminMessageNotification(title, body) {
  await sendLocalNotification({
    title: `Admin: ${title}`,
    body,
  });
}
