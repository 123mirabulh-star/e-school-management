import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = Number(process.env.PORT) || 8080;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const ROOT_DB_FILE = path.resolve(process.cwd(), 'database.json');
let DB_FILE = path.join(DATA_DIR, 'database.json');

if (fs.existsSync(ROOT_DB_FILE)) {
  DB_FILE = ROOT_DB_FILE;
}

const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));
app.set('trust proxy', true);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-session-token');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// MongoDB Connection Setup
const MONGODB_URI = process.env.MONGODB_URI || '';
let mongoClient: MongoClient | null = null;
let mongoDbInstance: any = null;

async function initMongo() {
  if (!MONGODB_URI) {
    console.log('No MONGODB_URI provided. Running on local JSON file.');
    return;
  }
  try {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    mongoDbInstance = mongoClient.db('ebiddalay_db');
    console.log('Successfully connected to MongoDB Atlas Cloud Database!');
    
    // Auto-seed from database.json if MongoDB is brand new
    const col = mongoDbInstance.collection('app_state');
    const existing = await col.findOne({ _id: 'main_database' });
    if (!existing && fs.existsSync(getActiveDbPath())) {
      try {
        const fileData = JSON.parse(fs.readFileSync(getActiveDbPath(), 'utf-8'));
        await col.updateOne({ _id: 'main_database' }, { $set: { data: fileData } }, { upsert: true });
        console.log('Initial data migrated from local JSON to MongoDB Atlas successfully.');
      } catch (e) {
        console.error('Migration error:', e);
      }
    }
  } catch (err: any) {
    console.error('MongoDB Atlas Connection Error:', err.message);
  }
}

const DESIGNATED_SUPER_ADMIN_ID = '01936988967';
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

interface ActiveSession {
  token: string;
  userId: string;
  username: string;
  role: string;
  fullName: string;
  createdAt: number;
}
const activeSessions = new Map<string, ActiveSession>();

function loadSessionsFromFile() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      const sessionsArray: ActiveSession[] = JSON.parse(data);
      if (Array.isArray(sessionsArray)) {
        sessionsArray.forEach(s => {
          if (s && s.token) activeSessions.set(s.token, s);
        });
      }
    }
  } catch (err) {
    console.warn('Could not load sessions file:', err);
  }
}

function saveSessionsToFile() {
  try {
    const list = Array.from(activeSessions.values());
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not save sessions file:', err);
  }
}

loadSessionsFromFile();

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (req.headers['x-session-token'] as string) || '';

  if (!token) return res.status(401).json({ error: 'Authentication required. Please log in.' });
  if (!activeSessions.has(token)) loadSessionsFromFile();

  const session = activeSessions.get(token);
  if (!session) return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });

  const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - session.createdAt > SESSION_MAX_AGE) {
    activeSessions.delete(token);
    saveSessionsToFile();
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  (req as any).user = session;
  return next();
}

function getOptionalAuth(req: express.Request): ActiveSession | null {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (req.headers['x-session-token'] as string) || '';

  if (!token) return null;
  if (!activeSessions.has(token)) loadSessionsFromFile();
  const session = activeSessions.get(token);
  if (!session) return null;

  const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - session.createdAt > SESSION_MAX_AGE) {
    activeSessions.delete(token);
    saveSessionsToFile();
    return null;
  }
  return session;
}

function getActiveDbPath(): string {
  if (fs.existsSync(ROOT_DB_FILE)) return ROOT_DB_FILE;
  if (fs.existsSync(path.join(DATA_DIR, 'database.json'))) return path.join(DATA_DIR, 'database.json');
  return ROOT_DB_FILE;
}

