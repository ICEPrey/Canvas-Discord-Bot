import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  TOKEN: z.string().min(1, "Discord bot token is required"),
  CLIENT_ID: z.string().min(1, "Discord client ID is required"),
  GUILD_ID: z.string().min(1, "Discord guild ID is required"),
  CANVAS_DOMAIN: z
    .string()
    .url("Must be a valid URL")
    .refine((url) => url.endsWith(".instructure.com"), {
      message:
        "Must be a valid Canvas domain (should end with .instructure.com)",
    }),
  SUPABASE_URL: z
    .string()
    .url("Supabase URL must be a valid URL")
    .refine((url) => url.includes(".supabase.co"), {
      message: "Must be a valid Supabase URL",
    }),
  SUPABASE_ANON: z
    .string()
    .min(1, "Supabase anon key is required")
    .startsWith("ey", {
      message: "Supabase anon key should start with 'ey'",
    }),
  ENCRYPTION_KEY: z
    .string()
    .length(64, "Encryption key must be exactly 64 characters")
    .regex(/^[a-fA-F0-9]+$/, {
      message: "Encryption key must be a valid hex string",
    }),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
  ACCESS: z.string().optional(),
});

const parsedConfig = envSchema.safeParse(process.env);

if (!parsedConfig.success) {
  const errorMessages = parsedConfig.error.errors
    .map((err) => `• ${err.path.join(".")}: ${err.message}`)
    .join("\n");

  throw new Error(`Invalid configuration:\n${errorMessages}`);
}

export const CONFIG = parsedConfig.data;
