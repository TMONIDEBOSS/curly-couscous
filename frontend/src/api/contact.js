const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

/**
 * Submits a contact/support request. Throws with a readable message on
 * validation or network failure.
 */
export async function sendContactMessage({ name, email, message }) {
  const res = await fetch(`${API_BASE}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, message }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.error || "Could not send your message. Try again.");
  }

  return body;
}
