import { useState } from "react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { sendContactMessage } from "../api/contact";
import "./Contact.css";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState(null);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      await sendContactMessage(form);
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <div className="wrap">
      <SiteHeader />

      <section className="contact-block">
        <div className="section-tag">CONTACT</div>
        <h2>Need hands-on help securing your site?</h2>

        <div className="contact-grid">
          <div className="contact-photo">
            <img
              src="https://picsum.photos/seed/kindguard-support/400/500"
              alt="Support team member"
            />
          </div>

          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-label">EMAIL</span>
              <span className="mono">hello@kindguard.app</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">WHATSAPP</span>
              <span className="mono">+234 000 000 0000</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">RESPONSE TIME</span>
              <span>Within 1 business day</span>
            </div>
            <p className="contact-placeholder-note">
              Placeholder details — swap in your real email and number before launch.
            </p>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={update("name")}
              required
            />
            <input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={update("email")}
              required
            />
            <textarea
              placeholder="Tell us what you need help with"
              value={form.message}
              onChange={update("message")}
              required
            />
            <button className="scan-btn" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send message →"}
            </button>
            {status === "sent" && (
              <div className="form-success">Message sent — we'll get back to you soon.</div>
            )}
            {status === "error" && <div className="form-error">{error}</div>}
          </form>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
