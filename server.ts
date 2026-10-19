import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Firestore } from "@google-cloud/firestore";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // Firestore initialization
  let db: Firestore | null = null;
  
  // Lazy initialization of Firestore
  const getFirestore = () => {
    if (!db) {
      const dbId = process.env.FIRESTORE_DATABASE_ID;
      const credsJson = process.env.FIRESTORE_CREDENTIALS_JSON;
      
      if (!dbId || !credsJson) {
        throw new Error("Missing FIRESTORE_DATABASE_ID or FIRESTORE_CREDENTIALS_JSON environment variable");
      }
      
      try {
        let credentials;
        try {
          credentials = JSON.parse(credsJson);
        } catch (parseError: any) {
          throw new Error(`Failed to parse FIRESTORE_CREDENTIALS_JSON as JSON. Please ensure it is a valid JSON string. Parse error: ${parseError.message}`);
        }

        db = new Firestore({
          projectId: credentials.project_id,
          credentials: {
            client_email: credentials.client_email,
            // Handle cases where \n was escaped as \\n in the env var string
            private_key: credentials.private_key ? credentials.private_key.replace(/\\n/g, '\n') : undefined,
          },
          databaseId: dbId,
        });
      } catch (e: any) {
        console.error("Firestore initialization error", e);
        throw new Error(`Firestore Init Error: ${e.message}`);
      }
    }
    return db;
  };

  // --- API Routes ---
  
  // Example: Fetch user parks
  app.get("/api/user-parks", async (req, res) => {
    try {
      const firestore = getFirestore();
      const snapshot = await firestore.doc("users/zhongyi").get();

      if (!snapshot.exists) {
        return res.status(404).json({ error: "users/zhongyi not found" });
      }

      const data = snapshot.data();
      res.json(data?.history?.parkHistory ?? []);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  
  // Example: Fetch all NP parks
  app.get("/api/parks", async (req, res) => {
    try {
      const firestore = getFirestore();
      const snapshot = await firestore.doc("parks/np").get();

      if (!snapshot.exists) {
        return res.status(404).json({ error: "parks/np not found" });
      }

      const data = snapshot.data();
      res.json(data?.parks ?? []);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- Vite Middleware ---
  
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
