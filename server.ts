import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Readable } from "stream";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API proxy route to stream the Suno background music and bypass CORS/403 referer blocks
  app.get("/api/music-proxy", async (req, res) => {
    const targetUrl = (req.query.url as string) || "https://cdn1.suno.ai/cGzovQEKSJztgbBI.mp3";
    try {
      console.log(`[Music Proxy] Fetching audio from: ${targetUrl}`);
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://suno.com/",
          "Accept": "*/*",
        }
      });

      if (!response.ok) {
        console.error(`[Music Proxy] Error from target: ${response.status} ${response.statusText}`);
        res.status(response.status).send(`Failed to fetch from Suno CDN: ${response.statusText}`);
        return;
      }

      res.setHeader("Content-Type", response.headers.get("content-type") || "audio/mpeg");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Accept-Ranges", "bytes");

      const contentLength = response.headers.get("content-length");
      if (contentLength) {
        res.setHeader("Content-Length", contentLength);
      }

      if (response.body) {
        Readable.fromWeb(response.body as any).pipe(res);
      } else {
        res.status(500).send("No audio stream body available");
      }
    } catch (error: any) {
      console.error("[Music Proxy] Exception:", error);
      res.status(500).send(error.message);
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