function sanitizeUsers(users: any[]): any[] {
  if (!Array.isArray(users)) return [];
  let foundSuperAdmin = false;

  const result = users.map(u => {
    const isDesignated =
      u.username === DESIGNATED_SUPER_ADMIN_ID ||
      u.mobileNumber === DESIGNATED_SUPER_ADMIN_ID ||
      (u.email && (String(u.email).toLowerCase() === '123mirabulh@gmail.com' || String(u.email).toLowerCase() === 'mirabul@schoolportal.com'));
    if (isDesignated) {
      foundSuperAdmin = true;
      return {
        ...u,
        username: DESIGNATED_SUPER_ADMIN_ID,
        fullName: u.fullName || 'Md. Mirabul Hossen',
        role: 'Super Admin',
        email: '123mirabulh@gmail.com',
        mobileNumber: DESIGNATED_SUPER_ADMIN_ID,
        isMasterAdmin: true,
        status: 'active',
        password: u.password || hashPassword('420mirabul420')
      };
    }

    if (u.role === 'Super Admin') {
      return {
        ...u,
        role: 'School Administrator',
        isMasterAdmin: false
      };
    }
    return u;
  });

  if (!foundSuperAdmin) {
    result.unshift({
      id: 'usr-mirabul',
      username: DESIGNATED_SUPER_ADMIN_ID,
      password: hashPassword('420mirabul420'),
      fullName: 'Md. Mirabul Hossen',
      role: 'Super Admin',
      email: '123mirabulh@gmail.com',
      mobileNumber: DESIGNATED_SUPER_ADMIN_ID,
      instituteName: 'Central Administration & Master Control',
      studentLimit: 10000,
      status: 'active',
      isMasterAdmin: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });
  }

  return result;
}

function findMatchingUser(users: any[], rawIdentifier: string): any | undefined {
  if (!rawIdentifier || !Array.isArray(users)) return undefined;
  const cleanId = String(rawIdentifier).trim().toLowerCase();
  const parts = cleanId.split(/[\s+,/]+/).filter(Boolean);

  for (const u of users) {
    const uUsername = String(u.username || '').toLowerCase();
    const uEmail = String(u.email || '').toLowerCase();
    const uPhone = String(u.mobileNumber || '').replace(/\D/g, '');
    const uUserNumeric = uUsername.replace(/\D/g, '');

    if (uUsername === cleanId || uEmail === cleanId) return u;

    if (u.username === DESIGNATED_SUPER_ADMIN_ID || u.mobileNumber === DESIGNATED_SUPER_ADMIN_ID) {
      if (cleanId === '123mirabulh@gmail.com' || cleanId === 'mirabul@schoolportal.com') return u;
      if (cleanId.includes('123mirabulh@gmail.com') || cleanId.includes(DESIGNATED_SUPER_ADMIN_ID)) return u;
    }

    for (const part of parts) {
      if (part === uUsername || part === uEmail) return u;
      const partDigits = part.replace(/\D/g, '');
      if (partDigits.length >= 10) {
        if (uPhone.endsWith(partDigits.slice(-10)) || uUserNumeric.endsWith(partDigits.slice(-10))) return u;
      }
    }

    const numericId = cleanId.replace(/\D/g, '');
    if (numericId.length >= 10) {
      const last10 = numericId.slice(-10);
      if (uPhone.endsWith(last10) || uUserNumeric.endsWith(last10)) return u;
    }
  }

  return undefined;
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
  return `pbkdf2:sha256:100000$${salt}$${hash}`;
}

function verifyPassword(attempt: string, stored: string): boolean {
  if (!stored || !attempt) return false;

  if (stored.startsWith('pbkdf2:sha256:') || stored.startsWith('pbkdf2$')) {
    try {
      const parts = stored.split('$');
      let iterations = 100000;
      let salt = '';
      let hash = '';
      if (parts.length === 3) {
        const prefixParts = parts[0].split(':');
        if (prefixParts.length >= 3) iterations = parseInt(prefixParts[2], 10) || 100000;
        salt = parts[1];
        hash = parts[2];
      } else if (parts.length === 4) {
        iterations = parseInt(parts[1], 10) || 100000;
        salt = parts[2];
        hash = parts[3];
      }
      const attemptHash = crypto.pbkdf2Sync(attempt, salt, iterations, Buffer.from(hash, 'hex').length, 'sha256').toString('hex');
      return crypto.timingSafeEqual(Buffer.from(attemptHash, 'hex'), Buffer.from(hash, 'hex'));
    } catch {
      return false;
    }
  }

  try {
    const attemptBuf = Buffer.from(attempt);
    const storedBuf = Buffer.from(stored);
    if (attemptBuf.length === storedBuf.length) {
      return crypto.timingSafeEqual(attemptBuf, storedBuf);
    }
  } catch {}
  return attempt === stored;
}

