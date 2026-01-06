async function update(name) {
  console.log("Checking", name);
  const res = await fetch(`http://localhost:3000/api/status/${name}`);
  console.log("Response", res);

  const data = await res.json();
  console.log("Data", data);

  const dot = document.getElementById(`${name}-dot`);
  const text = document.getElementById(`${name}-text`);

  if (data.online) {
    dot.className = "dot online";
    text.textContent = "Online";
  } else {
    dot.className = "dot offline";
    text.textContent = "Offline";
  }
}

update("raspberrypi1");
setInterval(() => update("raspberrypi1"), 5000);
