function wake() {
  console.log("Button clicked");

  fetch("/api/wake", {
    method: "POST"
  });

  alert("Button request sent");
}
