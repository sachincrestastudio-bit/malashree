import { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Malashree Pure Veg",
  description:
    "Learn about Malashree Pure Veg's delivery areas, delivery timelines, charges, and how we handle delivery issues.",
};

export default function ShippingPolicyPage() {
  return (
    <LegalPageLayout
      title="Shipping & Delivery Policy"
      subtitle="Fresh food delivered to your doorstep — here's everything you need to know."
      lastUpdated="22 October 2026"
    >
      <div className="highlight-box">
        <p>
          Malashree currently operates cloud kitchen branches across Pune. Delivery is only available to locations within our designated service areas. We are continuously expanding our reach.
        </p>
      </div>

      <h2>1. Delivery Coverage</h2>
      <p>
        We deliver from multiple cloud kitchen branches in Pune. Your order is automatically assigned to the nearest available branch based on your delivery address. Current delivery zones are displayed on the platform during address entry.
      </p>
      <p>
        If your address falls outside our service area, you will be notified before checkout. We do not currently offer nationwide or inter-city delivery.
      </p>

      <h2>2. Delivery Timelines</h2>
      <p>
        Estimated delivery times depend on:
      </p>
      <ul>
        <li>Your distance from the nearest branch.</li>
        <li>Current order volume and kitchen load.</li>
        <li>Time of day (peak vs. off-peak hours).</li>
        <li>Weather and traffic conditions.</li>
      </ul>
      <p>
        Typical delivery time is <strong>30–60 minutes</strong> from order placement. Real-time tracking is available in the app once your order is dispatched.
      </p>
      <p>
        <strong>Please note:</strong> Delivery timelines are estimates, not guarantees. We strive to meet them but are not liable for delays due to factors beyond our control.
      </p>

      <h2>3. Delivery Charges</h2>
      <p>
        Delivery charges are calculated based on your distance from the branch and will be displayed clearly at checkout before you confirm payment. These charges are non-refundable unless the order was cancelled by Malashree.
      </p>
      <p>
        Promotional offers may include free delivery for eligible orders. Check the Offers section for current promotions.
      </p>

      <h2>4. Order Tracking</h2>
      <p>
        Once your order is accepted and dispatched, you can track its real-time status via:
      </p>
      <ul>
        <li>The platform under <em>My Orders &rarr; Track Order</em>.</li>
        <li>SMS/WhatsApp notifications (if opted in).</li>
      </ul>

      <h2>5. Delivery Attempts</h2>
      <p>
        Our delivery partner will attempt to deliver to the address provided. Please ensure:
      </p>
      <ul>
        <li>Someone is available at the delivery address during the estimated time window.</li>
        <li>The address, including building/flat number and landmark, is accurate.</li>
        <li>You are reachable on the contact number provided.</li>
      </ul>
      <p>
        If delivery is unsuccessful due to customer unavailability or an incorrect address, we may not be able to reattempt delivery. In such cases, a refund will not be applicable as the food would already have been prepared and dispatched.
      </p>

      <h2>6. Contactless Delivery</h2>
      <p>
        We offer contactless delivery as the default option. Your food will be left at your door. If you require an attended delivery, please add a note in the order special instructions.
      </p>

      <h2>7. Damaged or Missing Items</h2>
      <p>
        If your order arrives damaged, incomplete, or incorrect, please:
      </p>
      <ul>
        <li>Take clear photographs of the items received.</li>
        <li>Contact our support team within <strong>30 minutes of delivery</strong>.</li>
        <li>Provide your Order ID and photographs.</li>
      </ul>
      <p>
        We will investigate and offer a replacement, credit, or refund as appropriate. Claims raised after 30 minutes of delivery may not be eligible.
      </p>

      <h2>8. Force Majeure</h2>
      <p>
        We shall not be liable for any delay or failure to deliver due to circumstances beyond our reasonable control, including but not limited to natural disasters, government restrictions, curfews, extreme weather events, or civil unrest.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        For delivery-related queries, reach us at:
      </p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:support@malashreekitchen.in">support@malashreekitchen.in</a></li>
        <li><strong>Support Hours:</strong> Monday to Saturday, 9:00 AM – 9:00 PM IST</li>
      </ul>
    </LegalPageLayout>
  );
}
