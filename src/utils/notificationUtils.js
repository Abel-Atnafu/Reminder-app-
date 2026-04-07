export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result;
}

export function canNotify() {
  return 'Notification' in window && Notification.permission === 'granted';
}

export function scheduleNotification(todo) {
  if (!canNotify()) return null;
  if (!todo.dueDate || !todo.dueTime || !todo.reminder) return null;

  const [y, m, d] = todo.dueDate.split('-').map(Number);
  const [h, min] = todo.dueTime.split(':').map(Number);
  const dueMs = new Date(y, m - 1, d, h, min).getTime();
  const fireMs = dueMs - todo.reminderMinutes * 60 * 1000;
  const delay = fireMs - Date.now();

  if (delay <= 0) return null; // already past

  const timerId = setTimeout(() => {
    new Notification(`Reminder: ${todo.title}`, {
      body: todo.description
        ? `${todo.description}\nDue: ${todo.dueTime}`
        : `Due at ${todo.dueTime}`,
      icon: '/favicon.svg',
      tag: todo.id,
    });
  }, delay);

  return timerId;
}
