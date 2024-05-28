import { supabase } from "./client";

export async function fetchUser(): Promise<any[]> {
    try {
        const { data, error } = await supabase.from("canvas").select("*");

        if (error) {
            throw error;
        }

        return data;
    } catch (error: any) {
        console.error("Error fetching user data from the database:", error);
        throw error;
    }
}

export async function getCanvasToken(userId: string): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from("canvas")
            .select("token")
            .eq("discord_user", userId);

        if (error) {
            throw error;
        }

        if (data.length === 0) {
            return null;
        } else if (data.length > 1) {
            throw new Error("Multiple rows returned for the Canvas token");
        }

        return data[0].token;
    } catch (error: any) {
        console.error("Error fetching Canvas token from the database:", error);
        throw error;
    }
}

export async function getCanvasID(userId: string): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from("canvas")
            .select("canvas_id")
            .eq("discord_user", userId)
            .single();

        if (error) {
            throw error;
        }

        return data ? data.canvas_id : null;
    } catch (error: any) {
        console.error("Error fetching Canvas id from the database:", error);
        throw error;
    }
}

export async function AccessToken(
    token: string,
    userId: string,
    canvasID: number,
    selectedSchool: { name: string; domain: string },
): Promise<void> {
    try {
        const existingToken = await getCanvasToken(userId);
        if (existingToken) {
            const { error } = await supabase
                .from("canvas")
                .update({ token: token, school: selectedSchool.domain })
                .eq("discord_user", userId);

            if (error) {
                throw new Error("Error updating token in supabase.");
            }
        } else {
            const { error } = await supabase.from("canvas").insert({
                token: token,
                discord_user: userId,
                canvas_id: canvasID,
                school: selectedSchool.name,
                school_domain: selectedSchool.domain,
            });

            if (error) {
                throw new Error(
                    "Error inserting token into the database: " + error.message,
                );
            }
        }
    } catch (error: any) {
        console.error("Error updating the token into the database:", error);
        throw error;
    }
}
