import { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Contact Us | Malashree Pure Veg",
  description:
    "Get in touch with Malashree Pure Veg for support, partnership, or feedback. We're here to help.",
};

export default function ContactPage() {
  return (
    <LegalPageLayout
      title="Contact Us"
      subtitle="Have a question or need help? We'd love to hear from you."
      lastUpdated="22 October 2026"
    >
      <h2>Our Details</h2>
      <p>
        <strong>Malashree Pure Veg</strong><br />
        Pune, Maharashtra, India
      </p>

      <h2>Support</h2>
      <ul>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:support@malashreekitchen.in">support@malashreekitchen.in</a>
        </li>
        <li>
          <strong>Support Hours:</strong> Monday to Saturday, 9:00 AM – 9:00 PM IST
        </li>
      </ul>

      <div className="highlight-box">
        <p>
          <strong>For fastest support</strong> — mention your Order ID in the subject line when emailing us. We aim to respond within 4 business hours during support hours.
        </p>
      </div>

      <h2>Grievance Officer</h2>
      <p>
        In accordance with the Information Technology Act, 2000 and India's Digital Personal Data Protection Act, 2023, the name and contact details of the Grievance Officer are:
      </p>
      <ul>
        <li><strong>Name:</strong> Malashree Grievance Officer</li>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:grievance@malashreekitchen.in">grievance@malashreekitchen.in</a>
        </li>
        <li><strong>Address:</strong> Malashree Pure Veg, Pune, Maharashtra, India</li>
        <li><strong>Response Time:</strong> Within 30 days of receipt of complaint</li>
      </ul>

      <h2>Privacy Queries</h2>
      <ul>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:privacy@malashreekitchen.in">privacy@malashreekitchen.in</a>
        </li>
      </ul>

      <h2>Business & Partnership Enquiries</h2>
      <ul>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:business@malashreekitchen.in">business@malashreekitchen.in</a>
        </li>
      </ul>

      <h2>Useful Links</h2>
      <ul>
        <li><a href="/terms">Terms &amp; Conditions</a></li>
        <li><a href="/privacy">Privacy Policy</a></li>
        <li><a href="/refund-policy">Refund &amp; Cancellation Policy</a></li>
        <li><a href="/shipping-policy">Shipping &amp; Delivery Policy</a></li>
      </ul>
    </LegalPageLayout>
  );
}
