import { useState, useCallback, useEffect } from 'react';

const MAX_NOTIFICATIONS = 30;

function getStorageKey(userId) {
  return `vc_notifications_${userId}`;
}

function loadNotifications(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotifications(userId, notifications) {
  if (!userId) return;
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(notifications));
  } catch {}
}

export default function useNotifications(userId) {
  const [notifications, setNotifications] = useState(() => loadNotifications(userId));

  // Persist whenever notifications change
  useEffect(() => {
    saveNotifications(userId, notifications);
  }, [notifications, userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => {
      // Avoid duplicates by task ID + type
      const key = `${notification.taskId}_${notification.type}`;
      const alreadyExists = prev.some((n) => `${n.taskId}_${n.type}` === key);
      if (alreadyExists) return prev;

      const newNotif = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        read: false,
        createdAt: new Date().toISOString(),
        ...notification,
      };

      const updated = [newNotif, ...prev].slice(0, MAX_NOTIFICATIONS);
      return updated;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markOneRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAllRead,
    markOneRead,
    clearNotification,
    clearAll,
  };
}
