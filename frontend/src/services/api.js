export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// 🔥 Helper to handle response properly
const handleResponse = async (res) => {
  const contentType = res.headers.get("content-type");

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Something went wrong");
  }

  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }

  return res.text();
};

// ================= EVENTS =================
export const getEvents = async () => {
  const res = await fetch(`${BASE_URL}/events`);
  return handleResponse(res);
};

export const getEventById = async (id) => {
  const res = await fetch(`${BASE_URL}/events/${id}`);
  return handleResponse(res);
};

// ================= AUTH =================
export const login = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse(res);
};

export const signup = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse(res);
};

// ================= REGISTRATION =================
export const registerEvent = async (eventId, name, email, token) => {
  const res = await fetch(
    `${BASE_URL}/events/${eventId}/registration`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        email
      }),
    }
  );

  return handleResponse(res);
};