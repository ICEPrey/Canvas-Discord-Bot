import { createClient } from "@supabase/supabase-js";
require("dotenv/config");
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON || "";

module.exports = {
    supabase: createClient(supabaseUrl, supabaseKey),
};
