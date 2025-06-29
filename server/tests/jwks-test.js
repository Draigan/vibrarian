// Save as jwks-test.js
import dotenv from "dotenv";
dotenv.config();

const url = `${process.env.SUPABASE_URL}/auth/v1/keys`;
const headers = { apikey: process.env.SUPABASE_ANON_KEY };

fetch(url, { headers })
  .then(res => res.text())
  .then(console.log)
  .catch(console.error);
