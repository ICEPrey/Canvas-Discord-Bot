import { supabase } from "./client";

export async function fetchUser() {
    try {
        const { data, error } = await supabase.from("canvas").select("*");

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.error("Error fetching user data from the database:", error);
        throw error;
    }
}
export async function getCanvasToken(userId: string) {
    try {
        const { data } = await supabase
            .from("canvas")
            .select("token")
            .eq("discord_user", userId)
            .single();

        return data ? data.token : null;
    } catch (error) {
        console.error("Error fetching Canvas token from the database:", error);
        throw error;
    }
}
export async function getCanvasID(userId: string) {
    try {
        const { data } = await supabase
            .from("canvas")
            .select("canvas_id")
            .eq("discord_user", userId)
            .single();

        return data ? data.canvas_id : null;
    } catch (error) {
        console.error("Error fetching Canvas id from the database:", error);
        throw error;
    }
}
export async function AccessToken(
    token: string,
    userId: string,
    canvasID: number,
    selectedSchool: any,
) {
    try {
        const existingToken = await getCanvasToken(userId);
        if (existingToken) {
            const { error } = await supabase
                .from("canvas")
                .update({ token: token, school: selectedSchool?.domain })
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
    } catch (error) {
        console.error("Error updating the token into the database:", error);
        throw error;
    }
}
