
export const STORAGE_KEY = "campusEventSystemState";

export function buildId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export function getDefaultState() {
  return {
    events: [
      {
        id: "evt-101",
        title: "Cybersecurity Career Night",
        organizer: "Cyber Security Club",
        venue: "Library Auditorium",
        category: "Career",
        date: "2026-05-20",
        time: "17:30",
        capacity: 75,
        description: "Networking event with alumni, recruiters, and campus IT leaders.",
        registrations: 32
      },
      {
        id: "evt-102",
        title: "Spring Coding Bootcamp",
        organizer: "Computer Science Department",
        venue: "Tech Building Lab 202",
        category: "Workshop",
        date: "2026-05-24",
        time: "14:00",
        capacity: 40,
        description: "Hands-on Java and SQL workshop for first-year students.",
        registrations: 18
      },
      {
        id: "evt-103",
        title: "Student Leadership Mixer",
        organizer: "Student Affairs",
        venue: "Union Ballroom",
        category: "Social",
        date: "2026-05-28",
        time: "18:00",
        capacity: 120,
        description: "Cross-club mixer to connect student leaders from across campus.",
        registrations: 54
      }
    ],
    attendees: [],
    activityLog: [
      { id: "log-1", message: "System initialized with sample campus events.", ts: new Date().toISOString() }
    ]
  };
}

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = getDefaultState();
    saveState(seeded);
    return seeded;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    const fallback = getDefaultState();
    saveState(fallback);
    return fallback;
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function logActivity(state, message) {
  state.activityLog.unshift({
    id: buildId("log"),
    message,
    ts: new Date().toISOString()
  });
  state.activityLog = state.activityLog.slice(0, 8);
}

export function validateEvent(form) {
  const errors = [];
  if (!form.title || form.title.trim().length < 4) errors.push("Event title must be at least 4 characters.");
  if (!form.organizer || form.organizer.trim().length < 2) errors.push("Organizer is required.");
  if (!form.venue || form.venue.trim().length < 2) errors.push("Venue is required.");
  if (!form.category) errors.push("Category is required.");
  if (!form.date) errors.push("Date is required.");
  if (!form.time) errors.push("Time is required.");
  if (!Number.isFinite(Number(form.capacity)) || Number(form.capacity) < 1) errors.push("Capacity must be a number greater than 0.");
  return errors;
}

export function createEvent(state, form) {
  const errors = validateEvent(form);
  if (errors.length) {
    return { ok: false, errors };
  }
  const event = {
    id: buildId("evt"),
    title: form.title.trim(),
    organizer: form.organizer.trim(),
    venue: form.venue.trim(),
    category: form.category,
    date: form.date,
    time: form.time,
    capacity: Number(form.capacity),
    description: (form.description || "").trim(),
    registrations: 0
  };
  state.events.unshift(event);
  logActivity(state, `Created event: ${event.title}`);
  saveState(state);
  return { ok: true, event, state };
}

export function findEvent(state, eventId) {
  return state.events.find((event) => event.id === eventId);
}

export function validateRegistration(state, payload) {
  const errors = [];
  const event = findEvent(state, payload.eventId);
  if (!event) errors.push("Selected event does not exist.");
  if (!payload.name || payload.name.trim().length < 2) errors.push("Attendee name is required.");
  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) errors.push("A valid email is required.");
  if (event) {
    const eventAttendees = state.attendees.filter((item) => item.eventId === event.id);
    const alreadyRegistered = eventAttendees.some((item) => item.email.toLowerCase() === payload.email.trim().toLowerCase());
    if (alreadyRegistered) errors.push("This attendee is already registered for the selected event.");
    if (eventAttendees.length >= event.capacity) errors.push("This event is already full.");
  }
  return errors;
}

export function registerAttendee(state, payload) {
  const errors = validateRegistration(state, payload);
  if (errors.length) {
    return { ok: false, errors };
  }
  const event = findEvent(state, payload.eventId);
  const attendee = {
    id: buildId("att"),
    eventId: event.id,
    name: payload.name.trim(),
    email: payload.email.trim(),
    major: (payload.major || "").trim(),
    checkInStatus: "Registered"
  };
  state.attendees.unshift(attendee);
  event.registrations += 1;
  logActivity(state, `Registered ${attendee.name} for ${event.title}`);
  saveState(state);
  return { ok: true, attendee, state };
}

export function deleteEvent(state, eventId) {
  const event = findEvent(state, eventId);
  if (!event) return { ok: false, errors: ["Event not found."] };
  state.events = state.events.filter((item) => item.id !== eventId);
  state.attendees = state.attendees.filter((item) => item.eventId !== eventId);
  logActivity(state, `Removed event: ${event.title}`);
  saveState(state);
  return { ok: true, state };
}

export function filterEvents(events, query = "", category = "All") {
  return events.filter((event) => {
    const matchesQuery = !query || [
      event.title,
      event.organizer,
      event.venue,
      event.description
    ].join(" ").toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All" || event.category === category;
    return matchesQuery && matchesCategory;
  });
}

export function computeStats(state) {
  const totalEvents = state.events.length;
  const totalRegistrations = state.attendees.length;
  const capacity = state.events.reduce((sum, event) => sum + Number(event.capacity || 0), 0);
  const fillRate = capacity ? Math.round((totalRegistrations / capacity) * 100) : 0;
  const upcomingSoon = state.events.filter((event) => event.date >= new Date().toISOString().slice(0, 10)).length;
  return { totalEvents, totalRegistrations, capacity, fillRate, upcomingSoon };
}

export function formatDateTime(date, time) {
  return `${date} @ ${time}`;
}
