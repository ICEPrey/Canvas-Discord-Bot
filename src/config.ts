import dotenv from "dotenv";

dotenv.config();

export const CONFIG = {
  TOKEN: process.env.TOKEN || "",
  CLIENT_ID: process.env.CLIENT_ID || "",
  GUILD_ID: process.env.GUILD_ID || "",
  CANVAS_DOMAIN: process.env.CANVAS_DOMAIN || "",
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_ANON: process.env.SUPABASE_ANON || "",
};
