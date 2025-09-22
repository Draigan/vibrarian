import express from "express";
import cookieParser from "cookie-parser";
import { supabase, createUserClient } from "../db/supabase.js";

const router = express.Router();

router.use(cookieParser());

// -------------------------
// SESSION: validate + hydrate
// -------------------------
router.get("/session", async (req, res) => {
  const sb_token = req.cookies.sb_token;
  if (!sb_token) {
    return res.status(200).json({ logout: true, error: "Not authenticated" });
  }

  try {
    const supabaseUser = createUserClient(sb_token);
    const { data, error } = await supabaseUser.auth.getUser();

    // Handle auth errors
    if (error) {
      if (
        error.name === "AuthApiError" ||
        error.status === 401 ||
        error.status === 403
      ) {
        return res.status(200).json({ logout: true, error });
      } else {
        // network/undici/fetch error → don't force logout
        return res.status(503).json({ error, logout: false });
      }
    }

    if (!data?.user) {
      return res.status(200).json({ logout: true, error: "User not found" });
    }

    const userId = data.user.id;

    // fetch role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (roleError) console.error("Error fetching role:", roleError.message);

    // fetch settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (settingsError) console.error("Error fetching settings:", settingsError.message);

    return res.json({
      user: data.user,
      role: roleData?.role ?? "viewer",
      settings: settingsData ?? { theme: "light" },
      logout: false,
      error: null,
    });
  } catch (e) {
    return res.status(503).json({ error: "Server error", logout: false });
  }
});

// -------------------------
// LOGIN
// -------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return res.status(401).json({ error: error.message });

  res.cookie("sb_token", data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7 * 1000,
  });

  res.json({ user: data.user });
});

// -------------------------
// LOGOUT
// -------------------------
router.post("/logout", (req, res) => {
  res.clearCookie("sb_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Logged out successfully" });
});

// -------------------------
// SIGNUP
// -------------------------
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

  const userId = data.user?.id;

  // default role + settings
  await supabase.from("user_roles").insert({
    user_id: userId,
    role: "viewer",
  });

  await supabase.from("user_settings").insert({
    user_id: userId,
    theme: "dark",
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

