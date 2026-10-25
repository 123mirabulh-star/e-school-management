import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
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
 * Backend enforcement: strictly ensures exactly one Super Admin exists
 * (User ID: 01936988967 - Md. Mirabul Hossen)
 */
function sanitizeUsers(users: any[]): any[] {
  if (!Array.isArray(users)) return [];
  let foundSuperAdmin = false;

  // Retrieve existing passwords on disk so client-side state saves do not erase or revert them
  let diskPassword = '';
  if (fs.existsSync(DB_FILE)) {
    try {
      const diskDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
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

    // Demote any other user with 'Super Admin' role to 'School Administrator'
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

/**
 * Helper: robustly matches an identifier against users.
 * Supports:
 * - Exact username (e.g. 01936988967 or admin)
 * - Exact email (e.g. 123mirabulh@gmail.com)
 * - Mobile number with leading zero (01936988967), without leading zero (1936988967),
 *   with country code (+8801936988967 / 8801936988967), or formatted with spaces/hyphens
 * - Compound credentials string (e.g. "01936988967 + 123mirabulh@gmail.com")
 */
function findMatchingUser(users: any[], rawIdentifier: string): any | undefined {
  if (!rawIdentifier || !Array.isArray(users)) return undefined;
  const cleanId = String(rawIdentifier).trim().toLowerCase();
  
  // Extract separate parts if composite string is provided
  const parts = cleanId.split(/[\s+,/]+/).filter(Boolean);

  for (const u of users) {
    const uUsername = String(u.username || '').toLowerCase();
    const uEmail = String(u.email || '').toLowerCase();
    const uPhone = String(u.mobileNumber || '').replace(/\D/g, '');
    const uUserNumeric = uUsername.replace(/\D/g, '');

    // 1. Direct exact username or email match
    if (uUsername === cleanId || uEmail === cleanId) return u;

    // 2. Designated Super Admin email alias
    if (u.username === DESIGNATED_SUPER_ADMIN_ID || u.mobileNumber === DESIGNATED_SUPER_ADMIN_ID) {
      if (cleanId === '123mirabulh@gmail.com' || cleanId === 'mirabul@schoolportal.com') return u;
      if (cleanId.includes('123mirabulh@gmail.com') || cleanId.includes(DESIGNATED_SUPER_ADMIN_ID)) return u;
    }

    // 3. Multi-part / compound check
    for (const part of parts) {
      if (part === uUsername || part === uEmail) return u;
      const partDigits = part.replace(/\D/g, '');
      if (partDigits.length >= 10) {
        if (uPhone.endsWith(partDigits.slice(-10)) || uUserNumeric.endsWith(partDigits.slice(-10))) {
          return u;
        }
      }
    }

    // 4. Mobile number match with or without leading zero / country code
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

// -----------------------------------------------------------------------------
// SECURE PASSWORD HASHING & COMPATIBILITY HELPERS
// -----------------------------------------------------------------------------
/**
 * Hashes a password using PBKDF2 with SHA-256 and a random 16-byte salt
 */
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
  return `pbkdf2:sha256:100000$${salt}$${hash}`;
}

/**
 * Securely verifies an attempted password against a stored hash or legacy format.
 * Supports:
 * - PBKDF2 (Node / Python Werkzeug standard): pbkdf2:sha256:<iter>$<salt>$<hash>
 * - Scrypt (Python Werkzeug standard): scrypt:<N>:<r>:<p>$<salt>$<hash>
 * - Constant-time comparison to prevent timing attacks
 * - Legacy fallback with automatic migration on successful login
 */
function verifyPassword(attempt: string, stored: string): boolean {
  if (!stored || !attempt) return false;

  // 1. PBKDF2 format
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

  // 2. Python / Werkzeug scrypt format
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

  // 3. Legacy plaintext constant-time comparison
  try {
    const attemptBuf = Buffer.from(attempt);
    const storedBuf = Buffer.from(stored);
    if (attemptBuf.length === storedBuf.length) {
      return crypto.timingSafeEqual(attemptBuf, storedBuf);
    }
  } catch {}
  return attempt === stored;
}

// -----------------------------------------------------------------------------
// OTP-BASED FORGOT PASSWORD & RECOVERY STATE
// -----------------------------------------------------------------------------
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

// Rate-limiting store for OTP requests: IP or Identifier -> { count, lastRequestTime, lockedUntil }
const otpRateLimits = new Map<string, { count: number; lastRequestTime: number; lockedUntil?: number }>();

// Rate-limiting store for Login attempts: IP or Identifier -> { failedCount, lockedUntil }
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
      text: `Hello ${recipientName},\n\nYour one-time verification code for password recovery is: ${otpCode}\n\nThis code will expire in 5 minutes.\n\nThis OTP is strictly for account password recovery. If you did not request this, please ignore this email or notify your system administrator immediately.\n\nRegards,\nE-Biddalay School Management System`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #1e3a8a; margin: 0; font-size: 20px;">E-Biddalay School Management</h2>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Institutional Portal Password Recovery</p>
          </div>
          <p style="font-size: 14px; color: #334155;">Dear <strong>${recipientName}</strong>,</p>
          <p style="font-size: 14px; color: #334155; line-height: 1.5;">
            A request was received to reset the security password for your administrator account.
            Use the following 6-digit verification code to proceed:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <span style="display: inline-block; font-family: monospace, Courier; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 12px 28px; background-color: #f1f5f9; color: #1e40af; border: 2px dashed #93c5fd; border-radius: 8px;">
              ${otpCode}
            </span>
          </div>
          <p style="font-size: 12px; color: #e11d48; text-align: center; font-weight: bold;">
            ⏱ This code is strictly valid for 5 minutes and single-use password recovery only.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">
            If you did not initiate this password reset, please contact the central school administrator immediately.
            Never share this OTP code with anyone.
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

// Authentication: Login endpoint with rate-limiting and hashing
app.post('/api/auth/login', (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please provide both User ID and Password.' });
    }

    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const rateKey = `${clientIp}_${String(identifier).trim().toLowerCase()}`;
    const rateInfo = loginRateLimits.get(rateKey);

    // Check brute-force lockout: 5 failed attempts locks for 5 minutes
    if (rateInfo && rateInfo.lockedUntil && rateInfo.lockedUntil > Date.now()) {
      const waitSeconds = Math.ceil((rateInfo.lockedUntil - Date.now()) / 1000);
      return res.status(429).json({
        error: `Too many failed login attempts. Account access is temporarily throttled. Please try again in ${waitSeconds} seconds, or use "Forgot Password" to recover access.`
      });
    }

    if (!fs.existsSync(DB_FILE)) {
      return res.status(500).json({ error: 'Database is not initialized yet.' });
    }

    const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    const users = sanitizeUsers(db.users || []);

    const cleanId = String(identifier).trim().toLowerCase();
    const cleanPass = String(password).trim();
    const matchedUser = findMatchingUser(users, identifier);

    if (!matchedUser) {
      // Record failed attempt
      const currentFailed = (rateInfo?.failedCount || 0) + 1;
      const lockedUntil = currentFailed >= 5 ? Date.now() + 5 * 60 * 1000 : undefined;
      loginRateLimits.set(rateKey, { failedCount: currentFailed, lockedUntil });
      return res.status(401).json({ error: 'Invalid User ID, Mobile Number, or Email.' });
    }

    if (matchedUser.status !== 'active') {
      return res.status(403).json({ error: 'This account is suspended or inactive. Please contact administration.' });
    }

    // Secure password verification
    const isPasswordValid = verifyPassword(cleanPass, matchedUser.password || '');
    if (!isPasswordValid) {
      // Record failed attempt
      const currentFailed = (rateInfo?.failedCount || 0) + 1;
      const lockedUntil = currentFailed >= 5 ? Date.now() + 5 * 60 * 1000 : undefined;
      loginRateLimits.set(rateKey, { failedCount: currentFailed, lockedUntil });
      return res.status(401).json({ error: 'Incorrect password. If you forgot your password, please click "Forgot Password" below.' });
    }

    // Clear rate-limiting on success
    loginRateLimits.delete(rateKey);

    // Automatic migration: If the stored password was plaintext, securely hash it now
    if (matchedUser.password && !matchedUser.password.startsWith('pbkdf2:') && !matchedUser.password.startsWith('scrypt:')) {
      try {
        const hashedPassword = hashPassword(cleanPass);
        db.users = (db.users || []).map((u: any) =>
          u.id === matchedUser.id ? { ...u, password: hashedPassword } : u
        );
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
      } catch (migrationErr) {
        console.warn('Password hash migration warning:', migrationErr);
      }
    }

    // Generate cryptographically secure session token
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

    // Audit log
    try {
      db.auditLogs = db.auditLogs || [];
      db.auditLogs.push({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: `${matchedUser.fullName} (${matchedUser.role})`,
        action: 'USER_LOGIN',
        details: `User ${matchedUser.username} signed in successfully`,
        ipAddress: clientIp
      });
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    } catch {}

    // Return user without password
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

    // Anti-abuse: Cooldown (60s) and request limits (max 3 per 15 mins)
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

    if (!fs.existsSync(DB_FILE)) {
      return res.status(500).json({ error: 'Database is not initialized yet.' });
    }

    const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    const users = sanitizeUsers(db.users || []);

    const cleanId = String(identifier).trim().toLowerCase();
    const matchedUser = findMatchingUser(users, identifier);

    // Update rate limiting counter
    const currentCount = (rateInfo?.count || 0) + 1;
    const lockedUntil = currentCount >= 4 ? Date.now() + 15 * 60 * 1000 : undefined;
    otpRateLimits.set(rateKey, { count: currentCount, lastRequestTime: Date.now(), lockedUntil });

    // Prevent account enumeration: If user not found, return generic success message
    if (!matchedUser) {
      return res.json({
        success: true,
        genericNotice: true,
        message: 'If an account matching those credentials exists, a one-time verification code has been dispatched to the registered recovery email.'
      });
    }

    // Inactive account check
    if (matchedUser.status !== 'active') {
      return res.status(403).json({ error: 'This administrator account is inactive. Please contact system support.' });
    }

    // Generate cryptographically secure 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const sessionId = crypto.randomBytes(16).toString('hex');
    const otpHash = hashOtp(otp, sessionId);

    const smtpHost = (process.env.SMTP_HOST || '').replace(/[^\x20-\x7E]/g, '').trim();
    const smtpUser = (process.env.SMTP_USER || '').replace(/[^\x20-\x7E]/g, '').trim();
    const smtpPass = (process.env.SMTP_PASS || '').trim();
    const hasSmtp = !!(smtpHost && smtpUser && smtpPass);

    // If SMTP is configured, attempt real email delivery
    if (hasSmtp) {
      const mailRes = await sendOtpEmail(matchedUser.email, otp, matchedUser.fullName || matchedUser.username);
      if (!mailRes.success) {
        return res.status(502).json({
          error: `Failed to deliver OTP verification code to registered email: ${mailRes.error}. Please check SMTP configuration.`,
          providerConfigured: true
        });
      }
    }

    // Store OTP session (valid for 5 minutes, email-only)
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

    // Audit log (Never log the OTP itself!)
    try {
      db.auditLogs = db.auditLogs || [];
      db.auditLogs.push({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: `${matchedUser.fullName} (${matchedUser.role})`,
        action: 'OTP_REQUESTED',
        details: `Password reset verification code requested for User ID ${matchedUser.username} via Email`,
        ipAddress: clientIp
      });
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    } catch {}

    const maskedEmail = maskEmail(matchedUser.email);

    // In development/test mode without live SMTP configured, provide devCode for verification
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
        : 'One-time verification code generated. (SMTP provider credentials pending in environment variables; recovery active in test mode)',
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

    // Check expiration (5 minutes)
    if (Date.now() > session.expiresAt) {
      activeOtpSessions.delete(resetSessionId);
      return res.status(400).json({ error: 'The verification code has expired. Please request a new code.' });
    }

    // Check maximum attempts (5 attempts)
    if (session.attempts >= 5) {
      activeOtpSessions.delete(resetSessionId);
      return res.status(429).json({ error: 'Too many incorrect attempts. This recovery session has been cancelled for security. Please request a new code.' });
    }

    session.attempts += 1;

    // Constant-time HMAC comparison
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

    // Success: Invalidate the OTP session immediately (prevents replay/reuse)
    activeOtpSessions.delete(resetSessionId);

    // Issue single-use password reset authorization token (valid for 10 minutes)
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
      return res.status(400).json({ error: 'Password reset authorization has expired or is invalid. Please restart the recovery process.' });
    }

    if (Date.now() > resetRecord.expiresAt) {
      activePasswordResetTokens.delete(resetToken);
      return res.status(400).json({ error: 'Password reset authorization has expired. Please request a new code.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirmation do not match.' });
    }

    // Password strength policy: minimum 8 characters, with letters and numbers
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasDigit = /\d/.test(newPassword);
    if (!hasLetter || !hasDigit) {
      return res.status(400).json({ error: 'Password must contain letters and at least one number.' });
    }

    if (!fs.existsSync(DB_FILE)) {
      return res.status(500).json({ error: 'Database is not initialized yet.' });
    }

    const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    const userIndex = (db.users || []).findIndex((u: any) => u.id === resetRecord.userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    // Hash the new password securely using PBKDF2 with a new random salt
    const hashedPassword = hashPassword(newPassword);
    db.users[userIndex].password = hashedPassword;

    // Revoke the reset token immediately
    activePasswordResetTokens.delete(resetToken);

    // Revoke all existing active sessions for this user (force re-login everywhere)
    for (const [token, session] of activeSessions.entries()) {
      if (session.userId === resetRecord.userId) {
        activeSessions.delete(token);
      }
    }
    saveSessionsToFile();

    // Audit log
    db.auditLogs = db.auditLogs || [];
    db.auditLogs.push({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: `${db.users[userIndex].fullName} (${db.users[userIndex].role})`,
      action: 'PASSWORD_RESET',
      details: `Password reset successfully via OTP verification for User ID ${resetRecord.username}`,
      ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
    });

    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');

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

  if (fs.existsSync(DB_FILE)) {
    const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
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

// File upload endpoint for images and documents (PDF, DOCX, JPG, PNG, WEBP)
// Requires valid authentication so public visitors cannot upload arbitrary files
app.post('/api/upload', requireAuth, (req, res) => {
  try {
    const { fileName, fileType, fileData } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'Missing fileName or fileData' });
    }

    // Extract base64 content
    let base64Content = fileData;
    if (fileData.includes(';base64,')) {
      base64Content = fileData.split(';base64,')[1];
    }

    const buffer = Buffer.from(base64Content, 'base64');

    // Maximum 25MB file size
    if (buffer.length > 25 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds maximum limit of 25MB' });
    }

    const ext = path.extname(fileName).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({ error: `Unsupported file type: ${ext}. Allowed: ${allowedExtensions.join(', ')}` });
    }

    // Sanitize filename to avoid path traversal and invalid characters
    const sanitizedBase = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    const uniqueFileName = `${Date.now()}_${sanitizedBase}${ext}`;
    const targetPath = path.join(UPLOAD_DIR, uniqueFileName);

    fs.writeFileSync(targetPath, buffer);

    const formatSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return res.json({
      success: true,
      url: `/uploads/${uniqueFileName}`,
      fileName,
      storedName: uniqueFileName,
      fileSize: formatSize(buffer.length),
      sizeBytes: buffer.length
    });
  } catch (err: any) {
    console.error('Error uploading file:', err);
    return res.status(500).json({ error: 'Failed to process file upload' });
  }
});

// Delete uploaded file endpoint (Protected)
app.delete('/api/upload/:filename', requireAuth, (req, res) => {
  try {
    const rawFilename = req.params.filename;
    const safeFilename = path.basename(rawFilename);
    const targetPath = path.join(UPLOAD_DIR, safeFilename);

    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      return res.json({ success: true, message: 'File deleted successfully' });
    }
    return res.json({ success: true, message: 'File was already absent' });
  } catch (err: any) {
    console.error('Error deleting file:', err);
    return res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Delete student record endpoint (Protected by Administrator authorization)
app.delete('/api/students/:id', requireAdminAuth, (req, res) => {
  try {
    const studentId = req.params.id;
    const force = req.query.force === 'true' || req.body?.force === true;
    const archiveOnly = req.query.archive === 'true' || req.body?.archive === true;

    if (!fs.existsSync(DB_FILE)) {
      return res.status(500).json({ error: 'Database file not found.' });
    }

    const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    if (!Array.isArray(db.students)) {
      return res.status(404).json({ error: 'No students found in database.' });
    }

    const studentIndex = db.students.findIndex(
      (s: any) => s.id === studentId || s.studentId === studentId
    );
    if (studentIndex === -1) {
      return res.status(404).json({ error: `Student with ID "${studentId}" was not found.` });
    }

    const targetStudent = db.students[studentIndex];
    const targetId = targetStudent.id;
    const targetCode = targetStudent.studentId;

    // Check relationship integrity: marks, attendance, fees, results
    const relatedMarks = Array.isArray(db.marks)
      ? db.marks.filter((m: any) => m.studentId === targetId || m.studentId === targetCode)
      : [];
    const relatedAttendance = Array.isArray(db.attendance)
      ? db.attendance.filter((a: any) => a.studentId === targetId || a.studentId === targetCode)
      : [];
    const relatedFees = Array.isArray(db.fees)
      ? db.fees.filter((f: any) => f.studentId === targetId || f.studentId === targetCode)
      : [];
    const relatedResults = Array.isArray(db.results)
      ? db.results.filter((r: any) => r.studentId === targetId || r.studentId === targetCode)
      : [];

    const totalRelatedRecords =
      relatedMarks.length + relatedAttendance.length + relatedFees.length + relatedResults.length;

    if (archiveOnly) {
      db.students[studentIndex].status = 'archived';
      if (!Array.isArray(db.auditLogs)) db.auditLogs = [];
      db.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        action: 'STUDENT_ARCHIVED',
        details: `Archived student ${targetStudent.nameEn} (${targetStudent.studentId})`,
        userId: (req as any).user?.userId || 'admin',
        userName: (req as any).user?.fullName || 'Administrator',
        timestamp: new Date().toISOString()
      });
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
      return res.json({
        success: true,
        mode: 'archived',
        message: `Student "${targetStudent.nameEn}" (${targetStudent.studentId}) has been safely archived.`,
        student: db.students[studentIndex]
      });
    }

    // If records exist and force not passed, return conflict with relation details
    if (totalRelatedRecords > 0 && !force) {
      return res.status(409).json({
        error: 'Student has existing academic records (marks, attendance, fees, or exam results).',
        hasRelatedRecords: true,
        relatedCounts: {
          marks: relatedMarks.length,
          attendance: relatedAttendance.length,
          fees: relatedFees.length,
          results: relatedResults.length
        },
        message: `Student has ${totalRelatedRecords} related records. Use archive instead or confirm cascade deletion.`
      });
    }

    // Permanent Deletion
    db.students.splice(studentIndex, 1);

    // Cascade remove dependent items if forced
    if (force && totalRelatedRecords > 0) {
      if (Array.isArray(db.marks)) {
        db.marks = db.marks.filter((m: any) => m.studentId !== targetId && m.studentId !== targetCode);
      }
      if (Array.isArray(db.attendance)) {
        db.attendance = db.attendance.filter((a: any) => a.studentId !== targetId && a.studentId !== targetCode);
      }
      if (Array.isArray(db.fees)) {
        db.fees = db.fees.filter((f: any) => f.studentId !== targetId && f.studentId !== targetCode);
      }
      if (Array.isArray(db.results)) {
        db.results = db.results.filter((r: any) => r.studentId !== targetId && r.studentId !== targetCode);
      }
    }

    // Audit log
    if (!Array.isArray(db.auditLogs)) db.auditLogs = [];
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: 'STUDENT_DELETED',
      details: `Permanently deleted student ${targetStudent.nameEn} (${targetStudent.studentId})${
        force && totalRelatedRecords > 0 ? ` with ${totalRelatedRecords} cascaded records` : ''
      }`,
      userId: (req as any).user?.userId || 'admin',
      userName: (req as any).user?.fullName || 'Administrator',
      timestamp: new Date().toISOString()
    });

    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');

    return res.json({
      success: true,
      mode: 'deleted',
      message: `Student "${targetStudent.nameEn}" (${targetStudent.studentId}) has been permanently deleted from database.`,
      deletedStudentId: targetStudent.id
    });
  } catch (err: any) {
    console.error('Error deleting student:', err);
    return res.status(500).json({ error: 'Failed to delete student: ' + err.message });
  }
});

