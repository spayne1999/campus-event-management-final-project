
import {
  getDefaultState,
  validateEvent,
  createEvent,
  registerAttendee,
  computeStats,
  filterEvents
} from "../1_code/logic.js";

const resultsEl = document.querySelector("#results");

function printResult(name, passed, detail = "") {
  const row = document.createElement("li");
  row.className = passed ? "pass" : "fail";
  row.textContent = `${passed ? "PASS" : "FAIL"} - ${name}${detail ? " | " + detail : ""}`;
  resultsEl.appendChild(row);
}

function expect(name, condition, detail = "") {
  printResult(name, Boolean(condition), detail);
}

window.localStorage.clear();

const state = getDefaultState();

expect("Default seed has events", state.events.length >= 3, `events=${state.events.length}`);

const badEventErrors = validateEvent({
  title: "Hi",
  organizer: "",
  venue: "",
  category: "",
  date: "",
  time: "",
  capacity: 0
});
expect("Validation catches bad event input", badEventErrors.length >= 4, `errors=${badEventErrors.length}`);

const created = createEvent(state, {
  title: "AI Study Jam",
  organizer: "STEM Center",
  venue: "Room 301",
  category: "Academic",
  date: "2026-06-01",
  time: "15:00",
  capacity: 25,
  description: "Peer study session."
});
expect("Create event returns ok", created.ok === true);

const reg = registerAttendee(state, {
  eventId: created.event.id,
  name: "Jordan Lee",
  email: "jordan@example.edu",
  major: "Informatics"
});
expect("Registration succeeds for valid attendee", reg.ok === true);

const duplicate = registerAttendee(state, {
  eventId: created.event.id,
  name: "Jordan Lee",
  email: "jordan@example.edu",
  major: "Informatics"
});
expect("Duplicate registration is blocked", duplicate.ok === false);

const stats = computeStats(state);
expect("Stats registration count increased", stats.totalRegistrations === 1, `registrations=${stats.totalRegistrations}`);

const filtered = filterEvents(state.events, "cyber", "All");
expect("Search filter returns matching event", filtered.some((item) => item.title.toLowerCase().includes("cyber")));
