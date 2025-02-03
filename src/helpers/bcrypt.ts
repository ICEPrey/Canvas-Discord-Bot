import crypto from "crypto";
import { CONFIG } from "../config";
import logger from "../logger";

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

    // Add HMAC
    const hmac = crypto.createHmac("sha256", Buffer.from(validatedKey, "hex"));
    hmac.update(encrypted);
    const hmacDigest = hmac.digest("hex");

    return (
      iv.toString("hex") + ":" + encrypted.toString("hex") + ":" + hmacDigest
    );
  } catch (error) {
    logger.error({ error }, "Error in encryptToken");
    throw error;
  }
}

export function decryptToken(encryptedToken: string): string {
  try {
    const [ivHex, encryptedHex, hmacDigest] = encryptedToken.split(":");

    // Verify HMAC
    const hmac = crypto.createHmac("sha256", Buffer.from(validatedKey, "hex"));
    hmac.update(Buffer.from(encryptedHex, "hex"));
    if (hmac.digest("hex") !== hmacDigest) {
      throw new Error("HMAC verification failed");
    }

    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(validatedKey, "hex"),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    logger.error({ error }, "Error in decryptToken");
    throw error;
  }
}