// Get synchronized database from server
// Public endpoint for public website data, but strips passwords and never leaks session state
app.get('/api/db', (req, res) => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.users)) {
        parsed.users = sanitizeUsers(parsed.users);
      }

      // Synchronize website aliases so both legacy and modern components read consistent arrays
      if (parsed && parsed.website) {
        if (!parsed.website.faculty && parsed.website.facultyProfiles) {
          parsed.website.faculty = parsed.website.facultyProfiles;
        } else if (!parsed.website.facultyProfiles && parsed.website.faculty) {
          parsed.website.facultyProfiles = parsed.website.faculty;
        }

        if (!parsed.website.committee && parsed.website.committeeMembers) {
          parsed.website.committee = parsed.website.committeeMembers;
        } else if (!parsed.website.committeeMembers && parsed.website.committee) {
          parsed.website.committeeMembers = parsed.website.committee;
        }

        if (!parsed.website.news && parsed.website.newsArticles) {
          parsed.website.news = parsed.website.newsArticles;
        } else if (!parsed.website.newsArticles && parsed.website.news) {
          parsed.website.newsArticles = parsed.website.news;
        }

        if (!parsed.website.awards && parsed.website.featuredAwards) {
          parsed.website.awards = parsed.website.featuredAwards;
        } else if (!parsed.website.featuredAwards && parsed.website.awards) {
          parsed.website.featuredAwards = parsed.website.awards;
        }

        if ((!parsed.website.gallery || parsed.website.gallery.length === 0) && parsed.website.galleryAlbums) {
          parsed.website.gallery = parsed.website.galleryAlbums.flatMap((a: any) => a.images || []);
        }

        if (parsed.website.settings?.logoUrl && !parsed.schoolSettings?.logoUrl) {
          if (!parsed.schoolSettings) parsed.schoolSettings = {};
          parsed.schoolSettings.logoUrl = parsed.website.settings.logoUrl;
        } else if (parsed.schoolSettings?.logoUrl && !parsed.website.settings?.logoUrl) {
          if (!parsed.website.settings) parsed.website.settings = {};
          parsed.website.settings.logoUrl = parsed.schoolSettings.logoUrl;
        }
      }

      // CRITICAL SECURITY FIX: Never return session state or credentials to unauthenticated users
      delete parsed.currentUser;
      delete parsed.isAuthenticated;

      const session = getOptionalAuth(req);
      if (!session) {
        // Unauthenticated request: strip passwords from all user accounts
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

// Save updated database to server (Protected by authentication)
app.post('/api/db', requireAuth, (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid database payload' });
    }

    // CRITICAL SECURITY FIX: Never serialize user sessions into server database
    delete body.currentUser;
    delete body.isAuthenticated;

    // CRITICAL CREDENTIAL INTEGRITY PROTECTION:
    // Never allow general client-side database saves (e.g. updating attendance, notices, marks, or logout)
    // to overwrite or revert user passwords stored securely on disk.
    if (fs.existsSync(DB_FILE)) {
      try {
        const diskDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
        if (Array.isArray(diskDb.users) && Array.isArray(body.users)) {
          const diskPwMap = new Map<string, string>();
          diskDb.users.forEach((u: any) => {
            if (u.id && u.password) diskPwMap.set(u.id, u.password);
            if (u.username && u.password) diskPwMap.set(u.username, u.password);
          });

          body.users = body.users.map((clientUser: any) => {
            const diskPassword = diskPwMap.get(clientUser.id) || diskPwMap.get(clientUser.username);
            if (diskPassword) {
              return {
                ...clientUser,
                password: diskPassword
              };
            }
            return clientUser;
          });
        }
      } catch (mergeErr) {
        console.warn('Password preservation warning:', mergeErr);
      }
    }

    // Enforce single Super Admin
    if (Array.isArray(body.users)) {
      body.users = sanitizeUsers(body.users);
    }

    // Synchronize dual website fields
    if (body.website) {
      if (body.website.faculty) body.website.facultyProfiles = body.website.faculty;
      if (body.website.facultyProfiles && !body.website.faculty) body.website.faculty = body.website.facultyProfiles;

      if (body.website.committee) body.website.committeeMembers = body.website.committee;
      if (body.website.committeeMembers && !body.website.committee) body.website.committee = body.website.committeeMembers;

      if (body.website.news) body.website.newsArticles = body.website.news;
      if (body.website.newsArticles && !body.website.news) body.website.news = body.website.newsArticles;

      if (body.website.awards) body.website.featuredAwards = body.website.awards;
      if (body.website.featuredAwards && !body.website.awards) body.website.awards = body.website.featuredAwards;

      if (body.website.settings?.logoUrl !== undefined) {
        if (!body.schoolSettings) body.schoolSettings = {};
        body.schoolSettings.logoUrl = body.website.settings.logoUrl;
      }
    }

    fs.writeFileSync(DB_FILE, JSON.stringify(body, null, 2), 'utf-8');
    return res.json({ success: true, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error('Error saving database file:', err);
    return res.status(500).json({ error: 'Failed to save database file' });
  }
});

// Dedicated disaster recovery safeguard: Initialize Blank Institution Database
app.post('/api/database/initialize-blank', requireAuth, (req, res) => {
  try {
    const session = (req as any).user as ActiveSession;
    const { requesterId, blankData } = req.body;

    // Verify requester is Super Admin
    if (session.role !== 'Super Admin' || requesterId !== DESIGNATED_SUPER_ADMIN_ID) {
      return res.status(403).json({ error: 'Access Denied: Only the Super Admin can initialize a blank database.' });
    }

    // Create emergency safety snapshot before clearing
    if (fs.existsSync(DB_FILE)) {
      const currentData = fs.readFileSync(DB_FILE, 'utf-8');
      const backupPath = path.join(BACKUP_DIR, `pre_blank_snapshot_${Date.now()}.json`);
      fs.writeFileSync(backupPath, currentData, 'utf-8');
    }

    if (blankData && typeof blankData === 'object') {
      delete blankData.currentUser;
      delete blankData.isAuthenticated;
      if (fs.existsSync(DB_FILE) && Array.isArray(blankData.users)) {
        try {
          const diskDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
          const diskPwMap = new Map<string, string>();
          (diskDb.users || []).forEach((u: any) => {
            if (u.id && u.password) diskPwMap.set(u.id, u.password);
            if (u.username && u.password) diskPwMap.set(u.username, u.password);
          });
          blankData.users = blankData.users.map((bu: any) => {
            const dp = diskPwMap.get(bu.id) || diskPwMap.get(bu.username);
            return dp ? { ...bu, password: dp } : bu;
          });
        } catch {}
      }
      if (Array.isArray(blankData.users)) {
        blankData.users = sanitizeUsers(blankData.users);
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(blankData, null, 2), 'utf-8');
    }

    return res.json({
      success: true,
      message: 'Institution database initialized to blank slate successfully.',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Error initializing blank database:', err);
    return res.status(500).json({ error: 'Internal error during database initialization' });
  }
});

// Super Admin Profile Update (Photo, Email, Name)
app.post('/api/users/superadmin/profile', requireAuth, (req, res) => {
  try {
    const session = (req as any).user as ActiveSession;
    const { userId, avatar, fullName, email } = req.body;

    if (session.role !== 'Super Admin' || userId !== DESIGNATED_SUPER_ADMIN_ID) {
      return res.status(403).json({ error: 'Only the Super Admin profile can be modified here.' });
    }

    if (fs.existsSync(DB_FILE)) {
      const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (Array.isArray(db.users)) {
        const userIndex = db.users.findIndex((u: any) => u.username === DESIGNATED_SUPER_ADMIN_ID);
        if (userIndex !== -1) {
          if (avatar !== undefined) db.users[userIndex].avatar = avatar;
          if (fullName) db.users[userIndex].fullName = fullName;
          if (email) db.users[userIndex].email = email;
          db.users = sanitizeUsers(db.users);
          delete db.currentUser;
          delete db.isAuthenticated;
          fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
          return res.json({ success: true, user: db.users[userIndex] });
        }
      }
    }
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Error updating Super Admin profile:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Super Admin Password Update
app.post('/api/users/superadmin/password', requireAuth, (req, res) => {
  try {
    const session = (req as any).user as ActiveSession;
    const { userId, currentPassword, newPassword } = req.body;

    if (session.role !== 'Super Admin' || userId !== DESIGNATED_SUPER_ADMIN_ID) {
      return res.status(403).json({ error: 'Unauthorized: Only Super Admin can change this password.' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    if (fs.existsSync(DB_FILE)) {
      const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (Array.isArray(db.users)) {
        const userIndex = db.users.findIndex((u: any) => u.username === DESIGNATED_SUPER_ADMIN_ID);
        if (userIndex !== -1) {
          const user = db.users[userIndex];
          if (currentPassword && user.password && user.password !== currentPassword) {
            return res.status(400).json({ error: 'Current password does not match.' });
          }

          db.users[userIndex].password = newPassword;
          db.users = sanitizeUsers(db.users);
          delete db.currentUser;
          delete db.isAuthenticated;
          fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
          return res.json({ success: true, message: 'Password updated successfully.' });
        }
      }
    }

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err: any) {
    console.error('Error changing Super Admin password:', err);
    return res.status(500).json({ error: 'Failed to change password' });
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
