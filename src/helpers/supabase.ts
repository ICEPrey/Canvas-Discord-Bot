import { CanvasUser, SelectedSchool } from "../types";
import { decryptToken, encryptToken } from "./bcrypt";
import { supabase } from "./client";

export async function fetchUsers(): Promise<CanvasUser[]> {
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) throw error;
    return data as CanvasUser[];
  } catch (error) {
    console.error("Error fetching user data from the database:", error);
    throw error;
  }
}

export async function getCanvasToken(discordId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("canvas_api_token")
      .eq("discord_id", discordId)
      .maybeSingle();
    if (error && error.code !== "PGRST116") {
      throw error;
    }
    if (!data?.canvas_api_token) return null;

    try {
      // Attempt to decrypt the token
      return decryptToken(data.canvas_api_token);
    } catch {
      // If decryption fails, it might be an old, unencrypted token
      console.warn("Token decryption failed, might be an old unencrypted token");
      return data.canvas_api_token;
    }
  } catch (error) {
    console.error("Error fetching Canvas token from the database:", error);
    throw error;
  }
}

export async function getCanvasID(discordId: string): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("canvas_user_id")
      .eq("discord_id", discordId)
      .single();
    if (error) throw error;
    return data?.canvas_user_id || null;
  } catch (error) {
    console.error("Error fetching Canvas id from the database:", error);
    throw error;
  }
}

export async function upsertUser(
  token: string,
  discordId: string,
  canvasUserId: number,
  selectedSchool: SelectedSchool,
): Promise<void> {
  try {
    // Encrypt the token
    const encryptedToken = encryptToken(token);

    // Check if the school exists
    // eslint-disable-next-line prefer-const
    let { data: existingSchool, error: schoolError } = await supabase
      .from("schools")
      .select("id")
      .eq("canvas_domain", selectedSchool.canvas_domain)
      .single();
    if (schoolError && schoolError.code !== "PGRST116") throw schoolError;

    // If the school doesn't exist, insert it
    if (!existingSchool) {
      const { data: insertedSchool, error: insertSchoolError } = await supabase
        .from("schools")
        .insert({
          name: selectedSchool.name,
          canvas_domain: selectedSchool.canvas_domain,
        })
        .select()
        .single();
      if (insertSchoolError) throw insertSchoolError;
      existingSchool = insertedSchool;
    }

    if (!existingSchool) {
      throw new Error("Failed to retrieve or create school");
    }
    const schoolId = existingSchool.id;

    // Upsert user with encrypted token
    const { error: upsertError } = await supabase
      .from("users")
      .upsert({
        discord_id: discordId,
        canvas_api_token: encryptedToken,
        canvas_user_id: canvasUserId,
        school_id: schoolId,
      }, {
        onConflict: "discord_id",
      });

    if (upsertError) throw upsertError;
  } catch (error) {
    console.error("Error upserting user data in the database:", error);
    throw error;
  }
}