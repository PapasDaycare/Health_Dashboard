import type { Express, Request, Response } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import { z } from "zod";
import type { IStorage } from "./storage";

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

const ensureSessionUser = (req: Request): string | undefined => {
  const sessionData = req.session;
  if (!sessionData) {
    return undefined;
  }

  const current = sessionData.userId;
  if (current) {
    return current;
  }

  if (process.env.NODE_ENV === "development") {
    sessionData.userId = "demo-user-id";
    return sessionData.userId;
  }

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
        pool: new Pool({ connectionString: databaseUrl }),
        createTableIfMissing: true,
      })
    : new MemoryStore({
        checkPeriod: 24 * 60 * 60 * 1000,
      });

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
      if (!user || user.password !== credentials.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      return res.json(toSafeUser(user));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
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

    return res.json(toSafeUser(user));
  });
};

export const getSessionUserId = (req: Request): string => {
  const userId = ensureSessionUser(req);
  return userId?.trim() || "";
};