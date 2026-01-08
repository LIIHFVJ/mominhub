import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { askGemini } from "../services/gemini";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

export async function createApp() {
  const app = express();

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cors());
  
  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: "لقد تجاوزت الحد المسموح به من الطلبات. يرجى المحاولة لاحقاً."
      });
    }
  });
  app.use("/api/", limiter);

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  registerOAuthRoutes(app);

  app.post("/api/fatwa", async (req, res, next) => {
    console.log("[Fatwa API] Received request:", JSON.stringify(req.body));
    try {
      const { question, context } = req.body;
      if (!question) {
        console.log("[Fatwa API] Missing question");
        return res.status(400).json({ error: "السؤال مطلوب (Question is required)" });
      }
      
      console.log("[Fatwa API] Calling Gemini...");
      const answer = await askGemini(question, context);
      console.log("[Fatwa API] Gemini responded successfully");
      
      res.json({ answer });
    } catch (error: any) {
      console.error("[Fatwa API] Route Error:", error);
      next(error); // Pass to global error handler
    }
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Global error handler MUST be after all routes
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[Global Error Handler] Error:", err.message || err);
    console.error("[Global Error Handler] Path:", req.path);
    console.error("[Global Error Handler] OriginalUrl:", req.originalUrl);
    console.error("[Global Error Handler] Headers:", JSON.stringify(req.headers));
    
    // If the request expects JSON or is an API call, ALWAYS return JSON
    const isApiCall = req.path.includes("/api/") || req.originalUrl.includes("/api/");
    const wantsJson = req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"));

    if (isApiCall || wantsJson) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(err.status || 500).json({
        error: "حدث خطأ في الخادم (API Error)",
        message: err.message || "Unknown error",
        path: req.path
      });
    }
    
    // For other routes, send a simple text
    res.status(err.status || 500).send(`A server error occurred (Global Handler): ${err.message || 'Unknown'}`);
  });

  return app;
}

async function startServer() {
  console.log("[Server] Checking Environment Variables...");
  console.log("[Server] GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
  console.log("[Server] SUPABASE_URL present:", !!process.env.VITE_SUPABASE_URL);

  const app = await createApp();
  const server = createServer(app);

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

import { fileURLToPath } from "url";

// Check if this file is being run directly
const isMainModule = process.argv[1] && process.argv[1].endsWith('index.ts');

if (isMainModule) {
  startServer().catch(console.error);
}
