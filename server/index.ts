import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { createServer as createNetServer } from "net";

// Load environment variables from .env file
config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Enable cookie parsing for cart sessions

// Serve PWA files with proper headers
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(path.resolve(__dirname, '../public/sw.js'));
});

app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
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
  const useMem = process.env.USE_MEM_STORAGE === "1";
  if (!useMem && !process.env.DATABASE_URL) {
    if (isDev) {
      process.env.USE_MEM_STORAGE = "1";
      log("DATABASE_URL not set; using in-memory storage for development");
    } else {
      log("DATABASE_URL must be set or USE_MEM_STORAGE=1");
      process.exit(1);
    }
  }

  const { registerRoutes } = await import("./routes");
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const body = isDev
      ? { message, code: err.code, stack: err.stack }
      : { message };
    log(`error ${status}: ${message}`);
    res.status(status).json(body);
    throw err;
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
        process.exit(1);
      }
      await withRetry(async () => {
        const client = await dbPool.connect();
        client.release();
      });
      log("database connectivity verified");
    } catch (err: any) {
      log(`database connectivity failed: ${err.message}`);
      process.exit(1);
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

  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: false,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
