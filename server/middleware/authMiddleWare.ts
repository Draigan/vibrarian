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
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
}

