const express = require("express");
const ping = require("ping");
const fs = require("fs");
const cors = require("cors");

const hosts = JSON.parse(fs.readFileSync("./hosts.json"));

const app = express();

app.use(cors({
  origin: ["http://localhost:8080"],
  methods: ["GET", "POST"],
}));

app.use(express.json());

app.get("/api/status/:name", async (req, res) => {
  const host = hosts[req.params.name];

  if (!host) {
    return res.status(404).json({ error: "Unknown host" });
  }

  try {
    const result = await ping.promise.probe(host.ip, { timeout: 2 });
    res.json({ online: result.alive });
  } catch (err) {
    console.error("Ping error:", err);
    res.status(500).json({ error: "Ping failed" });
  }
});

app.listen(3000, () => console.log("Backend running on http://localhost:3000"));
