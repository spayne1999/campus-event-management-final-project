
import {
  loadState,
  saveState,
  createEvent,
  registerAttendee,
  computeStats
} from "../1_code/logic.js";

const resultsEl = document.querySelector("#results");

function writeLine(text, className = "") {
  const li = document.createElement("li");
  li.textContent = text;
  li.className = className;
  resultsEl.appendChild(li);
}

window.localStorage.clear();
let state = loadState();

writeLine("System booted with seeded data.", "pass");

const eventResult = createEvent(state, {
  title: "Veterans Networking Lunch",
  organizer: "Student Services",
  venue: "Student Center",
  category: "Career",
  date: "2026-06-03",
  time: "12:00",
  capacity: 30,
  description: "Career networking for student veterans."
});

if (eventResult.ok) {
  writeLine("Event creation integration flow passed.", "pass");
} else {
  writeLine("Event creation integration flow failed.", "fail");
}

const regResult = registerAttendee(state, {
  eventId: eventResult.event.id,
  name: "Seth Payne",
  email: "seth@example.edu",
  major: "Informatics"
});

if (regResult.ok) {
  writeLine("Registration integration flow passed.", "pass");
} else {
  writeLine("Registration integration flow failed.", "fail");
}

saveState(state);

const reloaded = loadState();
const matchingEvent = reloaded.events.find((item) => item.id === eventResult.event.id);
const matchingAttendee = reloaded.attendees.find((item) => item.email === "seth@example.edu");

writeLine(matchingEvent ? "Persistence check passed." : "Persistence check failed.", matchingEvent ? "pass" : "fail");
writeLine(matchingAttendee ? "Attendee data linkage passed." : "Attendee data linkage failed.", matchingAttendee ? "pass" : "fail");

const stats = computeStats(reloaded);
writeLine(`Final total events: ${stats.totalEvents}`, "pass");
writeLine(`Final total registrations: ${stats.totalRegistrations}`, "pass");
