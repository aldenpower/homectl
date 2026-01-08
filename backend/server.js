const fs = require('fs');
const express = require('express');
const ping = require('ping');
const wol = require('wol');
const { NodeSSH } = require('node-ssh');
const cors = require('cors');
const hosts = require('./hosts.json');

const app = express();
app.use(cors());
app.use(express.json());

const ssh = new NodeSSH();

app.get('/api/status', async (req, res) => {
  const results = await Promise.all(
    hosts.map(async h => {
      const r = await ping.promise.probe(h.ip, { timeout: 2 });
      return { ...h, online: r.alive };
    })
  );
  res.json(results);
});

app.post('/api/wake', async (req, res) => {
  console.log("Wake request:", req.body);

  try {
    const host = hosts.find(h => h.ip === req.body.ip);
    if (!host) {
      console.log("Host not found:", req.body.ip);
      return res.status(404).send("Host not found");
    }

    console.log("Sending WOL to:", host.mac);

    await wol.wake(host.mac);

    console.log("WOL sent OK");

    res.send("WOL sent");
  } catch (err) {
    console.error("WOL error:", err);
    res.status(500).send("Failed to send WOL");
  }
});


app.post('/api/shutdown', async (req, res) => {
  console.log("Shutdown request:", req.body);
  const host = hosts.find(h => h.ip === req.body.ip);
  if (!host) return res.status(404).send("Host not found");

  try {
    console.log(`Connecting to -p ${host.ssh_port || 22} ${host.user}@${host.ip}...`);
    await ssh.connect({
      host: host.ip,
      username: host.user,
      port: host.ssh_port || 22,
      privateKey: fs.readFileSync(`/root/.ssh/${host.ssh_key}`, 'utf8')
    });
    console.log("Connected.");
    const result = await ssh.execCommand('shutdown now');
    console.log("STDOUT:", result.stdout);
    console.log("STDERR:", result.stderr);
    res.send("Shutdown command sent");
  } catch (e) {
    console.error("SSH error:", e);
    res.status(500).send(e.message || "SSH failed");
  } finally {
    ssh.dispose();
  }
});

app.listen(3000, () => console.log("Backend running on http://localhost:3000"));
