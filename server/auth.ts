import type { Express, Request, Response } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import { z } from "zod";
import type { IStorage } from "./storage";
import bcrypt from "bcryptjs";

const MemoryStore = createMemoryStore(session);
const PgSessionStore = connectPgSimple(session);

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const toSafeUser = (user: { password?: string }) => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

/**
 * Returns the current session userId (if logged in).
 * In development, auto-sets a demo userId.
 */
const ensureSessionUser = (req: Request): string | undefined => {
  const sessionData = req.session;
  if (!sessionData) return undefined;

  const current = (sessionData as any).userId as string | undefined;
  if (current) return current;

  // 🚪 DEV BYPASS (your npm run dev sets NODE_ENV=development)
  return undefined;
};

export const setupAuth = (app: Express, storage: IStorage) => {
  const sessionSecret = process.env.SESSION_SECRET || "";
  if (process.env.NODE_ENV === "production" && !sessionSecret) {
    throw new Error("SESSION_SECRET is required in production.");
  }

  const databaseUrl = process.env.DATABASE_URL || "";
  const sessionStore = databaseUrl
    ? new PgSessionStore({
        pool: new Pool({
          connectionString: databaseUrl,
          ssl:
            process.env.NODE_ENV === "production"
              ? { rejectUnauthorized: false }
              : undefined,
        }),
        createTableIfMissing: true,
      })
    : new MemoryStore({
        checkPeriod: 24 * 60 * 60 * 1000,
      });

  // Render sits behind a proxy/load balancer. This is important for secure cookies.
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(
    session({
      secret: sessionSecret || "dev-session-secret",
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    }),
  );

  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(credentials.username);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const ok = await bcrypt.compare(
        credentials.password,
        (user as any).password,
      );
      if (!ok) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.setHeader("x-hv-login-route", "setupAuth");
      (req.session as any).userId = (user as any).id;

      return req.session.save((err) => {
        if (err)
          return res.status(500).json({ message: "Session save failed" });
        return res.json(toSafeUser(user as any));
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid data",
          errors: error.errors,
        });
      }
      return res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/logout", (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.status(204).send();
    });
  });

  app.get("/api/me", async (req: Request, res: Response) => {
    const userId = ensureSessionUser(req);

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    return res.json(toSafeUser(user as any));
  });

  // TEMP: remove after confirming env on Render
  app.get("/api/env", (_req: Request, res: Response) => {
    res.json({
      NODE_ENV: process.env.NODE_ENV ?? null,
      RENDER: process.env.RENDER ?? null,
    });
  });
};

export const getSessionUserId = (req: Request): string => {
  const userId = ensureSessionUser(req);
  return userId?.trim() || "";
};
