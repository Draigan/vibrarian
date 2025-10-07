import { jwtVerify, createRemoteJWKSet } from "jose";
import { fetch as undiciFetch } from "undici";
import dotenv from "dotenv";
dotenv.config();
const SUPABASE_PROJECT_URL = "https://icsboammppiujydsidaj.supabase.co";
const SUPABASE_JWKS_URL = `${SUPABASE_PROJECT_URL}/auth/v1/keys`;
const SUPABASE_ISSUER = `${SUPABASE_PROJECT_URL}/auth/v1`;
const SUPABASE_API_KEY = process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_API_KEY) {
    console.error("❌ SUPABASE_ANON_KEY is not set in .env");
    process.exit(1);
}
// 👇 override global.fetch with apikey-injected version
globalThis.fetch = (url, options = {}) => {
    options.headers = {
        ...(options.headers || {}),
        apikey: SUPABASE_API_KEY,
    };
    console.log("🌐 [fetch override] Injected apikey for:", url.toString());
    return undiciFetch(url, options);
};
// ✅ JWKS with extended timeout to avoid timeouts
const JWKS = createRemoteJWKSet(new URL(SUPABASE_JWKS_URL), {
    timeoutDuration: 15000, // 15 seconds
});
export async function verifySupabaseJwt(token) {
    try {
        console.log("🔍 Verifying Supabase JWT...");
        const { payload } = await jwtVerify(token, JWKS, {
            issuer: SUPABASE_ISSUER,
            audience: "authenticated",
        });
        console.log("✅ JWT valid. Payload:", payload);
        return {
            valid: true,
            payload,
        };
    }
    catch (err) {
        console.error("❗ JWT verify error:", err.message || err);
        return {
            valid: false,
            payload: undefined,
            error: err.message || "JWT verification failed",
        };
    }
}
