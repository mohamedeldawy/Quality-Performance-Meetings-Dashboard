import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { INITIAL_MEMBERS, INITIAL_USERS } from './src/data/initialData.ts';
import { QualityMemberReview, AppUser } from './src/types/dashboard.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Support large payloads for screenshots and PDF reports
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface ServerState {
  members: QualityMemberReview[];
  users: AppUser[];
  activeMemberId: string;
  version: number;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

let serverState: ServerState = {
  members: INITIAL_MEMBERS,
  users: INITIAL_USERS,
  activeMemberId: INITIAL_MEMBERS[0]?.id || 'm1',
  version: 1,
  lastUpdatedBy: 'النظام الافتراضي',
  lastUpdatedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
};

// Load saved data from disk if present
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    serverState = { ...serverState, ...parsed };
    // Ensure users have passwords if migrating from older schema
    serverState.users = serverState.users.map((u) => ({
      ...u,
      username: u.username || u.name.split(' ')[0].toLowerCase(),
      password: u.password || 'password123',
    }));
    console.log('[Server] Loaded persistent database from disk.');
  } catch (err) {
    console.error('[Server] Failed to parse database file, using defaults.', err);
  }
} else {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(serverState, null, 2), 'utf-8');
    console.log('[Server] Initialized new database on disk.');
  } catch (err) {
    console.error('[Server] Failed to write initial database.', err);
  }
}

const persistToDisk = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(serverState, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Error persisting state to disk:', err);
  }
};

// API: Get current dashboard state
app.get('/api/dashboard', (_req, res) => {
  res.json({
    success: true,
    data: serverState,
  });
});

// API: Login verification
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
  }

  const user = serverState.users.find(
    (u) =>
      u.username.trim().toLowerCase() === username.trim().toLowerCase() &&
      u.password === password.trim()
  );

  if (!user) {
    return res.status(401).json({ success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }

  res.json({
    success: true,
    user,
  });
});

// API: Update dashboard members and active member
app.post('/api/dashboard', (req, res) => {
  const { members, activeMemberId, updatedBy } = req.body;

  if (members && Array.isArray(members)) {
    serverState.members = members;
  }
  if (activeMemberId) {
    serverState.activeMemberId = activeMemberId;
  }
  serverState.version += 1;
  serverState.lastUpdatedBy = updatedBy || 'مستخدم الداشبورد';
  serverState.lastUpdatedAt = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  persistToDisk();

  res.json({
    success: true,
    version: serverState.version,
    lastUpdatedBy: serverState.lastUpdatedBy,
    lastUpdatedAt: serverState.lastUpdatedAt,
  });
});

// API: Add or update users
app.post('/api/users', (req, res) => {
  const { user, updatedBy } = req.body;
  if (!user || !user.name || !user.username || !user.password) {
    return res.status(400).json({ error: 'الاسم واسم المستخدم وكلمة المرور مطلوبة' });
  }

  const existingIdx = serverState.users.findIndex((u) => u.id === user.id);
  if (existingIdx >= 0) {
    serverState.users[existingIdx] = user;
  } else {
    serverState.users.push(user);
  }

  serverState.version += 1;
  serverState.lastUpdatedBy = updatedBy || user.name;
  serverState.lastUpdatedAt = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  persistToDisk();

  res.json({
    success: true,
    users: serverState.users,
    version: serverState.version,
  });
});

// API: Delete user
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  if (serverState.users.length <= 1) {
    return res.status(400).json({ error: 'لا يمكن حذف آخر مستخدم' });
  }

  serverState.users = serverState.users.filter((u) => u.id !== id);
  serverState.version += 1;
  persistToDisk();

  res.json({
    success: true,
    users: serverState.users,
  });
});

// API: Reset to initial data
app.post('/api/reset', (_req, res) => {
  serverState = {
    members: INITIAL_MEMBERS,
    users: INITIAL_USERS,
    activeMemberId: INITIAL_MEMBERS[0]?.id || 'm1',
    version: serverState.version + 1,
    lastUpdatedBy: 'استعادة افتراضية',
    lastUpdatedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
  };

  persistToDisk();

  res.json({
    success: true,
    data: serverState,
  });
});

// Serve frontend: Vite middlewares in dev, static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Server] Dashboard running at http://0.0.0.0:${PORT} in ${isProduction ? 'production' : 'development'} mode.`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
});
