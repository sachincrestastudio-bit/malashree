import { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | Malashree Pure Veg",
  description:
    "Learn how Malashree Pure Veg collects, uses, and protects your personal data. We are committed to your privacy and data security.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="Your privacy is important to us. This policy explains how we handle your data."
      lastUpdated="22 October 2026"
    >
      <div className="highlight-box">
        <p>
          Malashree Pure Veg is committed to protecting your personal information. This Privacy Policy applies to all information collected through our website, mobile application, and related services.
        </p>
      </div>

      <h2>1. Information We Collect</h2>
      <h3>1.1 Information You Provide</h3>
      <ul>
        <li><strong>Account Information:</strong> Name, email address, phone number, and password when you register.</li>
        <li><strong>Order Information:</strong> Delivery address, order history, special instructions, and payment details (processed securely via our payment gateway).</li>
        <li><strong>Communication:</strong> Messages, feedback, reviews, and support queries you submit.</li>
        <li><strong>Profile Information:</strong> Dietary preferences, saved addresses, and any other optional details you choose to share.</li>
      </ul>
      <h3>1.2 Information Collected Automatically</h3>
      <ul>
        <li><strong>Device &amp; Usage Data:</strong> IP address, browser type, operating system, pages visited, and time spent on the platform.</li>
        <li><strong>Location Data:</strong> Approximate or precise location (with your consent) to determine the nearest branch and enable delivery.</li>
        <li><strong>Cookies &amp; Tracking:</strong> We use cookies and similar technologies to remember your preferences, session state, and improve user experience. See Section 8 for our Cookie Policy.</li>
      </ul>
      <h3>1.3 Information from Third Parties</h3>
      <p>
        We may receive information from payment processors, analytics providers, and other business partners to verify transactions and improve our services.
      </p>

      <h2>2. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Process and fulfil your orders, including delivery coordination.</li>
        <li>Send order confirmations, updates, and support communications.</li>
        <li>Manage your account and authenticate your identity.</li>
        <li>Personalise your experience (recommended dishes, branch selection).</li>
        <li>Process payments securely through our payment partners.</li>
        <li>Analyse usage patterns to improve our platform and services.</li>
        <li>Send promotional offers, updates, or marketing communications (with your consent).</li>
        <li>Comply with legal obligations and enforce our Terms &amp; Conditions.</li>
        <li>Detect, investigate, and prevent fraudulent or unauthorised activity.</li>
      </ul>

      <h2>3. Legal Basis for Processing (PDPB Compliance)</h2>
      <p>
        Under India&apos;s Digital Personal Data Protection Act, 2023 (DPDPA), we process your personal data on the following grounds:
      </p>
      <ul>
        <li><strong>Consent:</strong> For marketing communications, location access, and optional personalisation.</li>
        <li><strong>Contract:</strong> To deliver orders you have placed with us.</li>
        <li><strong>Legitimate Interests:</strong> For platform security, fraud prevention, and analytics.</li>
        <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulatory requirements.</li>
      </ul>

      <h2>4. Sharing of Information</h2>
      <p>We may share your information with:</p>
      <ul>
        <li><strong>Delivery Partners:</strong> Name, phone number, and delivery address to fulfil your order.</li>
        <li><strong>Payment Processors:</strong> Razorpay and other PCI-DSS compliant payment service providers.</li>
        <li><strong>Service Providers:</strong> Cloud hosting, SMS/email delivery, analytics, and customer support tools.</li>
        <li><strong>Legal Authorities:</strong> When required by law, court order, or government regulation.</li>
      </ul>
      <p>
        We <strong>do not</strong> sell your personal data to third parties for marketing purposes.
      </p>

      <h2>5. Data Retention</h2>
      <p>
        We retain your personal data for as long as your account is active or as needed to provide services. Order data is retained for a minimum of 7 years for financial and compliance purposes. You may request deletion of your account and associated data at any time (subject to legal retention requirements).
      </p>

      <h2>6. Data Security</h2>
      <p>
        We implement industry-standard security measures including SSL/TLS encryption, secure password hashing, and access control to protect your data. Payment information is handled exclusively by our PCI-DSS certified payment partners and is never stored on our servers in unencrypted form.
      </p>

      <h2>7. Your Rights</h2>
      <p>Under applicable Indian data protection law, you have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Correct inaccurate or incomplete data.</li>
        <li>Request deletion of your personal data.</li>
        <li>Withdraw consent for marketing communications at any time.</li>
        <li>Lodge a complaint with the relevant data protection authority.</li>
      </ul>
      <p>
        To exercise these rights, email us at{" "}
        <a href="mailto:privacy@malashreekitchen.in">privacy@malashreekitchen.in</a>.
      </p>

      <h2>8. Cookie Policy</h2>
      <p>We use the following types of cookies:</p>
      <ul>
        <li><strong>Essential Cookies:</strong> Required for the platform to function (authentication, cart state).</li>
        <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform.</li>
        <li><strong>Preference Cookies:</strong> Remember your settings, location, and branch selection.</li>
      </ul>
      <p>
        You can manage cookie preferences through your browser settings. Disabling essential cookies may affect platform functionality.
      </p>

      <h2>9. Children&apos;s Privacy</h2>
      <p>
        Our platform is not intended for children under 18 years of age. We do not knowingly collect personal data from children. If we become aware that a child has provided us with personal data, we will promptly delete it.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy periodically. The updated version will be posted on this page with a revised &ldquo;Last Updated&rdquo; date. We encourage you to review this page regularly.
      </p>

      <h2>11. Contact — Data Grievance Officer</h2>
      <p>
        If you have concerns about your data or this policy, please contact our designated Grievance Officer:
      </p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:privacy@malashreekitchen.in">privacy@malashreekitchen.in</a></li>
        <li><strong>Response Time:</strong> We will acknowledge your request within 72 hours and resolve it within 30 days.</li>
      </ul>
    </LegalPageLayout>
  );
}
