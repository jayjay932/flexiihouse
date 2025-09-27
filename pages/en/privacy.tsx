import { NextPage } from "next";

const PrivacyPolicy: NextPage = () => {
  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", lineHeight: "1.6" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        Privacy Policy – Flexii
      </h1>
      <p>
        Last updated:{" "}
        {new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <h2>1. Introduction</h2>
      <p>
        Flexii ("we", "our", or "us") values your privacy and is committed to protecting your personal data. 
        This Privacy Policy explains how we collect, use, and safeguard your information when you use our app and services.
      </p>

      <h2>2. Information We Collect</h2>
      <ul>
        <li>
          <strong>Personal Data:</strong> such as your name, email, phone number, and payment information when creating an account or booking.
        </li>
        <li>
          <strong>Usage Data:</strong> including interactions with the app, device details, and IP address.
        </li>
        <li>
          <strong>Location Data:</strong> if you allow it, we may collect approximate or precise location to enhance services.
        </li>
      </ul>

      <h2>3. Use of Your Information</h2>
      <p>We use your data to:</p>
      <ul>
        <li>Provide and improve our services.</li>
        <li>Process bookings, payments, and transactions.</li>
        <li>Send important notifications and updates.</li>
        <li>Comply with legal and regulatory obligations.</li>
      </ul>

      <h2>4. Data Sharing</h2>
      <p>
        We do not sell your personal data. We may share information with:
      </p>
      <ul>
        <li>Our service providers and technical partners.</li>
        <li>Authorities when required by law.</li>
        <li>Business partners, only with your explicit consent.</li>
      </ul>

      <h2>5. Data Retention</h2>
      <p>
        We retain your personal data only as long as necessary for the purposes outlined in this policy or as required by law.
      </p>

      <h2>6. Your Rights</h2>
      <p>Depending on your location, you may have the right to:</p>
      <ul>
        <li>Access your personal data.</li>
        <li>Request correction or deletion of your data.</li>
        <li>Withdraw your consent to data processing.</li>
        <li>Request portability of your data.</li>
      </ul>

      <h2>7. Security</h2>
      <p>
        We implement reasonable security measures to protect your personal data. However, no system is completely secure, 
        so we encourage you to keep your login details safe.
      </p>

      <h2>8. Children’s Privacy</h2>
      <p>
        Our app is not intended for children under 13. We do not knowingly collect data from them. 
        If you believe we have collected such data, please contact us immediately.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy periodically. Any changes will be posted here with the updated date.
      </p>

      <h2>10. Contact</h2>
      <p>
        For any questions about this Privacy Policy, please contact us at:
      </p>
      <p>
        📧{" "}
        <a href="mailto:flexii@flexiihouse.com">flexii@flexiihouse.com</a>
      </p>
    </div>
  );
};

export default PrivacyPolicy;
