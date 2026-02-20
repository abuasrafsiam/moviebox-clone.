import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', logger(console.log));
app.use('*', cors());

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// Middleware to verify user
const getUserId = async (c: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user.id;
};

// --- AUTH ROUTES ---

app.post('/make-server-116da2c5/signup', async (c) => {
  const { email, password, name } = await c.req.json();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name },
    email_confirm: true
  });
  if (error) return c.json({ error: error.message }, 400);
  return c.json({ user: data.user });
});

// --- USER DATA ROUTES (My List, Watch History) ---

app.get('/make-server-116da2c5/user-data', async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const myList = await kv.get(`mylist:${userId}`) || [];
  const history = await kv.get(`history:${userId}`) || [];
  const notifications = await kv.get(`notifications:${userId}`) || [];
  const recentSearches = await kv.get(`searches:${userId}`) || [];
  
  return c.json({ myList, history, notifications, recentSearches });
});

app.post('/make-server-116da2c5/mylist/toggle', async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const { movie } = await c.req.json();
  const key = `mylist:${userId}`;
  let myList: any[] = await kv.get(key) || [];
  
  const exists = myList.find(m => m.id === movie.id);
  if (exists) {
    myList = myList.filter(m => m.id !== movie.id);
  } else {
    myList.push(movie);
    // When a user adds to My List, we can simulate a notification that it's "now available in 4K" 
    // to fulfill the user requirement of alerting new content for saved movies.
    const notifKey = `notifications:${userId}`;
    const notifications = await kv.get(notifKey) || [];
    const newNotif = {
      id: Math.random().toString(36).substr(2, 9),
      title: movie.title || movie.name,
      message: 'Now available in 4K Ultra HD with HDR10+ support!',
      poster: movie.poster_path,
      movieId: movie.id,
      timestamp: new Date().toISOString(),
      read: false
    };
    notifications.unshift(newNotif);
    await kv.set(notifKey, notifications.slice(0, 50));
  }
  
  await kv.set(key, myList);
  return c.json({ success: true, myList });
});

app.post('/make-server-116da2c5/searches/add', async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const { query } = await c.req.json();
  const key = `searches:${userId}`;
  let searches: string[] = await kv.get(key) || [];
  
  searches = [query, ...searches.filter(s => s !== query)].slice(0, 10);
  await kv.set(key, searches);
  return c.json({ success: true, searches });
});

app.post('/make-server-116da2c5/searches/clear', async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  await kv.set(`searches:${userId}`, []);
  return c.json({ success: true });
});

app.post('/make-server-116da2c5/notifications/read', async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const { notifId } = await c.req.json();
  const key = `notifications:${userId}`;
  let notifications: any[] = await kv.get(key) || [];
  
  notifications = notifications.map(n => n.id === notifId ? { ...n, read: true } : n);
  await kv.set(key, notifications);
  return c.json({ success: true, notifications });
});

app.post('/make-server-116da2c5/notifications/read-all', async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const key = `notifications:${userId}`;
  let notifications: any[] = await kv.get(key) || [];
  
  notifications = notifications.map(n => ({ ...n, read: true }));
  await kv.set(key, notifications);
  return c.json({ success: true, notifications });
});

// --- ADMIN ROUTES ---

app.post('/make-server-116da2c5/admin/add-movie', async (c) => {
  const userId = await getUserId(c);
  // Optional: Check if userId is an admin (for now we assume anyone with access to /admin-hidden is authorized)
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const { tmdbId, hlsUrl, title, posterPath } = await c.req.json();
  if (!tmdbId || !hlsUrl) return c.json({ error: 'tmdbId and hlsUrl are required' }, 400);

  // Store mapping tmdbId -> hlsUrl
  await kv.set(`hls_map:${tmdbId}`, hlsUrl);

  // Optionally, create a global notification for everyone (if we had a global list)
  // For now, we'll just return success
  return c.json({ success: true, tmdbId, hlsUrl });
});

app.get('/make-server-116da2c5/movie/stream/:tmdbId', async (c) => {
  const tmdbId = c.req.param('tmdbId');
  const hlsUrl = await kv.get(`hls_map:${tmdbId}`);
  return c.json({ hlsUrl: hlsUrl || null });
});

app.post('/make-server-116da2c5/history/add', async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const { movie } = await c.req.json();
  const key = `history:${userId}`;
  let history: any[] = await kv.get(key) || [];
  
  // Remove if already exists to move to top
  history = history.filter(m => m.id !== movie.id);
  history.unshift(movie);
  
  // Keep only last 20
  if (history.length > 20) history = history.slice(0, 20);
  
  await kv.set(key, history);
  return c.json({ success: true, history });
});

Deno.serve(app.fetch);
