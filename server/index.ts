import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.set("trust proxy", 1);

app.get("/api/version", (_req, res) => res.json({ commit: "0b97a44" }));

// DEV SESSION USER BYPASS (terminal-added)
if (process.env.NODE_ENV === "development" && process.env.AUTH_BYPASS === "true") {
  app.use((req: any, _res: any, next: any) => {
    // only set if session exists and userId is missing
    if (req.session && !req.session.userId) {
      req.session.userId = process.env.DEV_USER_ID ?? "demo-user-id";
    }
    next();
  });
}


// DEV AUTH BYPASS (terminal-added)
if (process.env.NODE_ENV === "development" && process.env.AUTH_BYPASS === "true") {
  app.use((req: any, _res: any, next: any) => {
    req.user = {
      id: "dev-user",
      email: process.env.DEV_USER_EMAIL ?? "dev",
      name: process.env.DEV_USER_NAME ?? "Dev User",
      roles: ["admin"],
    };
    next();
  });
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      log(logLine);
    }
  });

  next();
});

(async () => {
  setupAuth(app, storage);
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5001', 10);
  if (app.get("env") === "development") {
    server.listen(port, () => {
      log(`serving on port ${port}`);
    });
  } else {
    server.listen(
      {
        port,
        host: "0.0.0.0",
        reusePort: true,
      },
      () => {
        log(`serving on port ${port}`);
      },
    );
  }
})();
