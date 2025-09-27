import { NextPage } from "next";

const PolitiqueConfidentialite: NextPage = () => {
  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", lineHeight: "1.6" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        Politique de Confidentialité – Flexii
      </h1>
      <p>
        Dernière mise à jour :{" "}
        {new Date().toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <h2>1. Introduction</h2>
      <p>
        Flexii (« nous », « notre » ou « nos ») respecte votre vie privée et
        s’engage à protéger les données personnelles de ses utilisateurs («
        vous »). La présente Politique de Confidentialité explique comment nous
        collectons, utilisons et protégeons vos informations lorsque vous
        utilisez notre application mobile et nos services.
      </p>

      <h2>2. Informations collectées</h2>
      <ul>
        <li>
          <strong>Données personnelles :</strong> telles que votre nom, adresse
          e-mail, numéro de téléphone et informations de paiement lors de la
          création d’un compte ou d’une réservation.
        </li>
        <li>
          <strong>Données d’utilisation :</strong> incluant vos interactions avec
          l’application, des informations sur votre appareil et votre adresse IP.
        </li>
        <li>
          <strong>Données de localisation :</strong> si vous donnez votre accord,
          nous pouvons collecter vos données de localisation approximative ou
          précise pour améliorer nos services.
        </li>
      </ul>

      <h2>3. Utilisation de vos informations</h2>
      <p>Nous utilisons vos données notamment pour :</p>
      <ul>
        <li>Fournir et améliorer nos services.</li>
        <li>Traiter vos réservations, paiements et transactions.</li>
        <li>Vous envoyer des notifications importantes et des mises à jour.</li>
        <li>Respecter nos obligations légales et réglementaires.</li>
      </ul>

      <h2>4. Partage des données</h2>
      <p>
        Nous ne vendons pas vos données personnelles. Nous pouvons partager
        certaines informations avec :
      </p>
      <ul>
        <li>Nos prestataires de services techniques et partenaires.</li>
        <li>Les autorités légales si la loi l’exige.</li>
        <li>Des partenaires commerciaux uniquement avec votre consentement explicite.</li>
      </ul>

      <h2>5. Conservation des données</h2>
      <p>
        Vos informations personnelles sont conservées uniquement pendant la durée
        nécessaire aux finalités décrites dans cette Politique ou conformément à
        la loi en vigueur.
      </p>

      <h2>6. Vos droits</h2>
      <p>
        Conformément au RGPD et aux lois applicables, vous disposez des droits
        suivants :
      </p>
      <ul>
        <li>Accéder à vos données personnelles.</li>
        <li>Demander la rectification ou la suppression de vos données.</li>
        <li>Retirer votre consentement au traitement de vos données.</li>
        <li>Demander la portabilité de vos données.</li>
      </ul>

      <h2>7. Sécurité</h2>
      <p>
        Nous mettons en œuvre des mesures techniques et organisationnelles
        appropriées pour protéger vos informations personnelles. Cependant,
        aucun système n’est totalement sécurisé et nous vous encourageons à
        protéger vos identifiants de connexion.
      </p>

      <h2>8. Protection des mineurs</h2>
      <p>
        Notre application n’est pas destinée aux enfants de moins de 13 ans.
        Nous ne collectons pas volontairement de données auprès d’eux. Si vous
        pensez que nous avons collecté de telles données, veuillez nous
        contacter immédiatement.
      </p>

      <h2>9. Modifications de cette Politique</h2>
      <p>
        Nous pouvons mettre à jour cette Politique de Confidentialité
        périodiquement. Toute modification sera publiée sur cette page avec la
        date de mise à jour.
      </p>

      <h2>10. Contact</h2>
      <p>
        Pour toute question relative à cette Politique de Confidentialité,
        veuillez nous contacter à l’adresse suivante :
      </p>
      <p>
        📧{" "}
        <a href="mailto:flexii@flexiihouse.com">flexii@flexiihouse.com</a>
      </p>
    </div>
  );
};

export default PolitiqueConfidentialite;
