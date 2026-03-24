import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEYLEN = 64;
const PASSWORD_MIN_LENGTH = 8;

function toBase64Url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function fromBase64Url(value: string) {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf-8");
}

export function validatePassword(password: string) {
  return password.length >= PASSWORD_MIN_LENGTH;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split("$");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const candidateHash = scryptSync(password, salt, SCRYPT_KEYLEN);
  const sourceHash = Buffer.from(hash, "hex");

  if (candidateHash.length !== sourceHash.length) {
    return false;
  }

  return timingSafeEqual(candidateHash, sourceHash);
}

export type JwtPayload = {
  sub: number;
  email: string;
  name: string;
  exp: number;
};

function getJwtSecret() {
  return process.env.JWT_SECRET ?? "dev-only-secret-change-me";
}

export function createJwt(payload: Omit<JwtPayload, "exp">, ttlSeconds = 60 * 60 * 24) {
  const header = { alg: "HS256", typ: "JWT" };
  const body: JwtPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedBody = toBase64Url(JSON.stringify(body));
  const data = `${encodedHeader}.${encodedBody}`;

  const signature = createHmac("sha256", getJwtSecret())
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${data}.${signature}`;
}

export function verifyJwt(token: string) {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedBody, signature] = parts;
  const data = `${encodedHeader}.${encodedBody}`;

  const expectedSignature = createHmac("sha256", getJwtSecret())
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedBody)) as JwtPayload;

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
