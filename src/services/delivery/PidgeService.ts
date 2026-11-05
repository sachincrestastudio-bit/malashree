import { connectToDatabase } from "../../database/mongoose";
import { Order } from "../../models/Order";
import { SystemSetting } from "../../models/SystemSetting";
import { Kitchen } from "../../models/Kitchen";
import { User } from "../../models/User";

interface PidgeAddress {
  address: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  lat: number;
  lng: number;
  name: string;
  phone: string;
  email?: string;
}

interface CreatePidgePayload {
  orderId: string;
  orderNumber: string;
  pickup: PidgeAddress;
  dropoff: PidgeAddress;
  codAmount?: number;
  billAmount?: number;
  items?: Array<{ dishName: string; price: number; quantity: number }>;
}

export class PidgeService {
  private static cachedToken: string | null = null;
  private static tokenExpiryTime: number = 0;

  private static async getConfig() {
    let apiUrl = process.env.PIDGE_API_URL || "";
    let username = process.env.PIDGE_USERNAME || "";
    let password = process.env.PIDGE_PASSWORD || "";
    let brandCode = process.env.PIDGE_BRAND_CODE || "MALASHREE";
    let brandName = process.env.PIDGE_BRAND_NAME || "Malashree Pure Veg";
    let channel = process.env.PIDGE_CHANNEL || "DIRECT";

    if (!apiUrl || !username || !password) {
      try {
        await connectToDatabase();
        const setting = await SystemSetting.findOne().lean();
        if (setting) {
          if (!apiUrl && (setting as any).pidgeApiUrl) apiUrl = (setting as any).pidgeApiUrl;
          if (!username && (setting as any).pidgeUsername) username = (setting as any).pidgeUsername;
          if (!password && (setting as any).pidgePassword) password = (setting as any).pidgePassword;
          if ((setting as any).pidgeBrandCode) brandCode = (setting as any).pidgeBrandCode;
        }
      } catch (e) {
        console.error("Error reading Pidge settings from DB:", e);
      }
    }

    return {
      baseUrl: (apiUrl || "https://store.dev.pidge.in").replace(/\/+$/, ""),
      username: username || "webhook_6_142_2070",
      password: password || "57c4a64f677aec",
      brandCode: brandCode || "MALASHREE",
      brandName: brandName || "Malashree Pure Veg",
      channel: channel || "DIRECT",
    };
  }

