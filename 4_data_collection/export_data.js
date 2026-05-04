
const STORAGE_KEY = "campusEventSystemState";
const output = document.querySelector("#output");
document.querySelector("#load-btn").addEventListener("click", () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    output.textContent = "No localStorage data found. Open the main demo and create some records first.";
    return;
  }
  output.textContent = JSON.stringify(JSON.parse(raw), null, 2);
});
