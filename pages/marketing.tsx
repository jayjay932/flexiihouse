import { FaMobileAlt, FaHome, FaCar, FaStar } from "react-icons/fa";

export default function MarketingPage() {
  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", fontSize: "2rem", marginBottom: "2rem" }}>Flexii – Réservez en toute simplicité</h1>
      <p style={{ textAlign: "center", marginBottom: "2rem" }}>
        Flexii vous connecte aux meilleurs <strong>logements</strong>, <strong>véhicules</strong> et <strong>expériences</strong>, 
        dans une seule application rapide et fluide.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
        <div style={{ padding: "1.5rem", border: "1px solid #eee", borderRadius: "8px", textAlign: "center" }}>
          <FaHome size={32} style={{ color: "#FF385C", marginBottom: "1rem" }} />
          <h3>Réservez un logement</h3>
          <p>Trouvez des appartements, maisons ou chambres chez des hôtes de confiance.</p>
        </div>

        <div style={{ padding: "1.5rem", border: "1px solid #eee", borderRadius: "8px", textAlign: "center" }}>
          <FaCar size={32} style={{ color: "#FF385C", marginBottom: "1rem" }} />
          <h3>Louez un véhicule</h3>
          <p>Voitures, motos et plus – à portée de main, avec possibilité de négocier les prix.</p>
        </div>

        <div style={{ padding: "1.5rem", border: "1px solid #eee", borderRadius: "8px", textAlign: "center" }}>
          <FaStar size={32} style={{ color: "#FF385C", marginBottom: "1rem" }} />
          <h3>Expériences uniques</h3>
          <p>Vivez des moments inoubliables : soirées, sports, sorties et activités locales.</p>
        </div>

        <div style={{ padding: "1.5rem", border: "1px solid #eee", borderRadius: "8px", textAlign: "center" }}>
          <FaMobileAlt size={32} style={{ color: "#FF385C", marginBottom: "1rem" }} />
          <h3>Application moderne</h3>
          <p>Simple, fluide et rapide, Flexii vous permet de réserver en quelques clics.</p>
        </div>
      </div>
    </div>
  );
}