  /**
   * Fetches and caches a valid Bearer token via /v1.0/store/channel/vendor/login
   */
  static async getAuthToken(forceRefresh = false): Promise<string | null> {
    const now = Date.now();
    if (!forceRefresh && this.cachedToken && this.tokenExpiryTime > now) {
      return this.cachedToken;
    }

    const config = await this.getConfig();
    if (!config.username || !config.password) {
      return null;
    }

    try {
      const res = await fetch(`${config.baseUrl}/v1.0/store/channel/vendor/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          username: config.username,
          password: config.password,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`Pidge login failed with HTTP ${res.status}:`, errText);
        return null;
      }

      const data = await res.json();
      const token = data?.data?.token; // e.g. "Bearer c3Rrbjo0..."
      if (token) {
        this.cachedToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        // Cache token for 6 hours (standard expiration is 12-24 hours)
        this.tokenExpiryTime = now + 6 * 60 * 60 * 1000;
        return this.cachedToken;
      }
    } catch (err) {
      console.error("Pidge getAuthToken network error:", err);
    }

    return null;
  }

  /**
   * Helper to perform authenticated requests to Pidge API with 401 retry handling
   */
  private static async request(endpoint: string, options: RequestInit = {}, retryOn401 = true): Promise<any> {
    const config = await this.getConfig();
    const token = await this.getAuthToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = token;
    }

    const url = `${config.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
    const res = await fetch(url, { ...options, headers });

    if (res.status === 401 && retryOn401) {
      console.warn("Pidge returned 401 Unauthorized. Refreshing token and retrying...");
      const freshToken = await this.getAuthToken(true);
      if (freshToken) {
        headers["Authorization"] = freshToken;
        const retryRes = await fetch(url, { ...options, headers });
        return retryRes;
      }
    }

    return res;
  }

  /**
   * Calculates distance between coordinates in kilometers (Haversine formula)
   */
  private static calculateDistanceKm(pickup: { lat: number; lng: number }, dropoff: { lat: number; lng: number }) {
    const R = 6371;
    const dLat = ((dropoff.lat - pickup.lat) * Math.PI) / 180;
    const dLng = ((dropoff.lng - pickup.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pickup.lat * Math.PI) / 180) *
        Math.cos((dropoff.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10 || 2.5;
  }

  /**
   * Estimates delivery distance, duration, serviceability and fee via Pidge Hyperlocal API.
   */
  static async estimateDelivery(pickup: { lat: number; lng: number }, dropoff: { lat: number; lng: number }) {
    const distKm = this.calculateDistanceKm(pickup, dropoff);
    const distanceMeters = Math.round(distKm * 1000);
    const config = await this.getConfig();

    try {
      const res = await this.request("/v1.0/store/channel/vendor/serviceability", {
        method: "POST",
        body: JSON.stringify({
          pickup: { lat: pickup.lat, lng: pickup.lng },
          drop: { lat: dropoff.lat, lng: dropoff.lng },
          distance: distanceMeters,
          brand: {
            code: config.brandCode,
            name: config.brandName,
          },
        }),
      });

      if (res && res.ok) {
        const data = await res.json();
        const serviceable = data?.data?.serviceable !== false;
        return {
          serviceable,
          fee: Math.max(30, Math.round(distKm * 12)),
          distanceKm: distKm,
          estimatedTimeMin: Math.round(15 + distKm * 5),
        };
      }
    } catch (err) {
      console.error("Pidge estimateDelivery API error:", err);
    }

    return {
      serviceable: true,
      fee: Math.max(30, Math.round(distKm * 12)),
      distanceKm: distKm,
      estimatedTimeMin: Math.round(15 + distKm * 5),
    };
  }

  /**
   * Creates a hyperlocal delivery order on Pidge.
   */
  static async createDeliveryTask(payload: CreatePidgePayload) {
    const config = await this.getConfig();
    const cleanPhone = (p?: string) => (p || "").replace(/[^0-9]/g, "").slice(-10) || "9876543210";

    const pidgePayload = {
      brand: {
        code: config.brandCode,
        name: config.brandName,
      },
      channel: config.channel,
      sender_detail: {
        address: {
          address_line_1: payload.pickup.address || "Malashree Pure Veg, Kunal Icon Road",
          address_line_2: payload.pickup.addressLine2 || "Pimple Saudagar",
          city: payload.pickup.city || "Pune",
          state: payload.pickup.state || "Maharashtra",
          country: "India",
          pincode: payload.pickup.pincode || "411027",
          latitude: payload.pickup.lat,
          longitude: payload.pickup.lng,
          instructions_to_reach: "Malashree Kitchen Pickup Desk",
        },
        name: payload.pickup.name || config.brandName,
        mobile: cleanPhone(payload.pickup.phone),
        email: payload.pickup.email || "orders@malashree.in",
      },
      poc_detail: {
        name: payload.pickup.name || "Kitchen Manager",
        mobile: cleanPhone(payload.pickup.phone),
        email: payload.pickup.email || "orders@malashree.in",
      },
      trips: [
        {
          receiver_detail: {
            address: {
              address_line_1: payload.dropoff.address || "Customer Address",
              address_line_2: payload.dropoff.addressLine2 || "",
              city: payload.dropoff.city || "Pune",
              state: payload.dropoff.state || "Maharashtra",
              country: "India",
              pincode: payload.dropoff.pincode || "411027",
              latitude: payload.dropoff.lat,
              longitude: payload.dropoff.lng,
              instructions_to_reach: "Customer Delivery",
            },
            name: payload.dropoff.name || "Valued Customer",
            mobile: cleanPhone(payload.dropoff.phone),
            email: payload.dropoff.email || "customer@malashree.in",
          },
          packages: [
            {
              label: "Meal Package",
              quantity: 1,
              dead_weight: 500,
              volumetric_weight: 500,
              length: 15,
              breadth: 15,
              height: 10,
            },
          ],
          source_order_id: payload.orderNumber,
          reference_id: `REF-${payload.orderNumber}`,
          cod_amount: payload.codAmount || 0,
          bill_amount: payload.billAmount || 100,
          order_category: "food",
          products: (payload.items || []).map((item) => ({
            name: item.dishName,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      ],
    };

    try {
      const res = await this.request("/v1.0/store/channel/vendor/order", {
        method: "POST",
        body: JSON.stringify(pidgePayload),
      });

      if (res && res.ok) {
        const data = await res.json();
        // Response format is { "data": { "{source_order_id}": "{pidge_id}" } }
        const pidgeOrderId = data?.data?.[payload.orderNumber] || Object.values(data?.data || {})[0] as string;

        if (pidgeOrderId) {
          // Fetch order details to retrieve track_code and live details
          let trackCode: string | null = null;
          let pidgeStatus = "CREATED";
          let riderName: string | undefined;
          let riderPhone: string | undefined;

          try {
            const statusRes = await this.getOrderStatus(pidgeOrderId);
            if (statusRes?.fulfillment) {
              trackCode = statusRes.fulfillment.track_code || null;
              pidgeStatus = statusRes.fulfillment.status || "CREATED";
              riderName = statusRes.fulfillment.rider?.name;
              riderPhone = statusRes.fulfillment.rider?.mobile;
            }
          } catch (e) {
            console.warn("Could not immediately fetch initial Pidge status:", e);
          }

          const isDev = config.baseUrl.includes(".dev.");
          const trackingBase = isDev ? "https://trace.dev.pidge.in" : "https://trace.pidge.in";
          const trackingUrl = trackCode
            ? `${trackingBase}/?code=${trackCode}`
            : `${trackingBase}/${pidgeOrderId}`;

          return {
            success: true,
            pidgeOrderId,
            trackingUrl,
            trackCode,
            status: pidgeStatus,
            riderName,
            riderPhone,
          };
        }
      } else if (res) {
        const errorText = await res.text();
        console.error(`Pidge create order failed with status ${res.status}:`, errorText);
        throw new Error(`Pidge order creation failed (${res.status}): ${errorText}`);
      }
    } catch (err: any) {
      console.error("Pidge order creation error:", err);
      throw err;
    }

    throw new Error("Failed to create order on Pidge: Unknown error");
  }

  /**
   * Retrieves order status and fulfillment information from Pidge
   */
  static async getOrderStatus(pidgeOrderId: string) {
    const res = await this.request(`/v1.0/store/channel/vendor/order/${pidgeOrderId}`, {
      method: "GET",
    });

    if (res && res.ok) {
      const data = await res.json();
      return data?.data;
    }
    return null;
  }

  /**
   * Synchronizes an existing order with Pidge dispatch system.
   */
  static async dispatchOrderToPidge(orderId: string) {
    await connectToDatabase();

    // Ensure models are initialized in Mongoose registry
    if (!Kitchen || !User) {
      console.warn("Kitchen or User model not loaded");
    }

    const order = await Order.findById(orderId).populate("kitchen").populate("customer").lean();
    if (!order) throw new Error("Order not found");

    const kitchenLat = (order.kitchen as any)?.location?.coordinates?.[1] || 18.5987;
    const kitchenLng = (order.kitchen as any)?.location?.coordinates?.[0] || 73.7978;

    const customerAddress = order.deliveryAddress
      ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`
      : "Pimple Saudagar, Pune";

    // Approximate dropoff coordinates if not stored separately
    const dropLat = kitchenLat + 0.008;
    const dropLng = kitchenLng + 0.008;

    const result = await this.createDeliveryTask({
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      pickup: {
        name: (order.kitchen as any)?.name || "Malashree Pure Veg",
        phone: (order.kitchen as any)?.contact || "+91 98765 43210",
        address: (order.kitchen as any)?.address || "Kunal Icon Road, Pimple Saudagar, Pune",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411027",
        lat: kitchenLat,
        lng: kitchenLng,
      },
      dropoff: {
        name: (order.customer as any)?.name || "Customer",
        phone: (order.customer as any)?.phone || "+91 98765 00000",
        address: customerAddress,
        city: order.deliveryAddress?.city || "Pune",
        state: order.deliveryAddress?.state || "Maharashtra",
        pincode: order.deliveryAddress?.zipCode || "411027",
        lat: dropLat,
        lng: dropLng,
      },
      codAmount: order.paymentMethod === "cash" ? order.grandTotal : 0,
      billAmount: order.grandTotal,
      items: (order.items || []).map((i: any) => ({
        dishName: i.dishName,
        price: i.price,
        quantity: i.quantity,
      })),
    });

    await Order.findByIdAndUpdate(orderId, {
      pidgeOrderId: result.pidgeOrderId,
      pidgeTrackingUrl: result.trackingUrl,
      pidgeStatus: result.status,
      pidgeRiderName: result.riderName || "Pidge Delivery Partner",
      pidgeRiderPhone: result.riderPhone || null,
      orderStatus: "out_for_delivery",
      pickedUpTime: new Date(),
      $push: {
        timeline: {
          status: "out_for_delivery",
          time: new Date(),
          updatedBy: "System (Pidge Dispatch)",
          role: "system",
          remarks: `Order dispatched via Pidge. Pidge ID: ${result.pidgeOrderId}`,
        },
      },
    });

    return result;
  }

  /**
   * Cancels a Pidge delivery task.
   */
  static async cancelDelivery(pidgeOrderId: string, reason = "Cancelled by store") {
    try {
      const res = await this.request(`/v1.0/store/channel/vendor/${pidgeOrderId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });

      if (res && res.ok) {
        return { success: true };
      }
      const errText = res ? await res.text() : "No response";
      console.warn("Pidge cancel order responded with:", errText);
    } catch (err) {
      console.error("Pidge cancel order error:", err);
    }
    return { success: false };
  }
}
