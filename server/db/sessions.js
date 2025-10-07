import { supabase } from "./supabase";
export async function verifySessionOwnership(sessionId, userId) {
    const { data, error } = await supabase
        .from("sessions")
        .select("id")
        .eq("id", sessionId)
        .eq("user_id", userId)
        .single();
    if (error || !data)
        return false;
    return true;
}
export async function createSession(userId, title) {
    const { data, error } = await supabase.from("sessions").insert([
        { user_id: userId, title }
    ]).select().single();
    if (error)
        throw error;
    return data;
}
