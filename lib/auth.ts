import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_token';
const JWT_EXPIRY = '24h';

/**
 * Get the JWT signing secret as a Uint8Array (required by jose).
 * Falls back to ADMIN_PASSWORD if JWT_SECRET is not set, but JWT_SECRET
 * should always be configured in production.
 */
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Compare a plain-text password against the stored hash.
 * Uses Web Crypto API (Edge-compatible — no Node.js crypto needed).
 *
 * The stored hash format is: `<hex-salt>:<hex-hash>`
 * Generated via the hashPassword() helper below.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  // Support both hashed and plain-text passwords for backward compatibility.
  // If the stored value doesn't contain a colon it's a plain-text password
  // (legacy). This lets existing ADMIN_PASSWORD values keep working while
  // users migrate to ADMIN_PASSWORD_HASH.
  if (!storedHash.includes(':')) {
    return password === storedHash;
  }

  const [saltHex, hashHex] = storedHash.split(':');
  const salt = hexToBuffer(saltHex);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100_000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  const derivedHex = bufferToHex(new Uint8Array(derivedBits));
  return derivedHex === hashHex;
}

/**
 * Hash a password with a random salt (for generating ADMIN_PASSWORD_HASH).
 * Returns `<hex-salt>:<hex-hash>`.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100_000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  return `${bufferToHex(salt)}:${bufferToHex(new Uint8Array(derivedBits))}`;
}

/** Sign a JWT with the admin role claim. */
export async function createToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getSecret());
}

/** Verify a JWT and return the payload, or null if invalid/expired. */
export async function verifyToken(
  token: string
): Promise<{ role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { role: string };
  } catch {
    return null;
  }
}

/**
 * Read the admin token from cookies and verify it.
 * For use in Server Components / Route Handlers (not middleware — middleware
 * should use verifyToken directly with the raw cookie value).
 */
export async function getSession(): Promise<{ role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Cookie name — exported so middleware and route handlers stay in sync. */
export { COOKIE_NAME };

// ── Hex utilities ──────────────────────────────────────────────────────

function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? [];
  return new Uint8Array(bytes);
}
