// server/routes/auth.ts
import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

router.use(cookieParser());

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    //email_confirm: true,
  });

  if (error) return res.status(500).json({ error: error.message });

  await supabase.from("user_roles").insert({
    user_id: data.user?.id,
    role: "editor"
  });

  // Start a session here by logging them in immediately
  const login = await supabase.auth.signInWithPassword({ email, password });
  if (login.error) return res.status(500).json({ error: login.error.message });

  // Set cookie with access token securely
  res.cookie("sb_token", login.data.session.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7 * 1000, // 1 week
  });

  res.json({ user: login.data.user });
});

export default router;
