import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');

// Root এবং data দুই জায়গার পাথ সাপোর্ট করার জন্য
const ROOT_DB_FILE = path.resolve(process.cwd(), 'database.json');
let DB_FILE = path.join(DATA_DIR, 'database.json');

// যদি রুটে database.json থাকে তবে সেটাই মেইন ডাটাবেজ হিসেবে ব্যবহার হবে
if (fs.existsSync(ROOT_DB_FILE)) {
  DB_FILE = ROOT_DB_FILE;
}

const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads');

// Ensure data directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// যদি data ফোল্ডারে ফাইল না থাকে কিন্তু রুটে থাকে, তবে কপি করে সিঙ্ক রাখা হবে
if (fs.existsSync(ROOT_DB_FILE) && !fs.existsSync(path.join(DATA_DIR, 'database.json'))) {
  try {
    fs.copyFileSync(ROOT_DB_FILE, path.join(DATA_DIR, 'database.json'));
  } catch {}
}

app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));

// Trust reverse proxy for Cloud Run, Cloudflare, Nginx, and custom domains
app.set('trust proxy', true);

// Enable CORS and custom domain header support
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-session-token');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const DESIGNATED_SUPER_ADMIN_ID = '01936988967';

const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Server-side active authenticated session cache
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
          if (s && s.token) {
            activeSessions.set(s.token, s);
          }
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

// Initial session load
loadSessionsFromFile();

/**
 * Backend middleware: validates session token for protected routes
 */
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (req.headers['x-session-token'] as string) || '';

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  // Reload sessions from disk if token not in current memory
  if (!activeSessions.has(token)) {
    loadSessionsFromFile();
  }

  const session = activeSessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  // Session expiry check: 7 days
  const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - session.createdAt > SESSION_MAX_AGE) {
    activeSessions.delete(token);
    saveSessionsToFile();
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  (req as any).user = session;
  return next();
}

/**
 * Middleware: Strictly requires Administrator authorization (Super Admin or School Administrator)
 */
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  requireAuth(req, res, () => {
    const session = (req as any).user as ActiveSession;
    const allowedRoles = ['Super Admin', 'School Administrator'];
    if (!allowedRoles.includes(session.role)) {
      return res.status(403).json({ error: 'Forbidden: Administrator privileges required for this action.' });
    }
    return next();
  });
}

/**
 * Helper: gets current authenticated session if token present, without throwing
 */
