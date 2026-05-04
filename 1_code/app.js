
import {
  loadState,
  createEvent,
  registerAttendee,
  deleteEvent,
  filterEvents,
  computeStats,
  formatDateTime
} from "./logic.js";

let state = loadState();

const eventForm = document.querySelector("#event-form");
const registrationForm = document.querySelector("#registration-form");
const messageBox = document.querySelector("#message-box");
const eventList = document.querySelector("#event-list");
const selectEvent = document.querySelector("#registration-event");
const statsWrap = document.querySelector("#stats");
const searchInput = document.querySelector("#search");
const categoryFilter = document.querySelector("#category-filter");
const activityFeed = document.querySelector("#activity-feed");
const attendeeTable = document.querySelector("#attendee-table-body");

function showMessage(type, lines) {
  const content = Array.isArray(lines) ? lines.map((line) => `<li>${line}</li>`).join("") : `<li>${lines}</li>`;
  messageBox.className = `message ${type}`;
  messageBox.innerHTML = `<ul>${content}</ul>`;
}

function renderStats() {
  const stats = computeStats(state);
  statsWrap.innerHTML = `
    <div class="stat-card"><span>${stats.totalEvents}</span><small>Total Events</small></div>
    <div class="stat-card"><span>${stats.totalRegistrations}</span><small>Registrations</small></div>
    <div class="stat-card"><span>${stats.capacity}</span><small>Total Capacity</small></div>
    <div class="stat-card"><span>${stats.fillRate}%</span><small>Fill Rate</small></div>
  `;
}

function renderEventOptions() {
  selectEvent.innerHTML = `<option value="">Select an event</option>` + state.events
    .map((event) => `<option value="${event.id}">${event.title}</option>`)
    .join("");
}

function renderActivity() {
  activityFeed.innerHTML = state.activityLog
    .map((item) => `<li><strong>${new Date(item.ts).toLocaleString()}</strong><span>${item.message}</span></li>`)
    .join("");
}

function renderAttendees() {
  attendeeTable.innerHTML = state.attendees.length
    ? state.attendees.map((attendee) => {
        const event = state.events.find((item) => item.id === attendee.eventId);
        return `
          <tr>
            <td>${attendee.name}</td>
            <td>${attendee.email}</td>
            <td>${attendee.major || "N/A"}</td>
            <td>${event ? event.title : "Removed Event"}</td>
            <td>${attendee.checkInStatus}</td>
          </tr>
        `;
      }).join("")
    : `<tr><td colspan="5">No attendees registered yet.</td></tr>`;
}

function renderEvents() {
  const query = searchInput.value.trim();
  const category = categoryFilter.value;
  const filtered = filterEvents(state.events, query, category);

  if (!filtered.length) {
    eventList.innerHTML = `<div class="empty-state">No events matched your filters.</div>`;
    return;
  }

  eventList.innerHTML = filtered.map((event) => {
    const remaining = Number(event.capacity) - Number(event.registrations);
    const status = remaining > 0 ? `${remaining} seats left` : "Full";
    return `
      <article class="event-card">
        <div class="event-top">
          <div>
            <h3>${event.title}</h3>
            <p class="muted">${event.organizer} · ${event.category}</p>
          </div>
          <button data-delete="${event.id}" class="danger-btn">Delete</button>
        </div>
        <p>${event.description || "No description provided."}</p>
        <div class="pill-row">
          <span>${formatDateTime(event.date, event.time)}</span>
          <span>${event.venue}</span>
          <span>${event.registrations}/${event.capacity} registered</span>
          <span>${status}</span>
        </div>
      </article>
    `;
  }).join("");
}

function refresh() {
  renderStats();
  renderEventOptions();
  renderEvents();
  renderActivity();
  renderAttendees();
}

eventForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(eventForm).entries());
  const result = createEvent(state, formData);
  if (!result.ok) {
    showMessage("error", result.errors);
    return;
  }
  eventForm.reset();
  showMessage("success", [`Event "${result.event.title}" created successfully.`]);
  refresh();
});

registrationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(registrationForm).entries());
  const result = registerAttendee(state, payload);
  if (!result.ok) {
    showMessage("error", result.errors);
    return;
  }
  registrationForm.reset();
  showMessage("success", [`${result.attendee.name} was registered successfully.`]);
  refresh();
});

eventList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  const eventId = button.getAttribute("data-delete");
  const result = deleteEvent(state, eventId);
  if (!result.ok) {
    showMessage("error", result.errors);
    return;
  }
  showMessage("success", "Event removed successfully.");
  refresh();
});

searchInput.addEventListener("input", renderEvents);
categoryFilter.addEventListener("change", renderEvents);

refresh();
