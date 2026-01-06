const API = "http://localhost:3000/api";

async function load() {
  const res = await fetch(`${API}/status`);
  const data = await res.json();
  const div = document.getElementById('hosts');
  div.innerHTML = "";

  data.forEach(h => {
    const el = document.createElement('div');
    el.className = "host";
    el.innerHTML = `
      <div>
        <strong>${h.name}</strong> (${h.ip}) -
        <span class="${h.online ? 'online' : 'offline'}">
          ${h.online ? 'Online' : 'Offline'}
        </span>
      </div>
      <div>
        <button onclick="wake('${h.ip}')">Wake</button>
        <button onclick="shutdown('${h.ip}')">Shutdown</button>
      </div>
    `;
    div.appendChild(el);
  });
}

async function wake(ip) {
  await fetch(`${API}/wake`, { method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ip}) });
}

async function shutdown(ip) {
  await fetch(`${API}/shutdown`, { method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ip}) });
}

load();
setInterval(load, 5000);
