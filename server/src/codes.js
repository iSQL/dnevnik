import { randomBytes } from 'node:crypto';

// Crockford-ish: no 0/1/I/L/O/U so codes are unambiguous when read aloud.
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';

export function generateFriendCode() {
  const bytes = randomBytes(8);
  let out = '';
  for (let i = 0; i < 8; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out.slice(0, 4) + '-' + out.slice(4);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(s) {
  return typeof s === 'string' && UUID_RE.test(s);
}
