import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { createServer as createNetServer } from "net";
import bcrypt from "bcryptjs";
import fs from "fs";
import webhookRoutes from "./routes/webhooks";

// Load environment variables from .env file
config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Enable cookie parsing for cart sessions
// Basic CORS support
app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

// Serve PWA files with proper headers
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.resolve(__dirname, '../public/sw.js'));
});

app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.resolve(__dirname, '../public/manifest.json'));
});

app.use('/icons', express.static(path.resolve(__dirname, '../public/icons')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const isDev = app.get("env") === "development";
  let useMem = process.env.USE_MEM_STORAGE === "1";
  const hasDbUrl = !!process.env.DATABASE_URL;
  const isDbUrlValid = (() => {
    try {
      if (!hasDbUrl) return false;
      new URL(process.env.DATABASE_URL as string);
      return true;
    } catch {
      return false;
    }
  })();
  if (!useMem && !hasDbUrl) {
    if (isDev) {
      process.env.USE_MEM_STORAGE = "1";
      useMem = true;
      log("DATABASE_URL not set; using in-memory storage for development");
    } else {
      log("DATABASE_URL must be set or USE_MEM_STORAGE=1");
      process.exit(1);
    }
  }

  if (!useMem && hasDbUrl && !isDbUrlValid) {
    if (isDev) {
      process.env.USE_MEM_STORAGE = "1";
      useMem = true;
      log("DATABASE_URL invalid; using in-memory storage for development");
    } else {
      log("DATABASE_URL invalid");
      process.exit(1);
    }
  }

  const ensureDevAdminEnv = async () => {
    if (process.env.NODE_ENV === "production") return;
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length === 0) {
      process.env.JWT_SECRET = "dev-secret-berryevents";
    }
    const targetEmail = "admin@berryevents.co.za";
    const targetPassword = "BerryAdmin@25";
    const currentEmail = process.env.ADMIN_EMAIL || "";
    const currentPassword = process.env.ADMIN_PASSWORD || "";
    if (!currentEmail || currentEmail.toLowerCase() !== targetEmail.toLowerCase()) {
      process.env.ADMIN_EMAIL = targetEmail;
    }
    if (!currentPassword) {
      process.env.ADMIN_PASSWORD = await bcrypt.hash(targetPassword, 10);
    } else {
      const isHash = currentPassword.startsWith("$2a$") || currentPassword.startsWith("$2b$") || currentPassword.startsWith("$2y$");
      let matches = false;
      if (isHash) {
        try {
          matches = await bcrypt.compare(targetPassword, currentPassword);
        } catch {
          matches = false;
        }
      } else {
        matches = currentPassword === targetPassword;
      }
      if (!matches) {
        process.env.ADMIN_PASSWORD = await bcrypt.hash(targetPassword, 10);
      }
    }
  };

  await ensureDevAdminEnv();
  const bootstrapAdminFile = async () => {
    if (process.env.NODE_ENV === "production") return;
    const adminFilePath = path.resolve(__dirname, "data/admins.json");
    const dir = path.dirname(adminFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    let admins: any[] = [];
    if (fs.existsSync(adminFilePath)) {
      try {
        admins = JSON.parse(fs.readFileSync(adminFilePath, "utf8"));
      } catch {
        admins = [];
      }
    }
    const ADMIN_EMAIL = "admin@berryevents.co.za";
    const ADMIN_PASSWORD = "BerryAdmin@25";
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const adminIndex = admins.findIndex(
      (a) => String(a.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase()
    );
    const adminUser = {
      id: "admin-1",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
      firstName: "Berry",
      lastName: "Admin",
      createdAt: new Date().toISOString(),
    };
    if (adminIndex === -1) {
      admins.push(adminUser);
      console.log("✅ Admin user created");
    } else {
      admins[adminIndex] = adminUser;
      console.log("✅ Admin user updated");
    }
    fs.writeFileSync(adminFilePath, JSON.stringify(admins, null, 2));
    const isValid = await bcrypt.compare(ADMIN_PASSWORD, hashedPassword);
    console.log("🔐 Password test:", isValid ? "✅ VALID" : "❌ INVALID");
  };
  await bootstrapAdminFile();

  const { registerRoutes } = await import("./routes");
  const server = await registerRoutes(app);
  app.use("/api/webhooks", webhookRoutes);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const body = isDev
      ? { message, code: err.code, stack: err.stack }
      : { message };
  log(`error ${status}: ${message}`);
  res.status(status).json(body);
  // keep server alive; do not rethrow
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (isDev) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const portEnv = process.env.PORT || "5001";
  const port = parseInt(portEnv, 10);

  const assertPortAvailable = (p: number) =>
    new Promise<void>((resolve, reject) => {
      const tester = createNetServer().once("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          reject(new Error(`Port ${p} is in use`));
        } else {
          reject(err);
        }
      }).once("listening", () => {
        tester.close(() => resolve());
      }).listen(p, "0.0.0.0");
    });

  try {
    await assertPortAvailable(port);
  } catch (e: any) {
    log(e.message);
    process.exit(1);
  }

  const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 500, factor = 2): Promise<T> => {
    let attempt = 0;
    let lastErr: any;
    while (attempt <= retries) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        if (attempt === retries) break;
        const wait = delay * Math.pow(factor, attempt);
        await new Promise(r => setTimeout(r, wait));
        attempt++;
      }
    }
    throw lastErr;
  };

  if (!useMem) {
    try {
      const dbModule = await import("./db");
      const dbPool = dbModule.pool;
      if (!dbPool) {
        log("database pool unavailable");
        if (isDev) {
          process.env.USE_MEM_STORAGE = "1";
          useMem = true;
          log("falling back to in-memory storage in development");
        } else {
          log("continuing without database in production");
        }
      } else {
        await withRetry(async () => {
          const client = await dbPool.connect();
          client.release();
        });
        log("database connectivity verified");
      }
    } catch (err: any) {
      log(`database connectivity failed: ${err.message}`);
      if (isDev) {
        process.env.USE_MEM_STORAGE = "1";
        useMem = true;
        log("falling back to in-memory storage in development");
      } else {
        log("continuing without database in production");
      }
    }
  }

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      log(`port ${port} is already in use`);
    } else {
      log(`server error: ${err.message}`);
    }
    process.exit(1);
  });

  const shutdown = async () => {
    try {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    } catch {}
    if (!useMem) {
      try {
        const dbModule = await import("./db");
        const dbPool = dbModule.pool;
        if (dbPool) {
          await dbPool.end();
        }
      } catch {}
    }
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.on("unhandledRejection", (reason: any) => {
    log(`unhandledRejection: ${reason?.message || String(reason)}`);
  });
  process.on("uncaughtException", (error: any) => {
    log(`uncaughtException: ${error?.message || String(error)}`);
  });

  // Health endpoint
  app.get("/__health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: false,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
