import { FaEnvelope, FaPhone, FaQuestionCircle } from "react-icons/fa";

export default function SupportPage() {
  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", fontSize: "2rem", marginBottom: "2rem" }}>Support Flexii</h1>
      <p style={{ textAlign: "center", marginBottom: "2rem" }}>
        Nous sommes là pour vous aider à chaque étape de votre expérience sur Flexii.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
        <div style={{ padding: "1.5rem", border: "1px solid #eee", borderRadius: "8px", textAlign: "center" }}>
          <FaEnvelope size={32} style={{ color: "#FF385C", marginBottom: "1rem" }} />
          <h3>Email</h3>
          <p>Contactez-nous par email à :</p>
          <a href="mailto:support@flexii.com" style={{ color: "#FF385C" }}>flexii@flexiihouse.com</a>
        </div>

        <div style={{ padding: "1.5rem", border: "1px solid #eee", borderRadius: "8px", textAlign: "center" }}>
          <FaPhone size={32} style={{ color: "#FF385C", marginBottom: "1rem" }} />
          <h3>Téléphone</h3>
          <p>Appelez-nous au :</p>
          <a href="tel:+242060000000" style={{ color: "#FF385C" }}>+330759891039</a>
        </div>

        <div style={{ padding: "1.5rem", border: "1px solid #eee", borderRadius: "8px", textAlign: "center" }}>
          <FaQuestionCircle size={32} style={{ color: "#FF385C", marginBottom: "1rem" }} />
          <h3>FAQ</h3>
          <p>Trouvez des réponses aux questions fréquentes.</p>
          <a href="/faq" style={{ color: "#FF385C" }}>Consulter la FAQ</a>
        </div>
      </div>
    </div>
  );
}
