"use server";

import { PidgeService } from "@/services/delivery/PidgeService";
import { connectToDatabase } from "@/database/mongoose";
import { Order } from "@/models/Order";
import { Kitchen } from "@/models/Kitchen";
import { User } from "@/models/User";
import { revalidatePath } from "next/cache";

export async function testPidgeAuthAction() {
  try {
    const authRes = await PidgeService.getAuthTokenWithRaw(true);

    if (!authRes.token) {
      return {
        success: false,
        error: "Failed to authenticate with Pidge. Check your username and password.",
        endpoint: authRes.endpoint,
        httpStatus: authRes.httpStatus,
        rawResponse: authRes.rawResponse,
        baseUrl: authRes.baseUrl,
        username: authRes.username,
      };
    }

    return {
      success: true,
      endpoint: authRes.endpoint,
      httpStatus: authRes.httpStatus,
      rawResponse: authRes.rawResponse,
      baseUrl: authRes.baseUrl,
      username: authRes.username,
      tokenPreview: `${authRes.token.substring(0, 20)}...${authRes.token.slice(-10)}`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to authenticate with Pidge",
    };
  }
}

export async function testPidgeServiceabilityAction(
  pickupLat: number,
  pickupLng: number,
  dropLat: number,
  dropLng: number
) {
  try {
    const res = await PidgeService.estimateDelivery(
      { lat: pickupLat, lng: pickupLng },
      { lat: dropLat, lng: dropLng }
    );
    return {
      success: true,
      data: res,
      serviceabilityEndpoint: res.serviceabilityEndpoint,
      serviceabilityHttpStatus: res.serviceabilityHttpStatus,
      serviceabilityRaw: res.serviceabilityRaw,
      estimateEndpoint: res.estimateEndpoint,
      estimateHttpStatus: res.estimateHttpStatus,
      estimateRaw: res.estimateRaw,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Serviceability & estimate check failed" };
  }
}

export async function testPidgeQuoteAction(
  pickupLat: number,
  pickupLng: number,
  dropLat: number,
  dropLng: number,
  codAmount = 0
) {
  try {
    const res = await PidgeService.getQuote(
      { lat: pickupLat, lng: pickupLng },
      { lat: dropLat, lng: dropLng },
      codAmount
    );
    return {
      success: res.ok,
      endpoint: res.endpoint,
      httpStatus: res.httpStatus,
      requestPayload: res.requestPayload,
      rawResponse: res.rawResponse,
      quotes: res.quotes,
      error: res.ok ? undefined : `Pidge Quote returned HTTP ${res.httpStatus}`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Pidge partner quote request failed" };
  }
}

export async function createDummyPidgeOrderAction(params: {
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
  codAmount?: number;
  billAmount?: number;
  dishName?: string;
  quantity?: number;
  saveToDatabase?: boolean;
}) {
  try {
    const timestamp = Date.now().toString().slice(-6);
    const dummyOrderNumber = `MAL-TEST-${timestamp}`;

    const kitchenLat = params.pickupLat || 18.5987;
    const kitchenLng = params.pickupLng || 73.7978;
    const dropLat = params.dropLat || 18.6015;
    const dropLng = params.dropLng || 73.8015;

    const dishName = params.dishName || "Special Veg Thali";
    const quantity = params.quantity || 1;
    const billAmount = params.billAmount || 320;
    const codAmount = params.codAmount || 0;

    const customerName = params.customerName || "Test Customer";
    const customerPhone = params.customerPhone || "9876543210";
    const customerAddress =
      params.customerAddress || "Flat 402, Sunshine Heights, Kunal Icon Road, Pimple Saudagar, Pune";

    // 1. Call Pidge real order creation API (+ immediate GET order details)
    const taskResult = await PidgeService.createDeliveryTask({
      orderId: `dummy_${timestamp}`,
      orderNumber: dummyOrderNumber,
      pickup: {
        name: "Malashree Pure Veg (HQ)",
        phone: "9876543210",
        address: "Shop 4, Kunal Icon Road, Pimple Saudagar, Pune",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411027",
        lat: kitchenLat,
        lng: kitchenLng,
        email: "orders@malashree.in",
      },
      dropoff: {
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
        city: "Pune",
        state: "Maharashtra",
        pincode: "411027",
        lat: dropLat,
        lng: dropLng,
        email: "customer@malashree.in",
      },
      codAmount,
      billAmount,
      items: [
        {
          dishName,
          price: billAmount,
          quantity,
        },
      ],
    });

    let savedDbOrder = null;

    // 2. Optionally create a record in MongoDB so it appears in Admin Orders
    if (params.saveToDatabase) {
      await connectToDatabase();

      let adminUser = await User.findOne({ role: "admin" });
      let kitchen = await Kitchen.findOne();

      if (!adminUser) {
        adminUser = await User.create({
          name: "Test Customer",
          email: `test_${timestamp}@malashree.in`,
          phone: customerPhone,
          role: "customer",
          passwordHash: "dummyhash",
        });
      }

      if (!kitchen) {
        kitchen = await Kitchen.create({
          name: "Malashree Pure Veg",
          code: `KITCHEN_${timestamp}`,
          address: "Pimple Saudagar, Pune",
          location: { type: "Point", coordinates: [kitchenLng, kitchenLat] },
          status: "active",
        });
      }

      const createdOrder = await Order.create({
        orderNumber: dummyOrderNumber,
        customer: adminUser._id,
        kitchen: kitchen._id,
        kitchenName: kitchen.name || "Malashree Pure Veg",
        pidgeOrderId: taskResult.pidgeOrderId,
        pidgeTrackingUrl: taskResult.trackingUrl || null,
        pidgeStatus: taskResult.status,
        pidgeRiderName: taskResult.riderName || null,
        pidgeRiderPhone: taskResult.riderPhone || null,
        deliveryAddress: {
          label: "home",
          street: customerAddress,
          city: "Pune",
          state: "Maharashtra",
          zipCode: "411027",
        },
        items: [
          {
            menuItem: adminUser._id,
            dishName,
            quantity,
            price: billAmount,
          },
        ],
        subtotal: billAmount,
        deliveryFee: 40,
        tax: 15,
        grandTotal: billAmount + 55,
        paymentMethod: codAmount > 0 ? "cash" : "upi",
        paymentStatus: codAmount > 0 ? "pending" : "completed",
        orderStatus: "out_for_delivery",
        pickedUpTime: new Date(),
        timeline: [
          {
            status: "placed",
            time: new Date(),
            updatedBy: "Pidge Test Suite",
            role: "system",
            remarks: "Dummy order created for Pidge API testing",
          },
          {
            status: "out_for_delivery",
            time: new Date(),
            updatedBy: "Pidge Test Suite",
            role: "system",
            remarks: `Dispatched to Pidge: ID ${taskResult.pidgeOrderId}`,
          },
        ],
      });

      savedDbOrder = createdOrder.toObject();
      try {
        revalidatePath("/admin/orders");
      } catch {}
    }

    try {
      revalidatePath("/admin/pidge-test");
    } catch {}

    return {
      success: true,
      endpoint: taskResult.endpoint,
      httpStatus: taskResult.httpStatus,
      requestPayload: taskResult.requestPayload,
      rawCreateResponse: taskResult.rawCreateResponse,
      getOrderEndpoint: taskResult.getOrderEndpoint,
      getOrderHttpStatus: taskResult.getOrderHttpStatus,
      rawOrderDetails: taskResult.rawOrderDetails,
      orderNumber: dummyOrderNumber,
      pidgeOrderId: taskResult.pidgeOrderId,
      trackingUrl: taskResult.trackingUrl,
      trackCode: taskResult.trackCode,
      status: taskResult.status,
      riderName: taskResult.riderName,
      riderPhone: taskResult.riderPhone,
      savedDbOrder: savedDbOrder
        ? { id: savedDbOrder._id.toString(), orderNumber: savedDbOrder.orderNumber }
        : null,
    };
  } catch (err: any) {
    console.error("createDummyPidgeOrderAction error:", err);
    return {
      success: false,
      error: err.message || "Failed to create dummy order on Pidge",
    };
  }
}

export async function fetchPidgeOrderStatusAction(pidgeOrderId: string, dummyStatus?: string) {
  try {
    const res = await PidgeService.getOrderStatusRaw(pidgeOrderId, dummyStatus);
    if (!res.ok) {
      return {
        success: false,
        endpoint: res.endpoint,
        httpStatus: res.httpStatus,
        rawResponse: res.rawResponse,
        isDummySimulated: Boolean(dummyStatus),
        error: `Pidge GET order returned HTTP ${res.httpStatus || "error"}`,
      };
    }
    return {
      success: true,
      endpoint: res.endpoint,
      httpStatus: res.httpStatus,
      rawResponse: res.rawResponse,
      data: res.data,
      isDummySimulated: Boolean(dummyStatus),
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch order status" };
  }
}

export async function cancelPidgeOrderAction(pidgeOrderId: string, reason?: string) {
  try {
    const res = await PidgeService.cancelDelivery(
      pidgeOrderId,
      reason || "Cancelled via Pidge Test Suite"
    );
    try {
      revalidatePath("/admin/orders");
      revalidatePath("/admin/pidge-test");
    } catch {}
    return {
      success: res.success,
      endpoint: res.endpoint,
      httpStatus: res.httpStatus,
      rawResponse: res.rawResponse,
      error: res.success ? undefined : `Cancel failed (HTTP ${res.httpStatus || "error"})`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to cancel order" };
  }
}

export async function simulateWebhookUpdateAction(
  pidgeOrderId: string,
  status: string,
  riderName?: string,
  riderPhone?: string
) {
  try {
    await connectToDatabase();
    const order = await Order.findOne({ pidgeOrderId });

    if (!order) {
      return {
        success: false,
        error: `Order with pidgeOrderId '${pidgeOrderId}' not found in local MongoDB. Enable "Also save as a real order in Malashree database" when creating the order to test local DB webhook persistence.`,
      };
    }

    order.pidgeStatus = status;
    if (riderName) order.pidgeRiderName = riderName;
    if (riderPhone) order.pidgeRiderPhone = riderPhone;

    if (status === "DELIVERED") {
      order.orderStatus = "delivered";
      order.actualDeliveryTime = new Date();
    } else if (status === "CANCELLED") {
      order.orderStatus = "cancelled";
    } else {
      order.orderStatus = "out_for_delivery";
    }

    order.timeline.push({
      status: order.orderStatus,
      time: new Date(),
      updatedBy: "Simulated Local Webhook",
      role: "system",
      remarks: `Local simulated event: ${status}${riderName ? ` (Rider: ${riderName})` : ""}`,
    });

    await order.save();
    try {
      revalidatePath("/admin/orders");
      revalidatePath("/admin/pidge-test");
    } catch {}

    return {
      success: true,
      localOnly: true,
      orderStatus: order.orderStatus,
      pidgeStatus: status,
      note: "Updated ONLY in local MongoDB (did not call Pidge server).",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Local webhook simulation failed" };
  }
}

export async function getRecentPidgeOrdersAction() {
  try {
    await connectToDatabase();
    const orders = await Order.find({ pidgeOrderId: { $ne: null } })
      .select("orderNumber pidgeOrderId pidgeStatus pidgeTrackingUrl grandTotal createdAt deliveryAddress")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return {
      success: true,
      orders: orders.map((o: any) => ({
        id: o._id.toString(),
        orderNumber: o.orderNumber,
        pidgeOrderId: o.pidgeOrderId,
        status: o.pidgeStatus || "PENDING",
        trackingUrl: o.pidgeTrackingUrl || null,
        amount: o.grandTotal,
        date: o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN") : "-",
        address: o.deliveryAddress?.street || "Pune",
      })),
    };
  } catch (err: any) {
    return { success: false, error: err.message, orders: [] };
  }
}
