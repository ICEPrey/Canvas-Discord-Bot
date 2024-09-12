import crypto from "crypto";
import { CONFIG } from "../config";

const IV_LENGTH = 16;
const ENCRYPTION_KEY = CONFIG.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY is not set in environment variables");
}

if (ENCRYPTION_KEY.length !== 64) {
  throw new Error(
    `ENCRYPTION_KEY must be 32 bytes (64 hex characters). Current length: ${ENCRYPTION_KEY.length}`,
  );
}

// Store the validated key
const validatedKey = ENCRYPTION_KEY;

export function encryptToken(token: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(validatedKey, "hex"),
      iv,
    );
    let encrypted = cipher.update(token);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (error) {
    console.error("Error in encryptToken:", error);
    throw error;
  }
}

export function decryptToken(encryptedToken: string): string {
  try {
    const textParts = encryptedToken.split(":");
    const iv = Buffer.from(textParts[0], "hex");
    const encryptedText = Buffer.from(textParts.slice(1).join(":"), "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(validatedKey, "hex"),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("Error in decryptToken:", error);
    throw error;
  }
}
