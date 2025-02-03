import { z } from "zod";

const envSchema = z.object({
  TOKEN: z.string().min(1),
  CLIENT_ID: z.string().min(1),
  GUILD_ID: z.string().min(1),
  CANVAS_DOMAIN: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON: z.string().min(1),
  ENCRYPTION_KEY: z.string().length(64),
});

export const CONFIG = envSchema.parse(process.env);
