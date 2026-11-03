import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomBytes, createHash, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { INITIAL_MEMBERS } from './src/data/initialData.ts';
import type { QualityMemberReview, AppUser } from './src/types/dashboard.ts';

const scrypt = promisify(scryptCallback);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';
const SESSION_SECRET = process.env.SESSION_SECRET || '';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

interface PublicUser { id: string; username: string; name: string; role: string; color: string; photoUrl?: string; }
interface DashboardState {
  members: QualityMemberReview[];
  activeMemberId: string;
  version: number;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}
let state: DashboardState = {
  members: INITIAL_MEMBERS,
  activeMemberId: INITIAL_MEMBERS[0]?.id || 'm1',
  version: 1,
  lastUpdatedBy: 'النظام',
  lastUpdatedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
};

const configured = () => Boolean(SUPABASE_URL && SUPABASE_SECRET_KEY && SESSION_SECRET);
async function supabase<T = any>(table: string, options: { method?: string; query?: string; body?: unknown; prefer?: string } = {}): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error('Supabase environment variables are missing');
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${options.query ? `?${options.query}` : ''}`, {
    method: options.method || 'GET',
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${body}`);
  return (body ? JSON.parse(body) : null) as T;
}
const publicUser = (u: any): PublicUser => ({
  id: u.id, username: u.username, name: u.name, role: u.role, color: u.color, photoUrl: u.photo_url || '',
});
const hashPassword = async (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${key.toString('hex')}`;
};
const verifyPassword = async (password: string, stored: string) => {
  const [salt, hex] = (stored || '').split(':');
  if (!salt || !hex) return false;
  const expected = Buffer.from(hex, 'hex');
  const actual = await scrypt(password, salt, expected.length) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const cookieOptions = { httpOnly: true, secure: isProduction, sameSite: 'lax' as const, path: '/', maxAge: SESSION_TTL_MS };
const getToken = (req: express.Request) => {
  const raw = req.headers.cookie || '';
  const item = raw.split(';').map(v => v.trim()).find(v => v.startsWith('qpd_session='));
  return item ? decodeURIComponent(item.slice('qpd_session='.length)) : '';
};
async function getSessionUser(req: express.Request): Promise<PublicUser | null> {
  const token = getToken(req);
  if (!token || !configured()) return null;
  const rows = await supabase<any[]>('dashboard_sessions', { query: `select=user_id,expires_at&token_hash=eq.${sha256(token)}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&limit=1` });
  if (!rows?.length) return null;
  const users = await supabase<any[]>('dashboard_users', { query: `select=id,username,name,role,color,photo_url&id=eq.${encodeURIComponent(rows[0].user_id)}&limit=1` });
  return users?.[0] ? publicUser(users[0]) : null;
}
async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const user = await getSessionUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'يرجى تسجيل الدخول مرة أخرى' });
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('[Auth]', error);
    res.status(503).json({ success: false, error: 'تعذر التحقق من الجلسة' });
  }
}
async function requireManager(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user as PublicUser;
  if (user.role !== 'Quality Manager') return res.status(403).json({ success: false, error: 'غير مصرح بهذه العملية' });
  next();
}
async function initializeSupabase() {
  if (!configured()) {
    console.warn('[Startup] Supabase/auth environment variables are not configured. API will remain unavailable.');
    return;
  }
  const admins = await supabase<any[]>('dashboard_users', { query: 'select=id&username=eq.Dawy&limit=1' });
  if (!admins.length) {
    const password = process.env.INITIAL_ADMIN_PASSWORD;
    if (!password) throw new Error('INITIAL_ADMIN_PASSWORD is required for first-time setup');
    await supabase('dashboard_users', {
      method: 'POST',
      prefer: 'return=minimal',
      body: [{
        id: 'user-manager',
        username: process.env.INITIAL_ADMIN_USERNAME || 'Dawy',
        name: process.env.INITIAL_ADMIN_NAME || 'Mohamed Eldawy',
        role: 'Quality Manager',
        color: 'bg-indigo-600',
        photo_url: null,
        password_hash: await hashPassword(password),
      }],
    });
    console.log('[Startup] Initial manager account created.');
  }
  const existing = await supabase<any[]>('dashboard_state', { query: 'select=id,data,version,updated_by,updated_at&id=eq.1&limit=1' });
  if (!existing.length) {
    await supabase('dashboard_state', {
      method: 'POST', prefer: 'return=minimal',
      body: [{ id: 1, data: { members: state.members, activeMemberId: state.activeMemberId }, version: 1, updated_by: 'النظام' }],
    });
  } else {
    const saved = existing[0];
    state = {
      members: Array.isArray(saved.data?.members) ? saved.data.members : INITIAL_MEMBERS,
      activeMemberId: saved.data?.activeMemberId || INITIAL_MEMBERS[0]?.id || 'm1',
      version: Number(saved.version || 1),
      lastUpdatedBy: saved.updated_by || 'النظام',
      lastUpdatedAt: saved.updated_at ? new Date(saved.updated_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'الآن',
    };
  }
}
async function saveState(updatedBy: string) {
  state.version += 1;
  state.lastUpdatedBy = updatedBy;
  state.lastUpdatedAt = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  await supabase('dashboard_state', {
    method: 'POST',
    query: 'on_conflict=id',
    prefer: 'resolution=merge-duplicates,return=minimal',
    body: [{ id: 1, data: { members: state.members, activeMemberId: state.activeMemberId }, version: state.version, updated_by: updatedBy, updated_at: new Date().toISOString() }],
  });
}

app.get('/api/health', (_req, res) => res.json({ success: true, supabaseConfigured: configured() }));
app.post('/api/login', async (req, res) => {
  try {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');
    if (!username || !password) return res.status(400).json({ success: false, error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
    const users = await supabase<any[]>('dashboard_users', { query: `select=id,username,name,role,color,photo_url,password_hash&username=ilike.${encodeURIComponent(username)}&limit=1` });
    const user = users[0];
    if (!user || !(await verifyPassword(password, user.password_hash))) return res.status(401).json({ success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    const token = randomBytes(32).toString('base64url');
    await supabase('dashboard_sessions', {
      method: 'POST', prefer: 'return=minimal',
      body: [{ token_hash: sha256(token), user_id: user.id, expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString() }],
    });
    res.cookie('qpd_session', token, cookieOptions);
    return res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error('[Login]', error);
    return res.status(503).json({ success: false, error: 'خدمة تسجيل الدخول غير جاهزة. راجع إعدادات السيرفر.' });
  }
});
app.get('/api/session', requireAuth, (req, res) => res.json({ success: true, user: (req as any).user }));
app.post('/api/logout', async (req, res) => {
  try {
    const token = getToken(req);
    if (token && configured()) await supabase('dashboard_sessions', { method: 'DELETE', query: `token_hash=eq.${sha256(token)}`, prefer: 'return=minimal' });
  } catch (error) { console.error('[Logout]', error); }
  res.clearCookie('qpd_session', { httpOnly: true, secure: isProduction, sameSite: 'lax', path: '/' });
  res.json({ success: true });
});
app.get('/api/dashboard', requireAuth, async (_req, res) => {
  try {
    const rows = await supabase<any[]>('dashboard_state', { query: 'select=data,version,updated_by,updated_at&id=eq.1&limit=1' });
    const saved = rows[0];
    if (saved) {
      state = { ...state, ...(saved.data || {}), version: Number(saved.version || 1), lastUpdatedBy: saved.updated_by || 'النظام', lastUpdatedAt: saved.updated_at ? new Date(saved.updated_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'الآن' };
    }
    const users = await supabase<any[]>('dashboard_users', { query: 'select=id,username,name,role,color,photo_url&order=created_at.asc' });
    res.json({ success: true, data: { ...state, users: users.map(publicUser) } });
  } catch (error) {
    console.error('[Dashboard read]', error);
    res.status(503).json({ success: false, error: 'تعذر تحميل بيانات الداشبورد من قاعدة البيانات' });
  }
});
app.post('/api/dashboard', requireAuth, async (req, res) => {
  try {
    if (Array.isArray(req.body?.members)) state.members = req.body.members;
    if (req.body?.activeMemberId) state.activeMemberId = req.body.activeMemberId;
    await saveState((req as any).user.name);
    res.json({ success: true, version: state.version, lastUpdatedBy: state.lastUpdatedBy, lastUpdatedAt: state.lastUpdatedAt });
  } catch (error) {
    console.error('[Dashboard write]', error);
    res.status(503).json({ success: false, error: 'تعذر حفظ التغييرات في قاعدة البيانات' });
  }
});
app.get('/api/users', requireAuth, async (_req, res) => {
  const users = await supabase<any[]>('dashboard_users', { query: 'select=id,username,name,role,color,photo_url&order=created_at.asc' });
  res.json({ success: true, users: users.map(publicUser) });
});
app.post('/api/users', requireAuth, requireManager, async (req, res) => {
  try {
    const u = req.body?.user;
    if (!u?.name?.trim() || !u?.username?.trim()) return res.status(400).json({ success: false, error: 'الاسم واسم المستخدم مطلوبان' });
    const id = u.id || `user-${Date.now()}`;
    const current = await supabase<any[]>('dashboard_users', { query: `select=id,username,name,role,color,photo_url& id=eq.${encodeURIComponent(id)}&limit=1` });
    const payload: any = { id, username: u.username.trim(), name: u.name.trim(), role: u.role || 'Quality Engineer', color: u.color || 'bg-indigo-600', photo_url: u.photoUrl || null, updated_at: new Date().toISOString() };
    if (u.password) payload.password_hash = await hashPassword(String(u.password));
    if (!current.length && !payload.password_hash) return res.status(400).json({ success: false, error: 'كلمة المرور مطلوبة للمستخدم الجديد' });
    await supabase('dashboard_users', { method: 'POST', query: 'on_conflict=id', prefer: 'resolution=merge-duplicates,return=minimal', body: [payload] });
    const users = await supabase<any[]>('dashboard_users', { query: 'select=id,username,name,role,color,photo_url&order=created_at.asc' });
    res.json({ success: true, users: users.map(publicUser) });
  } catch (error) {
    console.error('[User save]', error);
    res.status(503).json({ success: false, error: 'تعذر حفظ المستخدم' });
  }
});
app.delete('/api/users/:id', requireAuth, requireManager, async (req, res) => {
  try {
    if (req.params.id === (req as any).user.id) return res.status(400).json({ success: false, error: 'لا يمكنك حذف حسابك الحالي' });
    await supabase('dashboard_users', { method: 'DELETE', query: `id=eq.${encodeURIComponent(req.params.id)}`, prefer: 'return=minimal' });
    res.json({ success: true });
  } catch (error) {
    console.error('[User delete]', error);
    res.status(503).json({ success: false, error: 'تعذر حذف المستخدم' });
  }
});
app.post('/api/reset', requireAuth, requireManager, async (req, res) => {
  try {
    state.members = INITIAL_MEMBERS;
    state.activeMemberId = INITIAL_MEMBERS[0]?.id || 'm1';
    await saveState((req as any).user.name);
    res.json({ success: true, data: state });
  } catch (error) {
    console.error('[Reset]', error);
    res.status(503).json({ success: false, error: 'تعذر استعادة البيانات الافتراضية' });
  }
});

async function startServer() {
  await initializeSupabase();
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`[Server] Listening on port ${PORT}`));
}
startServer().catch(error => { console.error('[Startup] Fatal error:', error); process.exit(1); });
