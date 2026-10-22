import { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions | Malashree Cloud Kitchen",
  description:
    "Read the Terms and Conditions governing your use of Malashree's food ordering platform. Understand your rights, obligations, and our policies.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before using our platform."
      lastUpdated="22 October 2026"
    >
      <div className="highlight-box">
        <p>
          By accessing or using the Malashree platform (website, app, or any related service), you agree to be bound by these Terms and Conditions. If you disagree with any part, please discontinue use of our services.
        </p>
      </div>

      <h2>1. About Malashree</h2>
      <p>
        Malashree Cloud Kitchen (&ldquo;Malashree&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is a pure-vegetarian food brand operating cloud kitchen branches across Pune, India. We provide online food ordering and delivery services directly to consumers through our digital platform.
      </p>
      <p>
        <strong>Business Address:</strong> Malashree Cloud Kitchen, Pune, Maharashtra, India.<br />
        <strong>Contact Email:</strong> support@malashreekitchen.in
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 18 years of age to use our platform. By using our services, you represent and warrant that:
      </p>
      <ul>
        <li>You are at least 18 years old.</li>
        <li>You have the legal capacity to enter into a binding contract.</li>
        <li>You will use the platform in compliance with applicable laws.</li>
        <li>All information you provide is accurate and current.</li>
      </ul>

      <h2>3. Use of the Platform</h2>
      <h3>3.1 Account Registration</h3>
      <p>
        You may need to register for an account to place orders. You are responsible for maintaining the confidentiality of your login credentials and all activities under your account. Notify us immediately of any unauthorized use.
      </p>
      <h3>3.2 Prohibited Conduct</h3>
      <p>You agree not to:</p>
      <ul>
        <li>Use the platform for unlawful purposes.</li>
        <li>Attempt to gain unauthorized access to any part of the platform.</li>
        <li>Interfere with or disrupt the integrity or performance of the platform.</li>
        <li>Submit false, misleading, or fraudulent orders or reviews.</li>
        <li>Resell or commercially exploit any part of the service without written permission.</li>
        <li>Use automated tools (bots, scrapers) without prior written consent.</li>
      </ul>

      <h2>4. Orders and Payments</h2>
      <h3>4.1 Order Placement</h3>
      <p>
        When you place an order, you make a binding offer to purchase the items selected. We reserve the right to accept or reject any order at our discretion, including if items are unavailable, if errors occur in pricing, or if fraudulent activity is detected.
      </p>
      <h3>4.2 Pricing</h3>
      <p>
        All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes. Prices may vary between branches. Delivery charges, if applicable, will be shown at checkout before payment confirmation.
      </p>
      <h3>4.3 Payment</h3>
      <p>
        We accept payments via UPI, credit/debit cards, net banking, and digital wallets through our payment gateway partners (Razorpay). All transactions are encrypted and secure. We do not store your full card details.
      </p>
      <h3>4.4 Order Confirmation</h3>
      <p>
        An order is confirmed only upon successful payment processing. You will receive a confirmation notification via the platform. In the event of payment failure, your order will not be processed.
      </p>

      <h2>5. Delivery</h2>
      <p>
        Delivery timelines are estimates and may vary based on location, demand, weather, and other factors. We are not liable for delays beyond our reasonable control. Please refer to our{" "}
        <a href="/shipping-policy">Shipping &amp; Delivery Policy</a> for full details.
      </p>

      <h2>6. Cancellations and Refunds</h2>
      <p>
        Cancellations and refunds are governed by our{" "}
        <a href="/refund-policy">Refund &amp; Cancellation Policy</a>. Once food preparation has begun, cancellations may not be accepted. Approved refunds will be processed to the original payment method within 5–7 business days.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        All content on the Malashree platform — including logos, graphics, text, menu descriptions, photographs, and software — is the intellectual property of Malashree Cloud Kitchen and is protected under applicable Indian intellectual property laws. You may not reproduce, distribute, or use any content without our prior written consent.
      </p>

      <h2>8. User-Generated Content</h2>
      <p>
        By submitting reviews, ratings, or other content, you grant Malashree a non-exclusive, royalty-free, perpetual licence to use, display, and reproduce such content in connection with our services. You represent that your content is accurate and does not infringe any third-party rights.
      </p>

      <h2>9. Disclaimer of Warranties</h2>
      <p>
        The platform and services are provided &ldquo;as is&rdquo; without warranties of any kind, express or implied. We do not guarantee uninterrupted or error-free service. Food allergen information is provided in good faith; however, cross-contamination may occur in shared kitchen environments.
      </p>

      <h2>10. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by Indian law, Malashree shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our platform or services. Our total liability in any matter shall not exceed the amount paid by you for the specific order in dispute.
      </p>

      <h2>11. Governing Law &amp; Jurisdiction</h2>
      <p>
        These Terms shall be governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Pune, Maharashtra, India. We encourage resolution of disputes through mutual dialogue before resorting to legal proceedings.
      </p>

      <h2>12. Modifications to Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. Continued use of the platform after changes are posted constitutes your acceptance of the revised Terms. We will notify users of material changes via email or in-platform notification.
      </p>

      <h2>13. Contact Us</h2>
      <p>
        For any questions about these Terms, please contact us at{" "}
        <a href="mailto:support@malashreekitchen.in">support@malashreekitchen.in</a> or visit our{" "}
        <a href="/contact">Contact Us</a> page.
      </p>
    </LegalPageLayout>
  );
}