interface OtpSession {
  sessionId: string;
  userId: string;
  username: string;
  email: string;
  otpHash: string;
  attempts: number;
  expiresAt: number;
  createdAt: number;
  deliveryMethod: 'email';
  providerConfigured: boolean;
}
const activeOtpSessions = new Map<string, OtpSession>();

interface ResetTokenRecord {
  token: string;
  userId: string;
  username: string;
  expiresAt: number;
}
const activePasswordResetTokens = new Map<string, ResetTokenRecord>();

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '******';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

const OTP_SECRET = process.env.OTP_SECRET || 'ebiddalay_otp_hmac_secret_key_2026';
function hashOtp(otp: string, sessionId: string): string {
  return crypto.createHmac('sha256', OTP_SECRET).update(`${sessionId}:${otp}`).digest('hex');
}

async function getFullDb(): Promise<any> {
  if (mongoDbInstance) {
    try {
      const doc = await mongoDbInstance.collection('app_state').findOne({ _id: 'main_database' });
      if (doc && doc.data) return doc.data;
    } catch (e) {
      console.error('Error reading from MongoDB, fallback to disk:', e);
    }
  }
  const targetDbPath = getActiveDbPath();
  if (fs.existsSync(targetDbPath)) {
    return JSON.parse(fs.readFileSync(targetDbPath, 'utf-8'));
  }
  return null;
}

async function saveFullDb(data: any): Promise<void> {
  const targetDbPath = getActiveDbPath();
  try {
    fs.writeFileSync(targetDbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (fsErr) {
    console.warn('Warning: Could not write local file backup (ignorable on cloud):', fsErr);
  }

  if (mongoDbInstance) {
    try {
      await mongoDbInstance.collection('app_state').updateOne(
        { _id: 'main_database' },
        { $set: { data, updatedAt: new Date() } },
        { upsert: true }
      );
    } catch (e) {
      console.error('Error saving to MongoDB:', e);
    }
  }
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    databaseType: mongoDbInstance ? 'MongoDB Atlas' : 'Local JSON'
  });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ error: 'Please provide both User ID and Password.' });

    const db = await getFullDb();
    if (!db) return res.status(500).json({ error: 'Database is not initialized yet.' });

    const users = sanitizeUsers(db.users || []);
    const cleanPass = String(password).trim();
    const matchedUser = findMatchingUser(users, identifier);

    if (!matchedUser) return res.status(401).json({ error: 'Invalid User ID, Mobile Number, or Email.' });
    if (matchedUser.status !== 'active') return res.status(403).json({ error: 'This account is suspended or inactive.' });

    const isPasswordValid = verifyPassword(cleanPass, matchedUser.password || '');
    if (!isPasswordValid) return res.status(401).json({ error: 'Incorrect password. Click "Forgot Password" to recover.' });

    const token = crypto.randomBytes(32).toString('hex');
    const session: ActiveSession = {
      token,
      userId: matchedUser.id,
      username: matchedUser.username,
      role: matchedUser.role,
      fullName: matchedUser.fullName,
      createdAt: Date.now()
    };
    activeSessions.set(token, session);
    saveSessionsToFile();

    const { password: _, ...safeUser } = matchedUser;
    return res.json({ success: true, token, user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal error during authentication' });
  }
});

