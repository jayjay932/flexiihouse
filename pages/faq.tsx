import { FaQuestionCircle } from "react-icons/fa";

export default function FAQPage() {
  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", fontSize: "2rem", marginBottom: "2rem" }}>
        <FaQuestionCircle style={{ color: "#FF385C", marginRight: "0.5rem" }} />
        FAQ – Questions fréquentes
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ border: "1px solid #eee", borderRadius: "8px", padding: "1.5rem" }}>
          <h3 style={{ color: "#FF385C" }}>Comment réserver un logement, un véhicule ou une expérience ?</h3>
          <p>Il vous suffit de créer un compte Flexii, de rechercher selon vos critères, et de finaliser votre réservation en quelques clics.</p>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: "8px", padding: "1.5rem" }}>
          <h3 style={{ color: "#FF385C" }}>Puis-je négocier les prix ?</h3>
          <p>Oui. Flexii offre une messagerie intégrée qui permet aux utilisateurs et aux hôtes de discuter et de négocier les prix en toute transparence.</p>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: "8px", padding: "1.5rem" }}>
          <h3 style={{ color: "#FF385C" }}>Quels moyens de paiement sont acceptés ?</h3>
          <p>Flexii accepte les cartes bancaires, le mobile money et d’autres solutions de paiement sécurisées selon votre région.</p>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: "8px", padding: "1.5rem" }}>
          <h3 style={{ color: "#FF385C" }}>Comment contacter le support Flexii ?</h3>
          <p>Vous pouvez nous écrire via la page <a href="/support" style={{ color: "#FF385C" }}>Support</a> ou nous envoyer un email à <a href="mailto:support@flexii.com" style={{ color: "#FF385C" }}>support@flexii.com</a>.</p>
        </div>
      </div>
    </div>
  );
}
