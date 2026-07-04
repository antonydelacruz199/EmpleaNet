import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, KEY_LEN);
  return `${salt}:${derived.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const expected = Buffer.from(expectedHex, "hex");
  if (expected.length !== KEY_LEN) return false;
  const actual = scryptSync(password, salt, KEY_LEN);
  return timingSafeEqual(expected, actual);
}
