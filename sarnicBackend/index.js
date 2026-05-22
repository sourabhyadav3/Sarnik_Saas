import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./app.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import "./cron/dailyEmailSender.js";

// Security & Error Handling Imports
import helmet from "helmet";
import { errorHandler } from "./Middlewares/errorMiddleware.js";
import { apiLimiter, sanitizePayload, secureHeaders } from "./Middlewares/securityMiddleware.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.get("/api/ics-proxy", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: "URL required" });
    }
    const response = await fetch(url);
    const text = await response.text();
    res.setHeader("Content-Type", "text/calendar");
    res.send(text);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mount Security Middlewares Early
app.use(helmet());
app.use(secureHeaders);

app.use(
  cors({
    origin: ["http://localhost:5173","http://localhost:5174", "sarnic-latest-one.netlify.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Payload Sanitizer runs after parser to secure req.body, req.query, and req.params
app.use(sanitizePayload);

// Apply Global Rate Limiting to all general APIs
app.use(apiLimiter);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./tmp",
    createParentPath: true,
  })
);

// App routes
app.use(routes);

// Mount Centralized Error Handler at the very end
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

