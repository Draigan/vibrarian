import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.sb_token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token found" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }

  // Attach user info to the request object
  (req as any).user = user;

  next();
}
