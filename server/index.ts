import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import winston from "winston";
import authRouter from "./routes/auth.js"; 
import chatRoutes from "./routes/chat.js";
import chatSessionRouter from "./routes/chatSession.js";
import transcriptRouter from "./routes/transcripts.js";

const app = express();
const port = 3000;

// Toggle logging with an environment variable
const LOGGING_ENABLED = process.env.LOGGING_ENABLED === "true";

// Set up Winston logger
const logger = winston.createLogger({
  level: LOGGING_ENABLED ? "info" : "silent",
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Use Morgan for HTTP request logging if enabled
if (LOGGING_ENABLED) {
  app.use(morgan("dev"));
}

// Allow requests from frontend with cookies
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api", chatRoutes);
app.use("/api", transcriptRouter);
app.use("/api", chatSessionRouter);
app.use("/api", authRouter);

app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});

export { logger }; // Optional: so you can import and use `logger` in your routes/controllers

