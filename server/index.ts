// server/index.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js"; 
import chatRoutes from "./routes/chat.js";
import chatSessionRouter from "./routes/chatSession.js";

const app = express();
const port = 3000;

// Allow requests from frontend with cookies
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true, // 👈 allow cookies
}));

app.use(express.json());
app.use(cookieParser()); 

app.use("/api", chatRoutes);
app.use("/api", chatSessionRouter);
app.use("/api", authRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

