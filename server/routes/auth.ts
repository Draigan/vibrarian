// server/routes/auth.ts
import express from "express";
import cookieParser from "cookie-parser";
import { supabase, createUserClient } from "../db/supabase.js";

const router = express.Router();

router.use(cookieParser());

router.get("/session", async (req, res) => {
  const token = req.cookies.sb_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const supabaseUser = createUserClient(token);
  const { data, error } = await supabaseUser.auth.getUser();

  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  res.json({ user: data.user });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });

  res.cookie("sb_token", data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7 * 1000,
  });

  res.json({ user: data.user });
});

router.post("/logout", (req, res) => {
  res.clearCookie("sb_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Logged out successfully" });
});

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) return res.status(500).json({ error: error.message });

  await supabase.from("user_roles").insert({
    user_id: data.user?.id,
    role: "editor"
  });

  const login = await supabase.auth.signInWithPassword({ email, password });
  if (login.error) return res.status(500).json({ error: login.error.message });

  res.cookie("sb_token", login.data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7 * 1000,
  });

  res.json({ user: login.data.user });
});

export default router;

