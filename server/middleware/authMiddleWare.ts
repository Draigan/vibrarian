import { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;
const SUPABASE_URL = process.env.SUPABASE_URL;
const ISSUER = `${SUPABASE_URL}/auth/v1`;

if (!SUPABASE_JWT_SECRET) {
  throw new Error("Missing SUPABASE_JWT_SECRET in .env");
}

const secret = new TextEncoder().encode(SUPABASE_JWT_SECRET);

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.sb_token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: ISSUER,
      audience: "authenticated",
    });

    const user = {
      id: payload.sub,
      email: payload.email,
    };

    console.log("🔐 Authenticated user:", user.email);

    // Attach decoded info to request object
    (req as any).user = user;

    next();
  } catch (err: any) {
    console.error("❌ JWT verification failed:", err.message);
  }
}
//import { Request, Response, NextFunction } from "express";
//import { jwtVerify, createRemoteJWKSet } from "jose";
//import dotenv from "dotenv";
//
//dotenv.config();
//
//const SUPABASE_URL = process.env.SUPABASE_URL!;
//const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
//if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
//  throw new Error("Missing Supabase environment variables");
//}
//
//// ** Use the new, correct JWKS URL **
//const JWKS_URL = `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`;
//const ISSUER = `${SUPABASE_URL}/auth/v1`;
//
//const jwks = createRemoteJWKSet(new URL(JWKS_URL), {
//  headers: { apikey: SUPABASE_ANON_KEY },
//});
//
//export async function requireAuth(
//  req: Request,
//  res: Response,
//  next: NextFunction
//) {
//  const token = req.cookies?.sb_token;
//
//  if (!token) {
//    return res.status(401).json({ error: "Unauthorized: No token provided" });
//  }
//
//  try {
//    const { payload } = await jwtVerify(token, jwks, {
//      issuer: ISSUER,
//      audience: "authenticated",
//    });
//
//    // It's a good practice to type the user object on the request
//    // You can create a custom declaration file for this
//    (req as any).user = {
//      id: payload.sub,
//      email: payload.email,
//    };
//
//    next();
//  } catch (err: any) {
//    console.error("❌ JWT verification failed:", err.message);
//    return res.status(401).json({ error: "Unauthorized: Invalid token" });
//  }
//}
//
