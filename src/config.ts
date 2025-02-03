import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  TOKEN: z.string().min(1, "Discord bot token is required"),
  CLIENT_ID: z.string().min(1, "Discord client ID is required"),
  GUILD_ID: z.string().min(1, "Discord guild ID is required"),
  CANVAS_DOMAIN: z
    .string()
    .url("Canvas domain must be a valid URL")
    .transform((url) => (url.endsWith("/") ? url.slice(0, -1) : url)),
  SUPABASE_URL: z.string().url("Supabase URL must be a valid URL"),
  SUPABASE_ANON: z.string().min(1, "Supabase anon key is required"),
  ENCRYPTION_KEY: z.string().length(64, "Encryption key must be 64 characters"),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
  ACCESS: z.string().optional(),
});

const CONFIG = envSchema.parse(process.env);

export { CONFIG };
