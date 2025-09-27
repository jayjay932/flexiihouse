import { FaEnvelope, FaPhone, FaQuestionCircle } from "react-icons/fa";

export default function SupportPageEN() {
  return (
    <div
      style={{
        fontFamily: "sans-serif",
        padding: "2rem",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ textAlign: "center", fontSize: "2rem", marginBottom: "2rem" }}>
        Flexii Support
      </h1>
      <p style={{ textAlign: "center", marginBottom: "2rem" }}>
        We are here to help you at every step of your journey on Flexii.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            padding: "1.5rem",
            border: "1px solid #eee",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <FaEnvelope size={32} style={{ color: "#FF385C", marginBottom: "1rem" }} />
          <h3>Email</h3>
          <p>Contact us by email at:</p>
          <a href="mailto:flexii@flexiihouse.com" style={{ color: "#FF385C" }}>
            flexii@flexiihouse.com
          </a>
        </div>

        <div
          style={{
            padding: "1.5rem",
            border: "1px solid #eee",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <FaPhone size={32} style={{ color: "#FF385C", marginBottom: "1rem" }} />
          <h3>Phone</h3>
          <p>Call us at:</p>
          <a href="tel:+330759891039" style={{ color: "#FF385C" }}>
            +33 07 59 89 10 39
          </a>
        </div>

        <div
          style={{
            padding: "1.5rem",
            border: "1px solid #eee",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <FaQuestionCircle size={32} style={{ color: "#FF385C", marginBottom: "1rem" }} />
          <h3>FAQ</h3>
          <p>Find answers to the most frequently asked questions.</p>
          <a href="/faq" style={{ color: "#FF385C" }}>
            Go to FAQ
          </a>
        </div>
      </div>
    </div>
  );
}