function getOptionalAuth(req: express.Request): ActiveSession | null {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (req.headers['x-session-token'] as string) || '';

  if (!token) return null;
  if (!activeSessions.has(token)) {
    loadSessionsFromFile();
  }
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

/**
 * Helper: checks if database file exists in root or data
 */
function getActiveDbPath(): string {
  if (fs.existsSync(ROOT_DB_FILE)) return ROOT_DB_FILE;
  if (fs.existsSync(path.join(DATA_DIR, 'database.json'))) return path.join(DATA_DIR, 'database.json');
  return ROOT_DB_FILE;
}

/**
 * Backend enforcement: strictly ensures exactly one Super Admin exists
 */
function sanitizeUsers(users: any[]): any[] {
  if (!Array.isArray(users)) return [];
  let foundSuperAdmin = false;

  const activePath = getActiveDbPath();
  let diskPassword = '';
  if (fs.existsSync(activePath)) {
    try {
      const diskDb = JSON.parse(fs.readFileSync(activePath, 'utf-8'));
      const foundDiskUser = (diskDb.users || []).find((du: any) =>
        du.username === DESIGNATED_SUPER_ADMIN_ID || du.id === 'usr-mirabul'
      );
      if (foundDiskUser && foundDiskUser.password) {
        diskPassword = foundDiskUser.password;
      }
    } catch {}
  }

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
        password: u.password || diskPassword || hashPassword('420mirabul420')
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
      password: diskPassword || hashPassword('420mirabul420'),
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
        if (uPhone.endsWith(partDigits.slice(-10)) || uUserNumeric.endsWith(partDigits.slice(-10))) {
          return u;
        }
      }
    }

    const numericId = cleanId.replace(/\D/g, '');
    if (numericId.length >= 10) {
      const last10 = numericId.slice(-10);
      if (uPhone.endsWith(last10) || uUserNumeric.endsWith(last10)) {
        return u;
      }
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
        if (prefixParts.length >= 3) {
          iterations = parseInt(prefixParts[2], 10) || 100000;
        }
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

  if (stored.startsWith('scrypt:')) {
    try {
      const parts = stored.split('$');
      if (parts.length === 3) {
        const configParts = parts[0].split(':');
        const N = parseInt(configParts[1], 10) || 32768;
        const r = parseInt(configParts[2], 10) || 8;
        const p = parseInt(configParts[3], 10) || 1;
        const salt = parts[1];
        const hash = parts[2];
        const attemptHash = crypto.scryptSync(attempt, salt, Buffer.from(hash, 'hex').length, { N, r, p }).toString('hex');
        return crypto.timingSafeEqual(Buffer.from(attemptHash, 'hex'), Buffer.from(hash, 'hex'));
      }
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

const otpRateLimits = new Map<string, { count: number; lastRequestTime: number; lockedUntil?: number }>();
const loginRateLimits = new Map<string, { failedCount: number; lockedUntil?: number }>();

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

interface MailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

async function sendOtpEmail(recipientEmail: string, otpCode: string, recipientName: string): Promise<MailResult> {
  const host = (process.env.SMTP_HOST || '').replace(/[^\x20-\x7E]/g, '').trim();
  const port = parseInt((process.env.SMTP_PORT || '587').replace(/\D/g, ''), 10);
  const user = (process.env.SMTP_USER || '').replace(/[^\x20-\x7E]/g, '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/[\r\n]/g, '').trim();
  const rawFrom = (process.env.SMTP_FROM || '').replace(/[^\x20-\x7E]/g, '').trim();
  const from = rawFrom || `"E-Biddalay School Management" <${user || 'no-reply@ebiddalay.edu.bd'}>`;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!host || !user || !pass) {
    return {
      success: false,
      error: 'SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) not configured in environment.'
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const info = await transporter.sendMail({
      from,
      to: recipientEmail,
      subject: 'E-Biddalay Password Recovery OTP Code',
      text: `Hello ${recipientName},\n\nYour one-time verification code for password recovery is: ${otpCode}\n\nThis code will expire in 5 minutes.\n\nRegards,\nE-Biddalay School Management System`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #1e3a8a; margin: 0; font-size: 20px;">E-Biddalay School Management</h2>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Institutional Portal Password Recovery</p>
          </div>
          <p style="font-size: 14px; color: #334155;">Dear <strong>${recipientName}</strong>,</p>
          <p style="font-size: 14px; color: #334155; line-height: 1.5;">
            Use the following 6-digit verification code to reset your account password:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <span style="display: inline-block; font-family: monospace, Courier; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 12px 28px; background-color: #f1f5f9; color: #1e40af; border: 2px dashed #93c5fd; border-radius: 8px;">
              ${otpCode}
            </span>
          </div>
          <p style="font-size: 12px; color: #e11d48; text-align: center; font-weight: bold;">
            ⏱ This code is valid for 5 minutes and single-use only.
          </p>
        </div>
      `
    });

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (err: any) {
    console.error('SMTP email dispatch error:', err);
    return {
      success: false,
      error: err.message || 'Failed to connect to SMTP server'
    };
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Authentication: Login endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please provide both User ID and Password.' });
    }

    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const rateKey = `${clientIp}_${String(identifier).trim().toLowerCase()}`;
    const rateInfo = loginRateLimits.get(rateKey);

    if (rateInfo && rateInfo.lockedUntil && rateInfo.lockedUntil > Date.now()) {
      const waitSeconds = Math.ceil((rateInfo.lockedUntil - Date.now()) / 1000);
      return res.status(429).json({
        error: `Too many failed login attempts. Please try again in ${waitSeconds} seconds.`
      });
    }

    const targetDbPath = getActiveDbPath();
    if (!fs.existsSync(targetDbPath)) {
      return res.status(500).json({ error: 'Database is not initialized yet.' });
    }

    const db = JSON.parse(fs.readFileSync(targetDbPath, 'utf-8'));
    const users = sanitizeUsers(db.users || []);
    const cleanPass = String(password).trim();
    const matchedUser = findMatchingUser(users, identifier);

    if (!matchedUser) {
      const currentFailed = (rateInfo?.failedCount || 0) + 1;
      const lockedUntil = currentFailed >= 5 ? Date.now() + 5 * 60 * 1000 : undefined;
      loginRateLimits.set(rateKey, { failedCount: currentFailed, lockedUntil });
      return res.status(401).json({ error: 'Invalid User ID, Mobile Number, or Email.' });
    }

    if (matchedUser.status !== 'active') {
      return res.status(403).json({ error: 'This account is suspended or inactive.' });
    }

    const isPasswordValid = verifyPassword(cleanPass, matchedUser.password || '');
    if (!isPasswordValid) {
      const currentFailed = (rateInfo?.failedCount || 0) + 1;
      const lockedUntil = currentFailed >= 5 ? Date.now() + 5 * 60 * 1000 : undefined;
      loginRateLimits.set(rateKey, { failedCount: currentFailed, lockedUntil });
      return res.status(401).json({ error: 'Incorrect password. Click "Forgot Password" to recover.' });
    }

    loginRateLimits.delete(rateKey);

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
    return res.json({
      success: true,
      token,
      user: safeUser
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal error during authentication' });
  }
});

// -----------------------------------------------------------------------------
// FORGOT PASSWORD: STEP A & B - REQUEST OTP
// -----------------------------------------------------------------------------
app.post('/api/auth/forgot-password/request', async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'Please enter your registered User ID, Mobile Number, or Email.' });
    }

    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const rateKey = `otp_${clientIp}_${String(identifier).trim().toLowerCase()}`;
    const rateInfo = otpRateLimits.get(rateKey);

    if (rateInfo) {
      if (rateInfo.lockedUntil && rateInfo.lockedUntil > Date.now()) {
        const waitMins = Math.ceil((rateInfo.lockedUntil - Date.now()) / 60000);
        return res.status(429).json({
          error: `Too many password reset requests. Please wait ${waitMins} minutes before requesting another code.`
        });
      }
      if (Date.now() - rateInfo.lastRequestTime < 60000) {
        const cooldownRemaining = Math.ceil((60000 - (Date.now() - rateInfo.lastRequestTime)) / 1000);
        return res.status(429).json({
          error: `Please wait ${cooldownRemaining} seconds before requesting a new verification code.`
        });
      }
    }

    const targetDbPath = getActiveDbPath();
    if (!fs.existsSync(targetDbPath)) {
      return res.status(500).json({ error: 'Database is not initialized yet.' });
    }

    const db = JSON.parse(fs.readFileSync(targetDbPath, 'utf-8'));
    const users = sanitizeUsers(db.users || []);
    const matchedUser = findMatchingUser(users, identifier);

    const currentCount = (rateInfo?.count || 0) + 1;
    const lockedUntil = currentCount >= 4 ? Date.now() + 15 * 60 * 1000 : undefined;
    otpRateLimits.set(rateKey, { count: currentCount, lastRequestTime: Date.now(), lockedUntil });

    if (!matchedUser) {
      return res.json({
        success: true,
        genericNotice: true,
        message: 'If an account matching those credentials exists, a one-time verification code has been dispatched to the registered recovery email.'
      });
    }

    if (matchedUser.status !== 'active') {
      return res.status(403).json({ error: 'This administrator account is inactive.' });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const sessionId = crypto.randomBytes(16).toString('hex');
    const otpHash = hashOtp(otp, sessionId);

    const smtpHost = (process.env.SMTP_HOST || '').replace(/[^\x20-\x7E]/g, '').trim();
    const smtpUser = (process.env.SMTP_USER || '').replace(/[^\x20-\x7E]/g, '').trim();
    const smtpPass = (process.env.SMTP_PASS || '').trim();
    const hasSmtp = !!(smtpHost && smtpUser && smtpPass);

    if (hasSmtp) {
      const mailRes = await sendOtpEmail(matchedUser.email, otp, matchedUser.fullName || matchedUser.username);
      if (!mailRes.success) {
        return res.status(502).json({
          error: `Failed to deliver OTP to registered email: ${mailRes.error}. Please check SMTP configuration.`
        });
      }
    }

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
      providerConfigured: hasSmtp
    });

    const maskedEmail = maskEmail(matchedUser.email);
    const isDev = process.env.NODE_ENV !== 'production' && !hasSmtp;

    return res.json({
      success: true,
      resetSessionId: sessionId,
      maskedEmail,
      deliveryMethod: 'email',
      providerConfigured: hasSmtp,
      cooldownSeconds: 60,
      expiresInSeconds: 300,
      message: hasSmtp
        ? 'A 6-digit verification code has been dispatched to your registered recovery email address.'
        : 'One-time verification code generated.',
      ...(isDev ? { devCode: otp } : {})
    });
  } catch (err: any) {
    console.error('OTP request error:', err);
    return res.status(500).json({ error: 'Failed to process password recovery request.' });
  }
});

// -----------------------------------------------------------------------------
// FORGOT PASSWORD: STEP C - VERIFY OTP
// -----------------------------------------------------------------------------
app.post('/api/auth/forgot-password/verify', (req, res) => {
  try {
    const { resetSessionId, otp } = req.body;
    if (!resetSessionId || !otp) {
      return res.status(400).json({ error: 'Please provide both the session ID and the 6-digit verification code.' });
    }

    const session = activeOtpSessions.get(resetSessionId);
    if (!session) {
      return res.status(400).json({ error: 'Verification session has expired or is invalid. Please request a new code.' });
    }

    if (Date.now() > session.expiresAt) {
      activeOtpSessions.delete(resetSessionId);
      return res.status(400).json({ error: 'The verification code has expired. Please request a new code.' });
    }

    if (session.attempts >= 5) {
      activeOtpSessions.delete(resetSessionId);
      return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new code.' });
    }

    session.attempts += 1;

    const attemptHash = hashOtp(String(otp).trim(), resetSessionId);
    let isMatch = false;
    try {
      isMatch = crypto.timingSafeEqual(Buffer.from(attemptHash), Buffer.from(session.otpHash));
    } catch {
      isMatch = false;
    }

    if (!isMatch) {
      const remaining = 5 - session.attempts;
      return res.status(400).json({
        error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        remainingAttempts: remaining
      });
    }

    activeOtpSessions.delete(resetSessionId);

    const resetToken = crypto.randomBytes(32).toString('hex');
    activePasswordResetTokens.set(resetToken, {
      token: resetToken,
      userId: session.userId,
      username: session.username,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    return res.json({
      success: true,
      resetToken,
      message: 'Verification code confirmed. You may now set your new password.'
    });
  } catch (err: any) {
    console.error('OTP verify error:', err);
    return res.status(500).json({ error: 'Failed to verify OTP code.' });
  }
});

// -----------------------------------------------------------------------------
// FORGOT PASSWORD: STEP D - SET NEW PASSWORD
// -----------------------------------------------------------------------------
app.post('/api/auth/forgot-password/reset', (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;
    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    const resetRecord = activePasswordResetTokens.get(resetToken);
    if (!resetRecord) {
      return res.status(400).json({ error: 'Password reset authorization has expired or is invalid.' });
    }

    if (Date.now() > resetRecord.expiresAt) {
      activePasswordResetTokens.delete(resetToken);
      return res.status(400).json({ error: 'Password reset authorization has expired.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirmation do not match.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const targetDbPath = getActiveDbPath();
    if (!fs.existsSync(targetDbPath)) {
      return res.status(500).json({ error: 'Database is not initialized yet.' });
    }

    const db = JSON.parse(fs.readFileSync(targetDbPath, 'utf-8'));
    const userIndex = (db.users || []).findIndex((u: any) => u.id === resetRecord.userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const hashedPassword = hashPassword(newPassword);
    db.users[userIndex].password = hashedPassword;

    activePasswordResetTokens.delete(resetToken);

    for (const [token, session] of activeSessions.entries()) {
      if (session.userId === resetRecord.userId) {
        activeSessions.delete(token);
      }
    }
    saveSessionsToFile();

    fs.writeFileSync(targetDbPath, JSON.stringify(db, null, 2), 'utf-8');

    return res.json({
      success: true,
      message: 'Your password has been reset successfully. Please log in with your new password.'
    });
  } catch (err: any) {
    console.error('Password reset error:', err);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// Authentication: Verify session endpoint
app.get('/api/auth/verify', (req, res) => {
  const session = getOptionalAuth(req);
  if (!session) {
    return res.status(401).json({ authenticated: false, error: 'Not authenticated' });
  }

  const targetDbPath = getActiveDbPath();
  if (fs.existsSync(targetDbPath)) {
    const db = JSON.parse(fs.readFileSync(targetDbPath, 'utf-8'));
    const users = sanitizeUsers(db.users || []);
    const user = users.find((u: any) => u.id === session.userId && u.status === 'active');
    if (user) {
      const { password: _, ...safeUser } = user;
      return res.json({ authenticated: true, user: safeUser });
    }
  }

  activeSessions.delete(session.token);
  saveSessionsToFile();
  return res.status(401).json({ authenticated: false, error: 'User account not found' });
});

// Authentication: Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (req.headers['x-session-token'] as string) || '';

  if (token) {
    activeSessions.delete(token);
    saveSessionsToFile();
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

// File upload endpoint
app.post('/api/upload', requireAuth, (req, res) => {
  try {
    const { fileName, fileType, fileData } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'Missing fileName or fileData' });
    }

    let base64Content = fileData;
    if (fileData.includes(';base64,')) {
      base64Content = fileData.split(';base64,')[1];
    }

    const buffer = Buffer.from(base64Content, 'base64');
    if (buffer.length > 25 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds maximum limit of 25MB' });
    }

    const ext = path.extname(fileName).toLowerCase();
    const sanitizedBase = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    const uniqueFileName = `${Date.now()}_${sanitizedBase}${ext}`;
    const targetPath = path.join(UPLOAD_DIR, uniqueFileName);

    fs.writeFileSync(targetPath, buffer);

    return res.json({
      success: true,
      url: `/uploads/${uniqueFileName}`,
      fileName,
      storedName: uniqueFileName
    });
  } catch (err: any) {
    console.error('Error uploading file:', err);
    return res.status(500).json({ error: 'Failed to process file upload' });
  }
});

// Get synchronized database from server
app.get('/api/db', (req, res) => {
  try {
    const targetDbPath = getActiveDbPath();
    if (fs.existsSync(targetDbPath)) {
      const data = fs.readFileSync(targetDbPath, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.users)) {
        parsed.users = sanitizeUsers(parsed.users);
      }

      delete parsed.currentUser;
      delete parsed.isAuthenticated;

      const session = getOptionalAuth(req);
      if (!session) {
        parsed.users = parsed.users.map((u: any) => {
          const { password: _, ...safeUser } = u;
          return safeUser;
        });
      }

      return res.json(parsed);
    }
    return res.status(404).json({ message: 'No server database found yet' });
  } catch (err: any) {
    console.error('Error reading database file:', err);
    return res.status(500).json({ error: 'Failed to read database file' });
  }
});

// Save updated database to server
app.post('/api/db', requireAuth, (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid database payload' });
    }

    delete body.currentUser;
    delete body.isAuthenticated;

    const targetDbPath = getActiveDbPath();
    if (fs.existsSync(targetDbPath)) {
      try {
        const diskDb = JSON.parse(fs.readFileSync(targetDbPath, 'utf-8'));
        if (Array.isArray(diskDb.users) && Array.isArray(body.users)) {
          const diskPwMap = new Map<string, string>();
          diskDb.users.forEach((u: any) => {
            if (u.id && u.password) diskPwMap.set(u.id, u.password);
            if (u.username && u.password) diskPwMap.set(u.username, u.password);
          });

          body.users = body.users.map((clientUser: any) => {
            const diskPassword = diskPwMap.get(clientUser.id) || diskPwMap.get(clientUser.username);
            return diskPassword ? { ...clientUser, password: diskPassword } : clientUser;
          });
        }
      } catch (mergeErr) {}
    }

    if (Array.isArray(body.users)) {
      body.users = sanitizeUsers(body.users);
    }

    fs.writeFileSync(targetDbPath, JSON.stringify(body, null, 2), 'utf-8');
    return res.json({ success: true, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error('Error saving database file:', err);
    return res.status(500).json({ error: 'Failed to save database file' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`E-Biddalay Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
