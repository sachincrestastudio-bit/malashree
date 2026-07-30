import Razorpay from "razorpay";
import crypto from "crypto";

export class RazorpayService {
  private static get instance() {
    return new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mockKey",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "mockSecret",
    });
  }

  /**
   * Creates a Razorpay Order
   * @param amount In INR (rupees)
   * @param receipt Receipt identifier
   */
  static async createOrder(amount: number, receipt: string) {
    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: receipt,
    };

    // In production, this awaits razorpay API.
    // For local dev without keys, we might want to mock if keys are 'mockSecret'
    if (process.env.RAZORPAY_KEY_SECRET === "mockSecret") {
      return {
        id: `order_mock_${Date.now()}`,
        amount: options.amount,
        currency: "INR",
        receipt: receipt,
        status: "created",
      };
    }
    return await this.instance.orders.create(options);
  }

  /**
   * Validates the webhook or payment signature using HMAC SHA256
   */
  static verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET || "mockSecret";
    const body = orderId + "|" + paymentId;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    return expectedSignature === signature;
  }

  /**
   * Triggers a refund
   */
  static async initiateRefund(paymentId: string, amount?: number) {
    if (process.env.RAZORPAY_KEY_SECRET === "mockSecret") {
      return { id: `rfnd_mock_${Date.now()}`, status: "processed", amount: (amount || 0) * 100 };
    }
    if (amount) {
      return await this.instance.payments.refund(paymentId, { amount: amount * 100 });
    }
    return await this.instance.payments.refund(paymentId, {} as any);
  }
}
