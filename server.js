const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "checkins.json");

// ---- storage: a flat JSON file, good enough for a demo / small deployment.
// Swap this for a real database (Postgres, SQLite, etc.) once you outgrow it.
function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
}

function readCheckins() {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function appendCheckin(entry) {
  const list = readCheckins();
  list.push(entry);
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

// ---- middleware
app.use(cors()); // allow the PWA (hosted on a different origin) to POST here
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---- API: receive a check-in from the PWA
app.post("/api/checkin", (req, res) => {
  const { userId, name, latitude, longitude, accuracyMeters, timestamp } = req.body || {};

  if (!userId || latitude == null || longitude == null) {
    return res.status(400).json({ error: "userId, latitude, and longitude are required." });
  }

  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    userId: String(userId),
    name: name ? String(name) : "",
    latitude: Number(latitude),
    longitude: Number(longitude),
    accuracyMeters: accuracyMeters != null ? Number(accuracyMeters) : null,
    timestamp: timestamp || new Date().toISOString(),
    receivedAt: new Date().toISOString(),
  };

  appendCheckin(entry);
  res.status(201).json({ ok: true, entry });
});

// ---- API: list check-ins as JSON (used by the table view, and reusable elsewhere)
app.get("/api/checkins", (req, res) => {
  const list = readCheckins().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(list);
});

app.listen(PORT, () => {
  console.log(`Check-in backend listening on http://localhost:${PORT}`);
});
