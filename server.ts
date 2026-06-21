import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  initDb,
  getIncidents,
  addIncident,
  updateIncident,
  getShelters,
  updateShelterOccupancy,
  getHospitals
} from "./server/db.js";
import { analyzeIncidentReport } from "./server/gemini.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB
  await initDb();

  // Parse JSON bodies with custom limit to support base64 images
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // API Endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Get all incidents
  app.get("/api/incidents", async (req, res) => {
    try {
      const incidents = await getIncidents();
      res.json(incidents);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to load incidents: " + err.message });
    }
  });

  // Create a new incident (Citizen Report)
  app.post("/api/incidents", async (req, res) => {
    try {
      const { reporterName, reporterContact, description, latitude, longitude, address, imageUrl } = req.body;

      if (!description || !latitude || !longitude || !address) {
        return res.status(400).json({ error: "Missing required fields: description, latitude, longitude, and address are mandatory." });
      }

      // Analyze description and image using server-side Gemini Core
      const analysis = await analyzeIncidentReport(description, imageUrl);

      const incident = {
        id: `inc-${Date.now()}`,
        disasterType: analysis.disasterType as any,
        severity: analysis.severity as any,
        priorityScore: analysis.priorityScore,
        affectedPeople: analysis.affectedPeople,
        reporterName: reporterName || "Anonymous Report",
        reporterContact: reporterContact || "Not Provided",
        description,
        location: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          address
        },
        imageUrl,
        status: "Reported" as const,
        createdAt: new Date().toISOString(),
        recommendedActions: analysis.recommendedActions,
        updates: [
          "Emergency incident logged via RescueAI portal.",
          `RescueAI Triage core categorized as: ${analysis.disasterType} (Severity: ${analysis.severity}, Priority Score: ${analysis.priorityScore}/10).`
        ]
      };

      const savedIncident = await addIncident(incident);
      res.status(201).json(savedIncident);
    } catch (err: any) {
      console.error("Express POST incident failed:", err);
      res.status(500).json({ error: "Disaster processing error: " + err.message });
    }
  });

  // Update incident status (Authorities / Dispatcher)
  app.put("/api/incidents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, assignedTeam } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Status field is required." });
      }

      const updated = await updateIncident(id, { status, assignedTeam });
      if (!updated) {
        return res.status(404).json({ error: `Incident with ID ${id} not found.` });
      }

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update incident: " + err.message });
    }
  });

  // Get all shelters
  app.get("/api/shelters", async (req, res) => {
    try {
      const shelters = await getShelters();
      res.json(shelters);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to retrieve shelters." });
    }
  });

  // Update shelter occupancy
  app.put("/api/shelters/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { currentOccupancy } = req.body;

      if (currentOccupancy === undefined || currentOccupancy < 0) {
        return res.status(400).json({ error: "A valid positive occupancy number is required." });
      }

      const updated = await updateShelterOccupancy(id, currentOccupancy);
      if (!updated) {
        return res.status(404).json({ error: `Shelter with ID ${id} not found.` });
      }

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update shelter occupancy." });
    }
  });

  // Get all hospitals
  app.get("/api/hospitals", async (req, res) => {
    try {
      const hospitals = await getHospitals();
      res.json(hospitals);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to retrieve hospitals." });
    }
  });

  // Integrations for Vite and Static Site routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve("./dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RescueAI Platform Online at http://0.0.0.0:${PORT}`);
  });
}

startServer();
