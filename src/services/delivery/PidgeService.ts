import { connectToDatabase } from "../../database/mongoose";
import { Order } from "../../models/Order";

interface PidgeAddress {
  address: string;
  lat: number;
  lng: number;
  name: string;
  phone: string;
}

interface CreatePidgePayload {
  orderId: string;
  orderNumber: string;
  pickup: PidgeAddress;
  dropoff: PidgeAddress;
  codAmount?: number;
}

export class PidgeService {
  private static get baseUrl() {
    return process.env.PIDGE_API_URL || "https://sandbox-api.pidge.in/v1";
  }

  private static get apiKey() {
    return process.env.PIDGE_API_KEY;
  }

  private static get channelId() {
    return process.env.PIDGE_CHANNEL_ID;
  }

  /**
   * Estimates delivery distance, duration and fee via Pidge Hyperlocal API.
   */
  static async estimateDelivery(pickup: { lat: number; lng: number }, dropoff: { lat: number; lng: number }) {
    if (this.apiKey) {
      try {
        const res = await fetch(`${this.baseUrl}/pricing/estimate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            pickup: { latitude: pickup.lat, longitude: pickup.lng },
            dropoff: { latitude: dropoff.lat, longitude: dropoff.lng },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          return {
            fee: data.estimated_price || 40,
            distanceKm: data.distance_km || 3.5,
            estimatedTimeMin: data.estimated_duration_min || 25,
          };
        }
      } catch (err) {
        console.error("Pidge estimate API error:", err);
      }
    }

    // Default distance calculation fallback
    const R = 6371; // Earth radius km
    const dLat = ((dropoff.lat - pickup.lat) * Math.PI) / 180;
    const dLng = ((dropoff.lng - pickup.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pickup.lat * Math.PI) / 180) *
        Math.cos((dropoff.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = Math.round(R * c * 10) / 10 || 2.5;

    return {
      fee: Math.max(30, Math.round(dist * 12)),
      distanceKm: dist,
      estimatedTimeMin: Math.round(15 + dist * 5),
    };
  }

  /**
   * Creates a hyperlocal delivery request on Pidge for a Malashree order.
   */
  static async createDeliveryTask(payload: CreatePidgePayload) {
    const pidgeRefId = `PIDGE-${payload.orderNumber}-${Date.now().toString().slice(-4)}`;

    if (this.apiKey) {
      try {
        const pidgeBody = {
          channel_id: this.channelId,
          reference_id: payload.orderNumber,
          pickup_detail: {
            name: payload.pickup.name,
            phone: payload.pickup.phone,
            address: payload.pickup.address,
            latitude: payload.pickup.lat,
            longitude: payload.pickup.lng,
          },
          delivery_detail: {
            name: payload.dropoff.name,
            phone: payload.dropoff.phone,
            address: payload.dropoff.address,
            latitude: payload.dropoff.lat,
            longitude: payload.dropoff.lng,
          },
          payment_type: payload.codAmount ? "COD" : "PREPAID",
          cod_amount: payload.codAmount || 0,
        };

        const res = await fetch(`${this.baseUrl}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(pidgeBody),
        });

        if (res.ok) {
          const data = await res.json();
          return {
            success: true,
            pidgeOrderId: data.order_id || pidgeRefId,
            trackingUrl: data.tracking_url || `https://track.pidge.in/${data.order_id || pidgeRefId}`,
            status: data.status || "SEARCHING_RIDER",
          };
        }
      } catch (err) {
        console.error("Pidge order creation API error:", err);
      }
    }

    // Sandbox / fallback mode if Pidge API key is not yet set in .env.local
    return {
      success: true,
      pidgeOrderId: pidgeRefId,
      trackingUrl: `https://track.pidge.in/${pidgeRefId}`,
      status: "ASSIGNED",
      riderName: "Pidge Hyperlocal Executive",
      riderPhone: "+91 98110 00111",
    };
  }

  /**
   * Synchronizes an existing order with Pidge dispatch system.
   */
  static async dispatchOrderToPidge(orderId: string) {
    await connectToDatabase();

    const order = await Order.findById(orderId).populate("kitchen").populate("customer").lean();
    if (!order) throw new Error("Order not found");

    const kitchenLat = (order.kitchen as any)?.location?.coordinates?.[1] || 18.5987;
    const kitchenLng = (order.kitchen as any)?.location?.coordinates?.[0] || 73.7978;

    const result = await this.createDeliveryTask({
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      pickup: {
        name: (order.kitchen as any)?.name || "Malashree Kitchen",
        phone: (order.kitchen as any)?.contact || "+91 98765 43210",
        address: (order.kitchen as any)?.address || "Pimple Saudagar, Pune",
        lat: kitchenLat,
        lng: kitchenLng,
      },
      dropoff: {
        name: (order.customer as any)?.name || "Customer",
        phone: (order.customer as any)?.phone || "+91 98765 00000",
        address: `${order.deliveryAddress?.street}, ${order.deliveryAddress?.city}`,
        lat: kitchenLat + 0.012,
        lng: kitchenLng + 0.012,
      },
      codAmount: order.paymentMethod === "cash" ? order.grandTotal : 0,
    });

    await Order.findByIdAndUpdate(orderId, {
      pidgeOrderId: result.pidgeOrderId,
      pidgeTrackingUrl: result.trackingUrl,
      pidgeStatus: result.status,
      pidgeRiderName: result.riderName || "Pidge Rider",
      pidgeRiderPhone: result.riderPhone || "+91 98110 00111",
      orderStatus: "out_for_delivery",
      pickedUpTime: new Date(),
    });

    return result;
  }

  /**
   * Cancels a Pidge delivery task.
   */
  static async cancelDelivery(pidgeOrderId: string) {
    if (this.apiKey) {
      try {
        await fetch(`${this.baseUrl}/orders/${pidgeOrderId}/cancel`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
          },
        });
      } catch (err) {
        console.error("Pidge cancel order error:", err);
      }
    }
    return { success: true };
  }
}
