import { FaMobileAlt, FaHome, FaCar, FaStar } from "react-icons/fa";

export default function MarketingPageEN() {
  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", fontSize: "2rem", marginBottom: "2rem" }}>
        Flexii – Book Everything in One App
      </h1>
      <p style={{ textAlign: "center", marginBottom: "2rem" }}>
        Flexii connects you with the best <strong>homes</strong>, <strong>vehicles</strong>, 
        and <strong>experiences</strong> — all in one fast, seamless app.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
        <div style={{ padding: "1.5rem", border: "1px solid #eee", borderRadius: "8px", textAlign: "center" }}>
          <FaHome size={32} style={{ color: "#FF385C", marginBottom: "1rem" }} />
          <h3>Book a Home</h3>
          <p>Find trusted apartments, houses, or rooms hosted by real people.</p>
        </div>

        <div style={{ padding: "1.5rem", border: "1px solid #eee", borderRadius: "8px", textAlign: "center" }}>
          <FaCar size={32} style={{ color: "#FF385C", marginBottom: "1rem" }} />
          <h3>Rent a Vehicle</h3>
          <p>Cars, bikes, and more — instantly available, with price negotiation options.</p>
        </div>

        <div style={{ padding: "1.5rem", border: "1px solid #eee", borderRadius: "8px", textAlign: "center" }}>
          <FaStar size={32} style={{ color: "#FF385C", marginBottom: "1rem" }} />
          <h3>Unique Experiences</h3>
          <p>Enjoy unforgettable moments: nightlife, sports, events, and local activities.</p>
        </div>

        <div style={{ padding: "1.5rem", border: "1px solid #eee", borderRadius: "8px", textAlign: "center" }}>
          <FaMobileAlt size={32} style={{ color: "#FF385C", marginBottom: "1rem" }} />
          <h3>Modern App</h3>
          <p>Fast, simple, and intuitive. Book anything in just a few taps.</p>
        </div>
      </div>
    </div>
  );
}
