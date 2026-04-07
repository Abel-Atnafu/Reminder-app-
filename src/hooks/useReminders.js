import { useEffect, useRef } from 'react';
import { requestNotificationPermission, scheduleNotification } from '../utils/notificationUtils';

export function useReminders(todos) {
  const timers = useRef({});

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    // Clear all existing timers
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};

    todos.forEach((todo) => {
      if (todo.reminder && !todo.completed) {
        const id = scheduleNotification(todo);
        if (id !== null) {
          timers.current[todo.id] = id;
        }
      }
    });

    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, [todos]);
}
