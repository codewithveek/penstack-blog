/**
 * packages/core/src/utils/encryption.ts
 *
 * AES-256-GCM encryption for secrets stored at rest (OAuth credentials,
 * webhook signing secrets, etc.).
 *
 * Requires env var: ENCRYPTION_KEY (64-character hex string = 32 bytes)
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { ConfigurationError } from "../errors/index.js";

function getEncryptionKey(): Buffer {
  const hex = process.env["ENCRYPTION_KEY"];
  if (!hex || hex.length !== 64) {
    throw new ConfigurationError(
      "ENCRYPTION_KEY must be a 64-character hex string (32 bytes). " +
        "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(hex, "hex");
}

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12; // 96 bits (GCM standard)
const TAG_BYTES = 16;

/**
 * Encrypts plaintext using AES-256-GCM.
 * Returns a base64-encoded string: iv (12 bytes) + tag (16 bytes) + ciphertext.
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

/**
 * Decrypts a base64-encoded string produced by `encrypt()`.
 */
export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  const buffer = Buffer.from(ciphertext, "base64");

  const iv = buffer.subarray(0, IV_BYTES);
  const tag = buffer.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const encrypted = buffer.subarray(IV_BYTES + TAG_BYTES);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return decipher.update(encrypted).toString("utf8") + decipher.final("utf8");
}

/**
 * Returns true if the given string appears to be an encrypted value
 * (heuristic: valid base64 of at least IV + tag + 1 byte).
 */
export function isEncrypted(value: string): boolean {
  try {
    const buf = Buffer.from(value, "base64");
    return buf.length >= IV_BYTES + TAG_BYTES + 1;
  } catch {
    return false;
  }
}
