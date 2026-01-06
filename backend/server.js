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
  const host = hosts.find(h => h.ip === req.body.ip);
  if (!host) return res.status(404).send("Host not found");

  await wol.wake(host.mac);
  res.send("WOL sent");
});

app.post('/api/shutdown', async (req, res) => {
  const host = hosts.find(h => h.ip === req.body.ip);
  if (!host) return res.status(404).send("Host not found");

  try {
    await ssh.connect({ host: host.ip, username: host.user });
    await ssh.execCommand('sudo shutdown now');
    res.send("Shutdown command sent");
  } catch (e) {
    res.status(500).send("SSH failed");
  }
});

app.listen(3000, () => console.log("Backend running on http://localhost:3000"));
