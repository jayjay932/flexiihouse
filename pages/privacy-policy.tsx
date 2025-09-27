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
        Flexii ("we", "our", "us") respects your privacy and is committed to
        protecting the personal data of its users ("you"). This Privacy Policy
        explains how we collect, use, and safeguard your information when you
        use our mobile application and services.
      </p>

      <h2>2. Information We Collect</h2>
      <ul>
        <li>
          <strong>Personal Data:</strong> such as your name, email address,
          phone number, and payment details when creating an account or making
          a booking.
        </li>
        <li>
          <strong>Usage Data:</strong> including interactions with the app,
          device information, and IP address.
        </li>
        <li>
          <strong>Location Data:</strong> if you consent, we may collect
          approximate or precise location data to enhance our services.
        </li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Provide, operate, and improve our services.</li>
        <li>Process bookings, payments, and transactions.</li>
        <li>Send important notifications and updates.</li>
        <li>Comply with legal and regulatory obligations.</li>
      </ul>

      <h2>4. Data Sharing</h2>
      <p>We do not sell your personal data. We may share certain information with:</p>
      <ul>
        <li>Our technical service providers and partners.</li>
        <li>Legal authorities if required by law.</li>
        <li>Business partners only with your explicit consent.</li>
      </ul>

      <h2>5. Data Retention</h2>
      <p>
        We keep your personal data only as long as necessary to fulfill the
        purposes described in this Privacy Policy or as required by law.
      </p>

      <h2>6. Your Rights</h2>
      <p>
        Under GDPR and applicable laws, you have the following rights:
      </p>
      <ul>
        <li>Access your personal data.</li>
        <li>Request correction or deletion of your data.</li>
        <li>Withdraw consent to data processing.</li>
        <li>Request data portability.</li>
      </ul>

      <h2>7. Security</h2>
      <p>
        We implement appropriate technical and organizational measures to
        protect your personal information. However, no system is 100% secure,
        and we encourage you to protect your login credentials.
      </p>

      <h2>8. Children’s Privacy</h2>
      <p>
        Our app is not intended for children under 13. We do not knowingly
        collect data from them. If you believe we have collected such data,
        please contact us immediately.
      </p>

      <h2>9. Changes to this Policy</h2>
      <p>
        We may update this Privacy Policy periodically. Any changes will be
        posted on this page with the updated date.
      </p>

      <h2>10. Contact</h2>
      <p>
        For any questions regarding this Privacy Policy, please contact us at:
      </p>
      <p>
        📧{" "}
        <a href="mailto:flexii@flexiihouse.com">flexii@flexiihouse.com</a>
      </p>
    </div>
  );
};

export default PrivacyPolicy;
