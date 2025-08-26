import crypto from 'crypto';

// Supports key provided as raw 32-char, 64-char hex, or base64 (44 chars with padding)
function resolveKey(): Buffer {
  const raw = process.env.ACCOUNT_SECRET_ENC_KEY;
  if (!raw) throw new Error('Missing ACCOUNT_SECRET_ENC_KEY');
  if (raw.length === 64 && /^[0-9a-fA-F]+$/.test(raw)) return Buffer.from(raw, 'hex');
  if (raw.length >= 43) { // base64
    try { const b = Buffer.from(raw, 'base64'); if (b.length === 32) return b; } catch {}
  }
  if (raw.length === 32) return Buffer.from(raw, 'utf8');
  throw new Error('ACCOUNT_SECRET_ENC_KEY must be 32-byte (raw/base64/hex)');
}

const KEY = (() => {
  try { return resolveKey(); } catch { return null; }
})();

export function encryptSecret(plain: string): string {
  if (!KEY) throw new Error('Encryption key not initialized');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString('base64'); // store iv|tag|ct
}

export function decryptSecret(enc: string): string {
  if (!KEY) throw new Error('Encryption key not initialized');
  const buf = Buffer.from(enc, 'base64');
  if (buf.length < 12 + 16) throw new Error('Encrypted secret malformed');
  const iv = buf.subarray(0,12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
  return plain;
}

export function isEncryptionAvailable() { return !!KEY; }
