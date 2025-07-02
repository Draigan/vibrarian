// server/routes/auth.ts
import express from "express";
import cookieParser from "cookie-parser";
import { supabase, createUserClient } from "../db/supabase.js";

const router = express.Router();

router.use(cookieParser());

router.get("/session", async (req, res) => {
  const sb_token = req.cookies.sb_token;
  if (!sb_token) {
    return res.status(200).json({ logout: true, error: "Not authenticated" });
  }

  try {
    const supabaseUser = createUserClient(sb_token);
    const { data, error } = await supabaseUser.auth.getUser();

    // Only log out for explicit auth errors (not fetch/network errors)
    if (error) {
      // AuthApiError (real auth error) triggers logout, but AuthRetryableFetchError does NOT
      if (
        error.name === "AuthApiError" ||
        error.status === 401 ||
        error.status === 403
      ) {
        return res.status(200).json({ logout: true, error: error });
      } else {
        // Network/undici/fetch error: don't log out!
        return res.status(503).json({ error: error, logout: false });
      }
    }

    if (!data?.user) {
      return res.status(200).json({ logout: true, error: "User not found" });
    }

    return res.json({ user: data.user, logout: false, error: null });
  } catch (e) {
    // DB/network/unknown error: do NOT log out!
    return res.status(503).json({ error: "Server error", logout: false });
  }
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

