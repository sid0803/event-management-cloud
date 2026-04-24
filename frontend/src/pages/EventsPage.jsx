import { useEffect, useState } from "react";
import { getEvents, getEventById, registerEvent } from "../services/api";
import { BASE_URL } from "../services/api";
import AuthModal from "../components/AuthModal";

export default function EventsPage({ role }) {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [showAuth, setShowAuth] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const username = localStorage.getItem("username");
  const userRole = localStorage.getItem("role");

  const [form, setForm] = useState({ name: "", email: "" });

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    type: "",
    seatsLeft: "",
  });

  // ================= PAGINATION =================
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage, setEventsPerPage] = useState(6);
  // ================= FILTER =================
  const filteredEvents = events.filter((e) => {
    if (!selectedMonth) return true;

    const eventDate = new Date(e.date);
    return eventDate.getMonth() === Number(selectedMonth);
  });

  // ================= PAGINATION =================
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  // ================= FETCH EVENTS =================
  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  // ================= DETAILS =================
  const handleDetails = async (id) => {
    try {
      const event = await getEventById(id);
      setSelected(event);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setSelected(null);
    setShowForm(false);
    alert("Logged out");
  };

  // ================= REGISTER =================
  const handleRegisterClick = () => {
    if (!token) { setShowAuth(true); return; }
    setShowForm(true);
  };

  const handleFinalRegister = async () => {
    try {
      const eventId = selected?.id || selected?._id;
      await registerEvent(eventId, form.name, form.email, token);
      alert("Registration successful!");
      setShowForm(false);
      setForm({ name: "", email: "" });
      fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  // ================= CREATE =================
const handleCreateEvent = async () => {
  try {
    const url = editingId
      ? `${BASE_URL}/events/${editingId}`
      : `${BASE_URL}/events`;

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newEvent),
    });

    alert(editingId ? "Event Updated!" : "Event Created!");

    setShowCreate(false);
    setEditingId(null); // 🔥 reset after update
    setNewEvent({
      title: "",
      description: "",
      date: "",
      type: "",
      seatsLeft: "",
    });

    fetchEvents();
  } catch (err) {
    alert(err.message);
  }
};

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await fetch(`${BASE_URL}/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Deleted!");
      fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  // ================= EDIT =================
    const handleEdit = (event) => {
      const id = event.id || event._id;

      setEditingId(id); // 🔥 VERY IMPORTANT

      setNewEvent({
        title: event.title || "",
        description: event.description || "",
        date: event.date ? event.date.slice(0, 16) : "",
        type: event.type || "",
        seatsLeft: event.seatsLeft || "",
      });

      setShowCreate(true);
    };

  return (
    <div className="events-page">
      {/* ---- NAVBAR ---- */}
      <nav className="navbar">
        <span className="navbar-brand">⬡ EVENTCORE</span>
        <div className="navbar-right">
          {!token ? (
            <button className="btn btn-primary" onClick={() => setShowAuth(true)}>
              Login / Signup
            </button>
          ) : (
            <>
              <div className="user-badge">
                <span>{username}</span>
                <span className={`role-tag ${userRole !== "ADMIN" ? "user-role" : ""}`}>
                  {userRole === "ADMIN" ? "Admin" : "User"}
                </span>
              </div>
              <button className="btn btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="page-content">

        {/* ---- ADMIN CREATE BUTTON ---- */}
        {userRole === "ADMIN" && !showCreate && (
          <div style={{ marginBottom: "28px" }}>
            <button className="btn btn-ghost" onClick={() => setShowCreate(true)}>
              ＋ &nbsp;Create New Event
            </button>
          </div>
        )}

        {/* ---- CREATE FORM PANEL ---- */}
        {showCreate && (
          <div className="create-panel">
            <h3>✦ {editingId ? "Edit Event" : "Create New Event"}</h3>
            <div className="input-group">
              <label className="input-label">Title</label>
              <input
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Description</label>
              <input
                placeholder="Short description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Date & Time</label>
                <input
                  type="datetime-local"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Type</label>
                <input
                  placeholder="e.g. Tech, Music, Art"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Available Seats</label>
              <input
                type="number"
                placeholder="Number of seats"
                value={newEvent.seatsLeft}
                onChange={(e) => setNewEvent({ ...newEvent, seatsLeft: e.target.value })}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button className="btn btn-primary" onClick={handleCreateEvent}>
                Save Event
              </button>
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ---- EVENTS LIST OR DETAIL ---- */}
        {selected === null ? (
          <>
            <div className="section-header">
              <h2 className="section-title">Upcoming <span>Events</span></h2>
              <div className="pagination-controls">
                {totalPages > 1 && (
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                )}
                <div className="per-page-selector">
                  <label className="per-page-label">Show</label>
                  <select
                    className="per-page-select"
                    value={eventsPerPage}
                    onChange={(e) => {
                      setEventsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={3}>3</option>
                    <option value={6}>6</option>
                    <option value={9}>9</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                  </select>
                  <label className="per-page-label">per page</label>
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value="">All Months</option>
                    <option value="0">January</option>
                    <option value="1">February</option>
                    <option value="2">March</option>
                    <option value="3">April</option>
                    <option value="4">May</option>
                    <option value="5">June</option>
                    <option value="6">July</option>
                    <option value="7">August</option>
                    <option value="8">September</option>
                    <option value="9">October</option>
                    <option value="10">November</option>
                    <option value="11">December</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <h3>No events yet</h3>
                <p>Check back soon for upcoming events.</p>
              </div>
            ) : (
              <>
                <div className="grid">
                  {paginatedEvents.map((e) => {
                    const id = e.id || e._id;
                    return (
                      <div key={id} className="event-card">
                        {e.type && <span className="event-card-type">{e.type}</span>}
                        <h3>{e.title}</h3>
                        <p>{e.description?.substring(0, 90)}{e.description?.length > 90 ? "…" : ""}</p>

                        <div className="event-card-footer">
                          <div className="event-card-meta">
                            {e.date && (
                              <span className="meta-item">
                                <span className="meta-icon">📅</span>
                                {new Date(e.date).toLocaleDateString()}
                              </span>
                            )}
                            {e.seatsLeft !== undefined && (
                              <span className="meta-item">
                                <span className="meta-icon">🪑</span>
                                {e.seatsLeft} seats
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="card-actions">
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              console.log("CLICKED:", e);
                              setSelected(e);
                            }}
                          >
                            See Details
                          </button>

                          {userRole === "ADMIN" && (
                            <>
                              <button className="btn btn-warning" onClick={() => handleEdit(e)}>
                                Edit
                              </button>
                              <button className="btn btn-danger" onClick={() => handleDelete(id)}>
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ---- PAGINATION ---- */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      «
                    </button>
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      ‹
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === "..." ? (
                          <span key={`dots-${idx}`} className="page-dots">…</span>
                        ) : (
                          <button
                            key={item}
                            className={`page-btn ${currentPage === item ? "active" : ""}`}
                            onClick={() => setCurrentPage(item)}
                          >
                            {item}
                          </button>
                        )
                      )}

                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      ›
                    </button>
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      »
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="event-detail">
            <button className="back-btn" onClick={() => setSelected(null)}>
              ← Back to Events
            </button>

            {selected.type && <span className="event-card-type">{selected.type}</span>}
            <h1>{selected.title}</h1>

            <p className="description-block">{selected.description}</p>

            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">📅 Date & Time</div>
                <div className="detail-value">
                  {selected.date ? new Date(selected.date).toLocaleString() : "TBA"}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">🏷 Type</div>
                <div className="detail-value">{selected.type || "General"}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">🪑 Seats Available</div>
                <div className="detail-value seats-value">{selected.seatsLeft ?? "—"}</div>
              </div>
            </div>

            <div className="register-section">
              <h3>Registration</h3>
              {!showForm ? (
                <button className="btn btn-success" onClick={handleRegisterClick}>
                  Register for this Event
                </button>
              ) : (
                <div className="register-form-card">
                  <div className="form-row">
                    <div className="input-group">
                      <label className="input-label">Full Name</label>
                      <input
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Email</label>
                      <input
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="register-actions">
                    <button className="btn btn-success" onClick={handleFinalRegister}>
                      Confirm Registration
                    </button>
                    <button className="btn btn-ghost" onClick={() => setShowForm(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ---- AUTH MODAL ---- */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          setToken={(t) => {
            setToken(t);
            localStorage.setItem("token", t);
          }}
        />
      )}
    </div>
  );
}