app.post('/api/auth/forgot-password/request', async (req, res) => {
  try {
    const { identifier } = req.body;
    const db = await getFullDb();
    if (!db) return res.status(500).json({ error: 'Database is not initialized yet.' });

    const users = sanitizeUsers(db.users || []);
    const matchedUser = findMatchingUser(users, identifier);

    if (!matchedUser) {
      return res.json({
        success: true,
        genericNotice: true,
        message: 'If an account exists, a code has been generated.'
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const sessionId = crypto.randomBytes(16).toString('hex');
    const otpHash = hashOtp(otp, sessionId);

    activeOtpSessions.set(sessionId, {
      sessionId,
      userId: matchedUser.id,
      username: matchedUser.username,
      email: matchedUser.email || '',
      otpHash,
      attempts: 0,
      expiresAt: Date.now() + 5 * 60 * 1000,
      createdAt: Date.now(),
      deliveryMethod: 'email',
      providerConfigured: true
    });

    return res.json({
      success: true,
      resetSessionId: sessionId,
      maskedEmail: maskEmail(matchedUser.email),
      cooldownSeconds: 60,
      expiresInSeconds: 300,
      message: `Your 6-digit recovery OTP code is: ${otp}`,
      devCode: otp
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to process request.' });
  }
});

app.post('/api/auth/forgot-password/verify', (req, res) => {
  try {
    const { resetSessionId, otp } = req.body;
    const session = activeOtpSessions.get(resetSessionId);
    if (!session || Date.now() > session.expiresAt) {
      return res.status(400).json({ error: 'Code expired or invalid.' });
    }

    const attemptHash = hashOtp(String(otp).trim(), resetSessionId);
    if (attemptHash !== session.otpHash) {
      return res.status(400).json({ error: 'Incorrect verification code.' });
    }

    activeOtpSessions.delete(resetSessionId);
    const resetToken = crypto.randomBytes(32).toString('hex');
    activePasswordResetTokens.set(resetToken, {
      token: resetToken,
      userId: session.userId,
      username: session.username,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    return res.json({ success: true, resetToken });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to verify OTP.' });
  }
});

app.post('/api/auth/forgot-password/reset', async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;
    const resetRecord = activePasswordResetTokens.get(resetToken);
    if (!resetRecord || Date.now() > resetRecord.expiresAt) {
      return res.status(400).json({ error: 'Reset link expired.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const db = await getFullDb();
    const userIndex = (db.users || []).findIndex((u: any) => u.id === resetRecord.userId);
    if (userIndex !== -1) {
      db.users[userIndex].password = hashPassword(newPassword);
      await saveFullDb(db);
    }
    activePasswordResetTokens.delete(resetToken);

    return res.json({ success: true, message: 'Password reset successful.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

app.get('/api/auth/verify', async (req, res) => {
  const session = getOptionalAuth(req);
  if (!session) return res.status(401).json({ authenticated: false });

  const db = await getFullDb();
  if (db) {
    const users = sanitizeUsers(db.users || []);
    const user = users.find((u: any) => u.id === session.userId && u.status === 'active');
    if (user) {
      const { password: _, ...safeUser } = user;
      return res.json({ authenticated: true, user: safeUser });
    }
  }
  return res.status(401).json({ authenticated: false });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (token) activeSessions.delete(token);
  return res.json({ success: true });
});

// Image and PDF Upload endpoint
app.post('/api/upload', (req, res) => {
  try {
    const { fileName, fileData } = req.body;
    if (!fileName || !fileData) return res.status(400).json({ error: 'Missing file data' });

    let permanentUrl = fileData;

    if (!fileData.startsWith('data:')) {
      const ext = path.extname(fileName || '').toLowerCase();
      let mimeType = 'application/octet-stream';

      if (ext === '.pdf') mimeType = 'application/pdf';
      else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      else if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.webp') mimeType = 'image/webp';
      else if (ext === '.svg') mimeType = 'image/svg+xml';
      else if (ext === '.gif') mimeType = 'image/gif';

      permanentUrl = `data:${mimeType};base64,${fileData}`;
    }

    return res.json({ success: true, url: permanentUrl });
  } catch (err: any) {
    console.error('Upload handler error:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/db', async (req, res) => {
  try {
    const parsed = await getFullDb();
    if (parsed) {
      if (Array.isArray(parsed.users)) parsed.users = sanitizeUsers(parsed.users);
      delete parsed.currentUser;
      delete parsed.isAuthenticated;
      return res.json(parsed);
    }
    return res.status(404).json({ message: 'No database found' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to read database' });
  }
});

app.post('/api/db', async (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Invalid payload' });

    delete body.currentUser;
    delete body.isAuthenticated;

    if (Array.isArray(body.users)) body.users = sanitizeUsers(body.users);
    await saveFullDb(body);

    return res.json({ success: true, timestamp: new Date().toISOString() });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to save database' });
  }
});

async function startServer() {
  await initMongo();

  const distPath = path.resolve(process.cwd(), 'dist');
  const hasDist = fs.existsSync(distPath);

  // If built dist exists, serve production files to prevent Out-Of-Memory (OOM)
  if (hasDist) {
    console.log('Serving production static build from dist folder...');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Standard Vite setup without problematic options
    console.log('Starting standard Vite development mode...');
    const vite = await createViteServer({
      server: {
        middlewareMode: true
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
