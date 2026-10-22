import { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Malashree Cloud Kitchen",
  description:
    "Understand Malashree's refund and cancellation policy for food orders. Learn when cancellations are accepted and how refunds are processed.",
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund & Cancellation Policy"
      subtitle="We want every meal to be perfect. Here's how we handle cancellations and refunds."
      lastUpdated="22 October 2026"
    >
      <div className="highlight-box">
        <p>
          <strong>Important:</strong> Due to the perishable nature of food, our cancellation window is limited. We strongly encourage you to review your order carefully before confirming payment.
        </p>
      </div>

      <h2>1. Cancellation by Customer</h2>
      <h3>1.1 Before Order Acceptance</h3>
      <p>
        You may cancel your order at no charge <strong>within 2 minutes</strong> of placing it, provided the kitchen has not yet accepted your order. To cancel, go to <em>My Orders &rarr; Order Details &rarr; Cancel Order</em>.
      </p>
      <h3>1.2 After Order Acceptance / Food Preparation</h3>
      <p>
        Once the kitchen has accepted and begun preparing your order, cancellation is <strong>not permitted</strong>. This is because food preparation starts immediately upon acceptance, and cancelling at this stage results in unavoidable food waste.
      </p>
      <h3>1.3 Cancellation Due to Incorrect Order</h3>
      <p>
        If the order items received are incorrect (different from what was ordered), please contact our support team within <strong>30 minutes of delivery</strong> with photographic evidence. We will review and resolve this promptly.
      </p>

      <h2>2. Cancellation by Malashree</h2>
      <p>
        We reserve the right to cancel orders in the following circumstances:
      </p>
      <ul>
        <li>The selected item(s) are temporarily unavailable.</li>
        <li>The delivery location is outside our service area.</li>
        <li>Payment was not successfully processed or is suspected to be fraudulent.</li>
        <li>Unforeseen operational circumstances (e.g., kitchen closure, extreme weather).</li>
      </ul>
      <p>
        In all such cases, a <strong>full refund</strong> will be issued to your original payment method.
      </p>

      <h2>3. Refund Eligibility</h2>
      <p>Refunds will be considered in the following cases:</p>
      <ul>
        <li>Order cancelled by Malashree (full refund).</li>
        <li>Order cancelled by customer within the eligible window (full refund).</li>
        <li>Incorrect items delivered — verified by support team (full or partial refund at our discretion).</li>
        <li>Order not delivered within a reasonable timeframe (case-by-case basis).</li>
        <li>Significant quality issues documented with photo evidence within 30 minutes of delivery.</li>
      </ul>
      <p>
        <strong>Refunds are not applicable for:</strong>
      </p>
      <ul>
        <li>Change of mind after food preparation has begun.</li>
        <li>Incorrect delivery address provided by the customer.</li>
        <li>Delayed delivery due to customer unavailability at the address.</li>
        <li>Complaints raised after 30 minutes of delivery without valid evidence.</li>
      </ul>

      <h2>4. Refund Process</h2>
      <h3>4.1 How to Request a Refund</h3>
      <p>
        Contact our support team at <a href="mailto:support@malashreekitchen.in">support@malashreekitchen.in</a> or via the in-app support feature with:
      </p>
      <ul>
        <li>Your Order ID.</li>
        <li>Description of the issue.</li>
        <li>Photographs (if applicable).</li>
      </ul>
      <h3>4.2 Refund Timeline</h3>
      <p>
        Once a refund is approved, the amount will be credited to your original payment source as follows:
      </p>
      <ul>
        <li><strong>UPI / Wallets:</strong> Within 1–3 business days.</li>
        <li><strong>Credit / Debit Cards:</strong> Within 5–7 business days (may vary by bank).</li>
        <li><strong>Net Banking:</strong> Within 3–5 business days.</li>
      </ul>
      <p>
        Malashree is not responsible for delays caused by banking institutions after the refund is initiated on our end.
      </p>

      <h2>5. Partial Refunds</h2>
      <p>
        In cases where part of the order was unsatisfactory or missing, we may issue a partial refund proportional to the affected items. Our support team will assess each case individually.
      </p>

      <h2>6. Dispute Resolution</h2>
      <p>
        If you are dissatisfied with our refund decision, you may escalate the matter by emailing <a href="mailto:grievance@malashreekitchen.in">grievance@malashreekitchen.in</a>. We aim to resolve all escalated disputes within 7 business days.
      </p>

      <h2>7. Contact Us</h2>
      <p>
        For refund or cancellation related queries, please contact us at:
      </p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:support@malashreekitchen.in">support@malashreekitchen.in</a></li>
        <li><strong>Support Hours:</strong> Monday to Saturday, 9:00 AM – 9:00 PM IST</li>
      </ul>
    </LegalPageLayout>
  );
}
