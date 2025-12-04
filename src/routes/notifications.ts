import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';

const notifications = new Hono<{ Bindings: CloudflareBindings }>();

// 내 알림 목록 조회
notifications.get('/', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const { is_read, limit = '20', offset = '0' } = c.req.query();

  let query = `
    SELECT * FROM notifications
    WHERE user_id = ?
  `;
  const params: any[] = [userId];

  if (is_read !== undefined) {
    query += ' AND is_read = ?';
    params.push(Number(is_read));
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const { results } = await db.prepare(query).bind(...params).all();

  // 읽지 않은 알림 수
  const unreadCount = await db.prepare(`
    SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0
  `).bind(userId).first() as any;

  return c.json({ 
    notifications: results,
    unread_count: unreadCount?.count || 0
  });
});

// 알림 읽음 처리
notifications.put('/:id/read', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const notificationId = c.req.param('id');

  await db.prepare(`
    UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?
  `).bind(notificationId, userId).run();

  return c.json({ success: true, message: 'Notification marked as read' });
});

// 모든 알림 읽음 처리
notifications.put('/read-all', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');

  await db.prepare(`
    UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0
  `).bind(userId).run();

  return c.json({ success: true, message: 'All notifications marked as read' });
});

// 알림 삭제
notifications.delete('/:id', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const notificationId = c.req.param('id');

  await db.prepare(`
    DELETE FROM notifications WHERE id = ? AND user_id = ?
  `).bind(notificationId, userId).run();

  return c.json({ success: true, message: 'Notification deleted' });
});

export default notifications;

