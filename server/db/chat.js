import { createUserClient } from "./supabase.js";
export async function insertMessage(sb_token, sessionId, role, content) {
    const supabase = createUserClient(sb_token);
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user)
        throw userError;
    const user_id = userData.user.id;
    // Step 1: Check if the session exists for the user
    const { data: session, error: sessionError } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("id", sessionId)
        .eq("user_id", user_id)
        .maybeSingle();
    if (!session) {
        // Step 2: Create the session with user_id
        const { error: insertError } = await supabase
            .from("chat_sessions")
            .insert({ id: sessionId, user_id, title: `${content.slice(0, 100)}...` });
        if (insertError)
            throw insertError;
    }
    // Step 3: Insert the message
    const { error: messageError } = await supabase.from("chat_messages").insert({
        session_id: sessionId,
        role,
        content,
    });
    if (messageError)
        throw messageError;
}
