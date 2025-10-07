import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Use with caution, full access
export const supabase = createClient(supabaseUrl, serviceRoleKey);
/**
 * Use this if you want to perform a query as a user with a token.
 */
export function createUserClient(token) {
    return createClient(supabaseUrl, serviceRoleKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    });
}
