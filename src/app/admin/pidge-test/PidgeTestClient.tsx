"use client";

import { useState, useEffect } from "react";
import {
  Bike,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Send,
  Trash2,
  MapPin,
  Layers,
  Activity,
  Terminal,
  Copy,
  Check,
  Database,
  Truck,
  Building,
  Search,
} from "lucide-react";
import {
  testPidgeAuthAction,
  testPidgeServiceabilityAction,
  testPidgeQuoteAction,
  createDummyPidgeOrderAction,
  fetchPidgeOrderStatusAction,
  cancelPidgeOrderAction,
  simulateWebhookUpdateAction,
  getRecentPidgeOrdersAction,
} from "@/actions/delivery/pidgeTestActions";

interface ApiLogEntry {
  id: string;
  timestamp: string;
  label: string;
  method: "GET" | "POST";
  endpoint: string;
  httpStatus: number | null;
  requestPayload?: any;
  rawResponse: any;
}

function RawJsonViewer({
  title,
  method,
  endpoint,
  httpStatus,
  payload,
  requestPayload,
  onCopy,
  copied,
}: {
  title: string;
  method?: string;
  endpoint?: string | null;
  httpStatus?: number | null;
  payload: any;
  requestPayload?: any;
  onCopy: () => void;
  copied: boolean;
}) {
  const [showReq, setShowReq] = useState(false);

  return (
    <div className="rounded-2xl bg-[#0d261e] text-emerald-200 border border-emerald-500/30 overflow-hidden shadow-inner">
      <div className="px-3.5 py-2.5 bg-[#061813] border-b border-emerald-500/20 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          {method && (
            <span className="px-1.5 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37] font-black">
              {method}
            </span>
          )}
          <span className="font-bold text-white">{title}</span>
          {httpStatus !== undefined && httpStatus !== null && (
            <span
              className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                httpStatus >= 200 && httpStatus < 300
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-red-500/20 text-red-300 border border-red-500/30"
              }`}
            >
              HTTP {httpStatus}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {requestPayload && (
            <button
              type="button"
              onClick={() => setShowReq((v) => !v)}
              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono text-white/80 cursor-pointer"
            >
              {showReq ? "Hide Request" : "Show Request"}
            </button>
          )}
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono text-[#d4af37] cursor-pointer"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            <span>{copied ? "Copied" : "Copy JSON"}</span>
          </button>
        </div>
      </div>

      {endpoint && (
        <div className="px-3.5 py-1.5 bg-black/30 border-b border-emerald-500/10 font-mono text-[10px] text-emerald-300/75 break-all">
          URL: {endpoint}
        </div>
      )}

      {showReq && requestPayload && (
        <div className="p-3 bg-black/50 border-b border-emerald-500/20">
          <div className="text-[10px] font-mono uppercase text-[#d4af37] mb-1">
            Request Body Sent to Pidge:
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[10.5px] leading-relaxed text-amber-200/90 max-h-60 overflow-y-auto">
            {JSON.stringify(requestPayload, null, 2)}
          </pre>
        </div>
      )}

      <div className="p-3">
        <div className="text-[10px] font-mono uppercase text-emerald-400/70 mb-1">
          Verbatim Response Body from Pidge:
        </div>
        <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-emerald-300 max-h-80 overflow-y-auto">
          {typeof payload === "string" ? payload : JSON.stringify(payload, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export function PidgeTestClient() {
  // Live Raw API Feed
  const [apiLogs, setApiLogs] = useState<ApiLogEntry[]>([]);

  // Auth state
  const [authLoading, setAuthLoading] = useState(false);
  const [authResult, setAuthResult] = useState<any>(null);

  // Serviceability & Quote state
  const [pickupLat, setPickupLat] = useState("18.5987");
  const [pickupLng, setPickupLng] = useState("73.7978");
  const [dropLat, setDropLat] = useState("18.6015");
  const [dropLng, setDropLng] = useState("73.8015");
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceResult, setServiceResult] = useState<any>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteResult, setQuoteResult] = useState<any>(null);

  // Order creation state
  const [customerName, setCustomerName] = useState("Ramesh Joshi");
  const [customerPhone, setCustomerPhone] = useState("9876543210");
  const [customerAddress, setCustomerAddress] = useState(
    "Flat 301, Shree Ganesh Heights, Kunal Icon Road, Pimple Saudagar, Pune"
  );
  const [dishName, setDishName] = useState("Special Veg Thali + Paneer Masala");
  const [billAmount, setBillAmount] = useState("350");
  const [paymentMode, setPaymentMode] = useState<"prepaid" | "cod">("prepaid");
  const [saveToDb, setSaveToDb] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createResult, setCreateResult] = useState<any>(null);

  // Order status & actions state
  const [inspectOrderId, setInspectOrderId] = useState("");
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectResult, setInspectResult] = useState<any>(null);

  // Cancel state
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelResult, setCancelResult] = useState<any>(null);

  // Local DB Webhook state
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookResult, setWebhookResult] = useState<any>(null);

  // Recent Pidge Orders state
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentOrdersLoading, setRecentOrdersLoading] = useState(false);

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadRecentOrders = async () => {
    setRecentOrdersLoading(true);
    try {
      const res = await getRecentPidgeOrdersAction();
      if (res.success && res.orders) {
        setRecentOrders(res.orders);
      }
    } catch (e) {
      console.error("Error loading recent Pidge orders:", e);
    } finally {
      setRecentOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadRecentOrders();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const pushApiLog = (entry: Omit<ApiLogEntry, "id" | "timestamp">) => {
    setApiLogs((prev) => [
      {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour12: false }),
      },
      ...prev.slice(0, 14),
    ]);
  };

  const handleTestAuth = async () => {
    setAuthLoading(true);
    setAuthResult(null);
    try {
      const res = await testPidgeAuthAction();
      console.log("%c================ [PIDGE RAW API: VENDOR LOGIN] ================", "color: #10b981; font-weight: bold; font-size: 13px;");
      console.log("Endpoint:", res.endpoint, "HTTP:", res.httpStatus);
      console.log("Verbatim Pidge JSON:", res.rawResponse);
      console.log("===============================================================");
      setAuthResult(res);
      if (res.endpoint) {
        pushApiLog({
          label: "Vendor Auth Login",
          method: "POST",
          endpoint: res.endpoint,
          httpStatus: res.httpStatus ?? null,
          rawResponse: res.rawResponse ?? res,
        });
      }
    } catch (e: any) {
      console.error("[PIDGE API: AUTH ERROR]", e);
      setAuthResult({ success: false, error: e.message });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleTestServiceability = async () => {
    setServiceLoading(true);
    setServiceResult(null);
    try {
      const res = await testPidgeServiceabilityAction(
        parseFloat(pickupLat),
        parseFloat(pickupLng),
        parseFloat(dropLat),
        parseFloat(dropLng)
      );
      console.log("%c============= [PIDGE RAW API: SERVICEABILITY & ESTIMATE] =============", "color: #10b981; font-weight: bold; font-size: 13px;");
      console.log("Serviceability:", res.serviceabilityEndpoint, "HTTP:", res.serviceabilityHttpStatus, res.serviceabilityRaw);
      console.log("Estimate:", res.estimateEndpoint, "HTTP:", res.estimateHttpStatus, res.estimateRaw);
      console.log("=======================================================================");
      setServiceResult(res);
      if (res.serviceabilityEndpoint) {
        pushApiLog({
          label: "Serviceability Check",
          method: "POST",
          endpoint: res.serviceabilityEndpoint,
          httpStatus: res.serviceabilityHttpStatus ?? null,
          rawResponse: res.serviceabilityRaw,
        });
      }
      if (res.estimateEndpoint) {
        pushApiLog({
          label: "Cost & ETA Estimate",
          method: "POST",
          endpoint: res.estimateEndpoint,
          httpStatus: res.estimateHttpStatus ?? null,
          rawResponse: res.estimateRaw,
        });
      }
    } catch (e: any) {
      console.error("[PIDGE API: SERVICEABILITY ERROR]", e);
      setServiceResult({ success: false, error: e.message });
    } finally {
      setServiceLoading(false);
    }
  };

  const handleTestQuote = async () => {
    setQuoteLoading(true);
    setQuoteResult(null);
    try {
      const res = await testPidgeQuoteAction(
        parseFloat(pickupLat),
        parseFloat(pickupLng),
        parseFloat(dropLat),
        parseFloat(dropLng),
        paymentMode === "cod" ? parseFloat(billAmount) || 0 : 0
      );
      console.log("%c============= [PIDGE RAW API: PARTNER QUOTES] =============", "color: #10b981; font-weight: bold; font-size: 13px;");
      console.log("Endpoint:", res.endpoint, "HTTP:", res.httpStatus);
      console.log("Verbatim Pidge JSON:", res.rawResponse);
      console.log("============================================================");
      setQuoteResult(res);
      if (res.endpoint) {
        pushApiLog({
          label: "Live Carrier Quotes",
          method: "POST",
          endpoint: res.endpoint,
          httpStatus: res.httpStatus ?? null,
          requestPayload: res.requestPayload,
          rawResponse: res.rawResponse,
        });
      }
    } catch (e: any) {
      console.error("[PIDGE API: QUOTE ERROR]", e);
      setQuoteResult({ success: false, error: e.message });
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleCreateDummyOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateResult(null);
    try {
      const res = await createDummyPidgeOrderAction({
        customerName,
        customerPhone,
        customerAddress,
        pickupLat: parseFloat(pickupLat),
        pickupLng: parseFloat(pickupLng),
        dropLat: parseFloat(dropLat),
        dropLng: parseFloat(dropLng),
        dishName,
        billAmount: parseFloat(billAmount),
        codAmount: paymentMode === "cod" ? parseFloat(billAmount) : 0,
        saveToDatabase: saveToDb,
      });
      console.log("%c================ [PIDGE RAW API: CREATE ORDER] ================", "color: #10b981; font-weight: bold; font-size: 13px;");
      console.log("POST Create Endpoint:", res.endpoint, "HTTP:", res.httpStatus);
      console.log("Verbatim POST Create JSON:", res.rawCreateResponse);
      console.log("Immediate GET Order Endpoint:", res.getOrderEndpoint, "HTTP:", res.getOrderHttpStatus);
      console.log("Verbatim GET Order JSON:", res.rawOrderDetails);
      console.log("===============================================================");
      setCreateResult(res);
      if (res.endpoint) {
        pushApiLog({
          label: `Create Order (${res.orderNumber})`,
          method: "POST",
          endpoint: res.endpoint,
          httpStatus: res.httpStatus ?? null,
          requestPayload: res.requestPayload,
          rawResponse: res.rawCreateResponse,
        });
      }
      if (res.getOrderEndpoint && res.rawOrderDetails) {
        pushApiLog({
          label: `Initial Order Fetch (${res.pidgeOrderId})`,
          method: "GET",
          endpoint: res.getOrderEndpoint,
          httpStatus: res.getOrderHttpStatus ?? null,
          rawResponse: res.rawOrderDetails,
        });
      }
      if (res.pidgeOrderId) {
        setInspectOrderId(res.pidgeOrderId);
      }
      if (saveToDb) {
        loadRecentOrders();
      }
    } catch (err: any) {
      console.error("[PIDGE API: CREATE ORDER ERROR]", err);
      setCreateResult({ success: false, error: err.message });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleFetchOrderStatus = async (orderIdOverride?: string, dummyStatus?: string) => {
    const targetId = (orderIdOverride ?? inspectOrderId).trim();
    if (!targetId) return;
    setInspectOrderId(targetId);
    setInspectLoading(true);
    setInspectResult(null);
    try {
      const res = await fetchPidgeOrderStatusAction(targetId, dummyStatus);
      console.log(
        dummyStatus
          ? `%c======= [PIDGE STAGING SIMULATOR (?dummy_status=${dummyStatus})] =======`
          : "%c============= [PIDGE RAW API: GET ORDER STATUS] =============",
        "color: #10b981; font-weight: bold; font-size: 13px;"
      );
      console.log("Endpoint:", res.endpoint, "HTTP:", res.httpStatus);
      console.log("Verbatim Pidge JSON:", res.rawResponse);
      console.log("=============================================================");
      setInspectResult(res);
      if (res.endpoint) {
        pushApiLog({
          label: dummyStatus
            ? `Pidge Staging Dummy GET (${dummyStatus})`
            : `Get Live Order (${targetId})`,
          method: "GET",
          endpoint: res.endpoint,
          httpStatus: res.httpStatus ?? null,
          rawResponse: res.rawResponse,
        });
      }
    } catch (err: any) {
      console.error("[PIDGE API: GET ORDER STATUS ERROR]", err);
      setInspectResult({ success: false, error: err.message });
    } finally {
      setInspectLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!inspectOrderId.trim()) return;
    setCancelLoading(true);
    setCancelResult(null);
    try {
      const res = await cancelPidgeOrderAction(
        inspectOrderId.trim(),
        "Cancelled from Pidge Testing Console"
      );
      console.log("%c============== [PIDGE RAW API: CANCEL ORDER] ==============", "color: #10b981; font-weight: bold; font-size: 13px;");
      console.log("Endpoint:", res.endpoint, "HTTP:", res.httpStatus);
      console.log("Verbatim Pidge JSON:", res.rawResponse);
      console.log("===========================================================");
      setCancelResult(res);
      if (res.endpoint) {
        pushApiLog({
          label: `Cancel Order (${inspectOrderId.trim()})`,
          method: "POST",
          endpoint: res.endpoint,
          httpStatus: res.httpStatus ?? null,
          rawResponse: res.rawResponse,
        });
      }
      if (res.success) {
        await handleFetchOrderStatus(inspectOrderId.trim());
      }
    } catch (err: any) {
      console.error("[PIDGE API: CANCEL ORDER ERROR]", err);
      setCancelResult({ success: false, error: err.message });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleSimulateWebhook = async (status: string) => {
    if (!inspectOrderId.trim()) return;
    setWebhookLoading(true);
    setWebhookResult(null);
    try {
      const res = await simulateWebhookUpdateAction(
        inspectOrderId.trim(),
        status,
        "Sanjay Kumar",
        "+91 98110 99887"
      );
      console.log("%c============= [LOCAL DB WEBHOOK SIMULATOR — NOT PIDGE] =============", "color: #f59e0b; font-weight: bold; font-size: 13px;");
      console.log(res);
      console.log("===================================================================");
      setWebhookResult(res);
    } catch (err: any) {
      console.error("[LOCAL WEBHOOK SIMULATOR ERROR]", err);
      setWebhookResult({ success: false, error: err.message });
    } finally {
      setWebhookLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* ========================================================================= */}
      {/* 1. HERO HEADER */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-[#064e3b] via-[#043d2e] to-[#022c22] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#d4af37]/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 size-64 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-xs font-black uppercase tracking-wider">
              <Bike className="size-3.5" /> Pidge Live Staging Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-black italic tracking-tight">
              Pidge API Verification & Raw Response Inspector
            </h1>
            <p className="text-sm text-white/80 max-w-2xl">
              Calls <code className="text-[#d4af37]">https://store.dev.pidge.in</code> directly from Next.js server actions
              and prints the verbatim HTTP endpoints, status codes, and raw JSON bodies returned by Pidge — with zero fabricated tracking numbers or dummy fees.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-xs font-mono flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>https://store.dev.pidge.in</span>
            </div>
            <a
              href="https://dashboard.dev.pidge.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 border border-white/20 transition cursor-pointer"
            >
              <ExternalLink className="size-3.5 text-[#d4af37]" />
              <span>Pidge Test Dashboard</span>
            </a>
            <button
              onClick={handleTestAuth}
              disabled={authLoading}
              className="px-4 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#c29d2b] text-[#064e3b] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${authLoading ? "animate-spin" : ""}`} />
              <span>{authLoading ? "Calling Pidge..." : "Ping Auth API"}</span>
            </button>
          </div>
        </div>

        {/* Pidge Business Dashboard Info Pill */}
        <div className="mt-5 p-3.5 rounded-2xl bg-black/40 border border-white/15 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="font-bold text-[#d4af37] flex items-center gap-1.5 text-xs">
              <Building className="size-3.5" /> Pidge Staging Business Portal: https://dashboard.dev.pidge.in
            </span>
            <p className="text-white/70 text-[11px]">
              Access the merchant panel with your registered mobile/email to view real-time fleet map, active driver allocations, and orders list.
            </p>
          </div>
          <a
            href="https://dashboard.dev.pidge.in"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-[#d4af37] hover:bg-[#c29d2b] text-[#064e3b] font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition shrink-0"
          >
            <span>Open Dashboard</span>
            <ExternalLink className="size-3" />
          </a>
        </div>

        {/* Auth Results Banner + Always Visible Raw JSON */}
        {authResult && (
          <div className="mt-6 space-y-3">
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                authResult.success
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
                  : "bg-red-950/60 border-red-500/40 text-red-200"
              }`}
            >
              {authResult.success ? (
                <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="size-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 flex-1">
                <p className="font-bold">
                  {authResult.success
                    ? "✓ Authenticated directly against Pidge Staging"
                    : "✗ Authentication Failed"}
                </p>
                {authResult.success ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-300/80 font-mono">
                    <div>
                      <span className="text-white/60">Base URL:</span> {authResult.baseUrl}
                    </div>
                    <div>
                      <span className="text-white/60">Username:</span> {authResult.username}
                    </div>
                  </div>
                ) : (
                  <p>{authResult.error}</p>
                )}
              </div>
            </div>

            {authResult.rawResponse && (
              <RawJsonViewer
                title="Pidge Vendor Login Response"
                method="POST"
                endpoint={authResult.endpoint}
                httpStatus={authResult.httpStatus}
                payload={authResult.rawResponse}
                onCopy={() => handleCopy(JSON.stringify(authResult.rawResponse, null, 2), "authRaw")}
                copied={copiedKey === "authRaw"}
              />
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. TWO-COLUMN LAYOUT: CREATE ORDER (LEFT) & SERVICEABILITY / INSPECTOR (RIGHT) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ======================================================================= */}
        {/* LEFT COLUMN: CREATE DUMMY ORDER */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e6e2d8] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#e6e2d8] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#064e3b]/10 text-[#064e3b]">
                  <Send className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#0d261e]">Create Real Test Order on Pidge</h2>
                  <p className="text-xs text-[#52635c]">
                    Posts to <code>/v1.0/store/channel/vendor/order</code>, then queries <code>/order/:id</code>.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#064e3b] text-[10px] font-black uppercase border border-emerald-200">
                Live Staging API
              </span>
            </div>

            <form onSubmit={handleCreateDummyOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#52635c] mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6e2d8] text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#52635c] mb-1">
                    Customer Mobile (10-Digit)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6e2d8] text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#52635c] mb-1 flex items-center justify-between">
                  <span>Customer Drop Address</span>
                  <span className="text-[10px] text-[#52635c]/70 font-normal">
                    Pimple Saudagar, Pune
                  </span>
                </label>
                <textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  required
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6e2d8] text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#52635c] mb-1">
                    Ordered Dish
                  </label>
                  <input
                    type="text"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6e2d8] text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#52635c] mb-1">
                    Bill Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6e2d8] text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setPaymentMode("prepaid")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    paymentMode === "prepaid"
                      ? "bg-[#064e3b] text-white border-[#064e3b]"
                      : "bg-[#fbf9f4] text-[#52635c] border-[#e6e2d8] hover:text-[#0d261e]"
                  }`}
                >
                  💳 Prepaid (₹0 COD)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode("cod")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    paymentMode === "cod"
                      ? "bg-[#064e3b] text-white border-[#064e3b]"
                      : "bg-[#fbf9f4] text-[#52635c] border-[#e6e2d8] hover:text-[#0d261e]"
                  }`}
                >
                  💵 Cash On Delivery (COD)
                </button>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="saveDb"
                  checked={saveToDb}
                  onChange={(e) => setSaveToDb(e.target.checked)}
                  className="rounded border-[#e6e2d8] text-[#064e3b] focus:ring-[#064e3b]"
                />
                <label htmlFor="saveDb" className="text-xs text-[#52635c] cursor-pointer">
                  Also save as a test order in local MongoDB (visible on{" "}
                  <a href="/admin/orders" className="underline font-bold text-[#064e3b]">
                    Admin Orders
                  </a>
                  ) — off by default so pure API tests keep DB clean
                </label>
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="w-full py-3.5 rounded-2xl bg-[#064e3b] hover:bg-[#085a44] text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50 mt-4"
              >
                {createLoading ? (
                  <>
                    <RefreshCw className="size-4 animate-spin text-[#d4af37]" />
                    <span>Calling Pidge Order API...</span>
                  </>
                ) : (
                  <>
                    <Bike className="size-4 text-[#d4af37]" />
                    <span>Create Live Test Order on Pidge</span>
                  </>
                )}
              </button>
            </form>

            {/* Creation Result Banner + Always Visible Raw JSON */}
            {createResult && (
              <div
                className={`p-5 rounded-2xl border text-xs space-y-4 ${
                  createResult.success
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : "bg-red-50 border-red-300 text-red-900"
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    {createResult.success ? (
                      <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-extrabold text-sm">
                        {createResult.success
                          ? "✓ Live Order Created on Pidge Staging"
                          : "Order Creation Failed"}
                      </p>
                      <p className="text-[#52635c]">
                        {createResult.success
                          ? "Pidge accepted the order and returned a genuine staging Pidge Order ID. Rider & track_code are assigned asynchronously by Pidge after smart allocation."
                          : createResult.error}
                      </p>
                    </div>
                  </div>
                </div>

                {createResult.success && (
                  <div className="pt-3 border-t border-emerald-200/60 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-[11px] bg-white/75 p-3 rounded-xl border border-emerald-200">
                      <div>
                        <span className="text-[#52635c]">Source Order ID:</span>{" "}
                        <span className="font-bold">{createResult.orderNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#52635c]">Real Pidge ID:</span>{" "}
                        <span className="font-bold text-[#064e3b]">{createResult.pidgeOrderId}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(createResult.pidgeOrderId, "pidgeId")}
                          className="p-0.5 rounded hover:bg-emerald-200 text-[#064e3b] cursor-pointer"
                        >
                          {copiedKey === "pidgeId" ? (
                            <Check className="size-3 text-emerald-700" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                      <div>
                        <span className="text-[#52635c]">Live Pidge Status:</span>{" "}
                        <span className="font-bold px-1.5 py-0.5 rounded bg-emerald-200/70 text-emerald-900">
                          {createResult.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#52635c]">track_code (from Pidge):</span>{" "}
                        <span className="font-bold">
                          {createResult.trackCode || "null (not assigned yet)"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#52635c]">Rider Name:</span>{" "}
                        <span className="font-bold">
                          {createResult.riderName || "null (pending allocation)"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#52635c]">trackingUrl:</span>{" "}
                        <span className="font-bold">
                          {createResult.trackingUrl ? "Ready (from track_code)" : "null (awaiting track_code)"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleFetchOrderStatus(createResult.pidgeOrderId)}
                        disabled={inspectLoading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#064e3b] text-white hover:bg-[#085a44] font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`size-3.5 ${inspectLoading ? "animate-spin" : ""}`} />
                        <span>Re-fetch Live from Pidge (GET /order/:id)</span>
                      </button>

                      {createResult.trackingUrl && (
                        <a
                          href={createResult.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-[#064e3b] hover:bg-emerald-50 font-bold text-xs transition"
                        >
                          <ExternalLink className="size-3.5" />
                          <span>Open Pidge Portal ({createResult.trackCode})</span>
                        </a>
                      )}
                    </div>

                    {/* Verbatim POST /order response (ALWAYS EXPANDED) */}
                    <RawJsonViewer
                      title="Step 1 — POST /order (Verbatim Create Response)"
                      method="POST"
                      endpoint={createResult.endpoint}
                      httpStatus={createResult.httpStatus}
                      requestPayload={createResult.requestPayload}
                      payload={createResult.rawCreateResponse}
                      onCopy={() =>
                        handleCopy(JSON.stringify(createResult.rawCreateResponse, null, 2), "rawCreate")
                      }
                      copied={copiedKey === "rawCreate"}
                    />

                    {/* Verbatim immediate GET /order/:id response (ALWAYS EXPANDED) */}
                    {createResult.rawOrderDetails && (
                      <RawJsonViewer
                        title="Step 2 — GET /order/:id (Immediate Order Details from Pidge)"
                        method="GET"
                        endpoint={createResult.getOrderEndpoint}
                        httpStatus={createResult.getOrderHttpStatus}
                        payload={createResult.rawOrderDetails}
                        onCopy={() =>
                          handleCopy(JSON.stringify(createResult.rawOrderDetails, null, 2), "rawOrderGet")
                        }
                        copied={copiedKey === "rawOrderGet"}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: SERVICEABILITY / ESTIMATE / QUOTES & ORDER INSPECTOR */}
        {/* ======================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Serviceability + Estimate + Quote Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#e6e2d8] shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b border-[#e6e2d8] pb-3">
              <div className="p-2 rounded-xl bg-[#d4af37]/15 text-[#064e3b]">
                <MapPin className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0d261e]">
                  Serviceability, Estimate & Live Quotes
                </h3>
                <p className="text-[11px] text-[#52635c]">
                  Calls <code>/serviceability</code>, <code>/estimate</code> & <code>/quote</code> directly on Pidge
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#52635c]">Pickup Lat / Lng</label>
                <div className="flex gap-1.5 mt-0.5">
                  <input
                    type="text"
                    value={pickupLat}
                    onChange={(e) => setPickupLat(e.target.value)}
                    className="w-1/2 p-2 rounded-lg border border-[#e6e2d8] font-mono text-[11px]"
                  />
                  <input
                    type="text"
                    value={pickupLng}
                    onChange={(e) => setPickupLng(e.target.value)}
                    className="w-1/2 p-2 rounded-lg border border-[#e6e2d8] font-mono text-[11px]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#52635c]">Drop Lat / Lng</label>
                <div className="flex gap-1.5 mt-0.5">
                  <input
                    type="text"
                    value={dropLat}
                    onChange={(e) => setDropLat(e.target.value)}
                    className="w-1/2 p-2 rounded-lg border border-[#e6e2d8] font-mono text-[11px]"
                  />
                  <input
                    type="text"
                    value={dropLng}
                    onChange={(e) => setDropLng(e.target.value)}
                    className="w-1/2 p-2 rounded-lg border border-[#e6e2d8] font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleTestServiceability}
                disabled={serviceLoading}
                className="py-2.5 px-3 rounded-xl bg-[#064e3b] hover:bg-[#085a44] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Activity className={`size-3.5 ${serviceLoading ? "animate-spin" : ""}`} />
                <span>{serviceLoading ? "Checking..." : "Serviceability + Estimate"}</span>
              </button>

              <button
                type="button"
                onClick={handleTestQuote}
                disabled={quoteLoading}
                className="py-2.5 px-3 rounded-xl bg-[#fbf9f4] hover:bg-[#f3eee2] text-[#064e3b] font-bold text-xs border border-[#e6e2d8] flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Truck className={`size-3.5 ${quoteLoading ? "animate-spin" : ""}`} />
                <span>{quoteLoading ? "Fetching..." : "Live Quotes (/quote)"}</span>
              </button>
            </div>

            {serviceResult && (
              <div className="space-y-3">
                <div
                  className={`p-3.5 rounded-xl border text-xs ${
                    serviceResult.success
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-red-50 border-red-200 text-red-900"
                  }`}
                >
                  {serviceResult.success ? (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-white/80">
                        <p className="text-[10px] text-[#52635c] font-bold uppercase">Serviceable</p>
                        <p className="font-extrabold text-[#064e3b]">
                          {serviceResult.data?.serviceable ? "✓ Yes" : "✗ No"}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/80">
                        <p className="text-[10px] text-[#52635c] font-bold uppercase">Distance (Pidge)</p>
                        <p className="font-extrabold text-[#0d261e]">
                          {serviceResult.data?.pickupToDropDistanceMeters
                            ? `${serviceResult.data.pickupToDropDistanceMeters} m`
                            : `${serviceResult.data?.distanceKm} km`}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/80">
                        <p className="text-[10px] text-[#52635c] font-bold uppercase">Cost Range</p>
                        <p className="font-extrabold text-[#0d261e]">
                          {serviceResult.data?.minCost !== null && serviceResult.data?.maxCost !== null
                            ? `₹${serviceResult.data.minCost}–₹${serviceResult.data.maxCost}`
                            : `₹${serviceResult.data?.fee}`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p>{serviceResult.error}</p>
                  )}
                </div>

                {serviceResult.serviceabilityRaw && (
                  <RawJsonViewer
                    title="POST /serviceability Response"
                    method="POST"
                    endpoint={serviceResult.serviceabilityEndpoint}
                    httpStatus={serviceResult.serviceabilityHttpStatus}
                    payload={serviceResult.serviceabilityRaw}
                    onCopy={() =>
                      handleCopy(JSON.stringify(serviceResult.serviceabilityRaw, null, 2), "svcRaw")
                    }
                    copied={copiedKey === "svcRaw"}
                  />
                )}

                {serviceResult.estimateRaw && (
                  <RawJsonViewer
                    title="POST /estimate Response"
                    method="POST"
                    endpoint={serviceResult.estimateEndpoint}
                    httpStatus={serviceResult.estimateHttpStatus}
                    payload={serviceResult.estimateRaw}
                    onCopy={() =>
                      handleCopy(JSON.stringify(serviceResult.estimateRaw, null, 2), "estRaw")
                    }
                    copied={copiedKey === "estRaw"}
                  />
                )}
              </div>
            )}

            {quoteResult && (
              <div className="space-y-3">
                {quoteResult.error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-bold">
                    {quoteResult.error}
                  </div>
                )}
                {quoteResult.rawResponse && (
                  <RawJsonViewer
                    title="POST /quote Live Carrier Response"
                    method="POST"
                    endpoint={quoteResult.endpoint}
                    httpStatus={quoteResult.httpStatus}
                    requestPayload={quoteResult.requestPayload}
                    payload={quoteResult.rawResponse}
                    onCopy={() =>
                      handleCopy(JSON.stringify(quoteResult.rawResponse, null, 2), "quoteRaw")
                    }
                    copied={copiedKey === "quoteRaw"}
                  />
                )}
              </div>
            )}
          </div>

          {/* Inspector & Live Status Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#e6e2d8] shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b border-[#e6e2d8] pb-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Layers className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0d261e]">
                  Live Order Inspector & Actions
                </h3>
                <p className="text-[11px] text-[#52635c]">
                  Query live status on Pidge, test Staging Dummy GET, or cancel
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#52635c]">
                Real Pidge Order ID (e.g. 1794301858216DZ7YMZEV)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste Pidge ID here..."
                  value={inspectOrderId}
                  onChange={(e) => setInspectOrderId(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-[#e6e2d8] font-mono text-xs focus:outline-none focus:border-[#064e3b]"
                />
                <button
                  type="button"
                  onClick={() => handleFetchOrderStatus()}
                  disabled={inspectLoading || !inspectOrderId}
                  className="px-3.5 py-2.5 rounded-xl bg-[#064e3b] text-white font-bold text-xs hover:bg-[#085a44] transition cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {inspectLoading ? "Fetching..." : "Inspect Live"}
                </button>
              </div>
            </div>

            {/* Staging Actions on Real Pidge Order */}
            <div className="pt-2 border-t border-[#e6e2d8] space-y-2.5">
              <p className="text-[10px] font-black uppercase text-[#52635c] tracking-wider">
                Pidge Staging API Actions
              </p>

              <button
                type="button"
                onClick={() => handleFetchOrderStatus(undefined, "fulfilled|ofd")}
                disabled={inspectLoading || !inspectOrderId}
                className="w-full p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                🧪 Call Pidge Staging Dummy GET (?dummy_status=fulfilled|ofd)
              </button>

              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelLoading || !inspectOrderId}
                className="w-full p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>{cancelLoading ? "Cancelling on Pidge..." : "Cancel Order on Pidge (POST /:id/cancel)"}</span>
              </button>
            </div>

            {cancelResult && (
              <div className="space-y-2">
                <div
                  className={`p-3 rounded-xl border text-xs font-bold ${
                    cancelResult.success
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {cancelResult.success
                    ? "✓ Cancelled directly on Pidge."
                    : cancelResult.error || "✗ Failed to cancel order on Pidge."}
                </div>
                {cancelResult.rawResponse && (
                  <RawJsonViewer
                    title="POST /:id/cancel Verbatim Response"
                    method="POST"
                    endpoint={cancelResult.endpoint}
                    httpStatus={cancelResult.httpStatus}
                    payload={cancelResult.rawResponse}
                    onCopy={() =>
                      handleCopy(JSON.stringify(cancelResult.rawResponse, null, 2), "cancelRaw")
                    }
                    copied={copiedKey === "cancelRaw"}
                  />
                )}
              </div>
            )}

            {/* Live Inspector Results (Always Expanded) */}
            {inspectResult && (
              <div className="pt-3 border-t border-[#e6e2d8] space-y-3">
                {inspectResult.isDummySimulated && (
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-[11px] font-bold text-indigo-900">
                    Returned by Pidge Staging Simulator query (<code>?dummy_status=fulfilled|ofd</code>) — shows Pidge&apos;s fulfillment structure when a rider & <code>track_code</code> are assigned.
                  </div>
                )}

                {inspectResult.success ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#e6e2d8] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#52635c] text-[11px] font-bold">Pidge Status:</span>
                        <span className="px-2 py-0.5 rounded font-black text-[11px] bg-[#064e3b] text-[#d4af37]">
                          {inspectResult.data?.fulfillment?.status || inspectResult.data?.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#52635c] space-y-1 font-mono">
                        <div>
                          <span>Channel:</span>{" "}
                          <strong className="text-[#0d261e]">
                            {inspectResult.data?.fulfillment?.channel?.name || "pending allocation"}
                          </strong>
                        </div>
                        <div>
                          <span>Rider:</span>{" "}
                          <strong className="text-[#0d261e]">
                            {inspectResult.data?.fulfillment?.rider?.name || "null (not assigned yet)"}
                          </strong>
                        </div>
                        <div>
                          <span>track_code:</span>{" "}
                          <strong className="text-[#064e3b]">
                            {inspectResult.data?.fulfillment?.track_code || "null"}
                          </strong>
                        </div>
                        {inspectResult.data?.pickup_drop_distance && (
                          <div>
                            <span>Pidge Distance:</span>{" "}
                            <strong className="text-[#0d261e]">
                              {Math.round(inspectResult.data.pickup_drop_distance)} m
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>

                    <RawJsonViewer
                      title={
                        inspectResult.isDummySimulated
                          ? "GET /order/:id?dummy_status=fulfilled|ofd (Pidge Sandbox)"
                          : "GET /order/:id (Verbatim Pidge Response)"
                      }
                      method="GET"
                      endpoint={inspectResult.endpoint}
                      httpStatus={inspectResult.httpStatus}
                      payload={inspectResult.rawResponse || inspectResult.data}
                      onCopy={() =>
                        handleCopy(
                          JSON.stringify(inspectResult.rawResponse || inspectResult.data, null, 2),
                          "inspectRaw"
                        )
                      }
                      copied={copiedKey === "inspectRaw"}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-red-600 font-bold">{inspectResult.error}</p>
                    {inspectResult.rawResponse && (
                      <RawJsonViewer
                        title="GET /order/:id Error Response"
                        method="GET"
                        endpoint={inspectResult.endpoint}
                        httpStatus={inspectResult.httpStatus}
                        payload={inspectResult.rawResponse}
                        onCopy={() =>
                          handleCopy(JSON.stringify(inspectResult.rawResponse, null, 2), "inspectErr")
                        }
                        copied={copiedKey === "inspectErr"}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Local MongoDB Webhook Simulator (clearly separated from real Pidge calls) */}
            <div className="pt-3 border-t border-amber-200 bg-amber-50/70 p-3.5 rounded-2xl border space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-900 tracking-wider">
                <Database className="size-3.5 text-amber-700" />
                <span>Local MongoDB Simulator Only (Does NOT call Pidge)</span>
              </div>
              <p className="text-[11px] text-amber-800/80">
                Tests our local MongoDB order timeline UI only if &quot;Also save in local MongoDB&quot; was checked.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateWebhook("OUT_FOR_DELIVERY")}
                  disabled={webhookLoading || !inspectOrderId}
                  className="p-2 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold transition disabled:opacity-50 cursor-pointer"
                >
                  Local: Out for Delivery
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateWebhook("DELIVERED")}
                  disabled={webhookLoading || !inspectOrderId}
                  className="p-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold transition disabled:opacity-50 cursor-pointer"
                >
                  Local: Delivered
                </button>
              </div>
              {webhookResult && (
                <p
                  className={`text-xs font-bold ${
                    webhookResult.success ? "text-amber-900" : "text-red-700"
                  }`}
                >
                  {webhookResult.success
                    ? `✓ Local DB updated to ${webhookResult.pidgeStatus} (${webhookResult.note})`
                    : `✗ ${webhookResult.error}`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TRACK SENT ORDERS (DATABASE HISTORY) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e6e2d8] shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6e2d8] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#064e3b]/10 text-[#064e3b]">
              <Layers className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0d261e]">
                Orders Sent to Pidge (Database History)
              </h2>
              <p className="text-xs text-[#52635c]">
                Track all orders saved in MongoDB that have a live Pidge Order ID attached ({recentOrders.length} orders found).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadRecentOrders}
            disabled={recentOrdersLoading}
            className="px-3.5 py-2 rounded-xl border border-[#e6e2d8] text-xs font-bold text-[#064e3b] hover:bg-[#fbf9f4] flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
          >
            <RefreshCw className={`size-3 ${recentOrdersLoading ? "animate-spin" : ""}`} />
            <span>Refresh List</span>
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#fbf9f4] border border-dashed border-[#e6e2d8] text-center text-xs text-[#52635c]">
            {recentOrdersLoading ? "Loading orders from database..." : "No orders dispatched to Pidge in MongoDB yet. Create one above with 'Also save in local MongoDB' checked, or dispatch from Admin Orders."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e6e2d8] text-[10px] font-black uppercase text-[#52635c] tracking-wider">
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Pidge Order ID</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e2d8]/60 font-medium">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#fbf9f4] transition">
                    <td className="py-3 px-3 font-mono font-bold text-[#0d261e]">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#064e3b]">
                      <div className="flex items-center gap-1.5">
                        <span>{ord.pidgeOrderId}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(ord.pidgeOrderId, `ord_${ord.id}`)}
                          className="p-1 rounded hover:bg-emerald-100 text-[#064e3b] cursor-pointer"
                        >
                          {copiedKey === `ord_${ord.id}` ? (
                            <Check className="size-3 text-emerald-700" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-200">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-[#0d261e]">
                      ₹{ord.amount}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-[#52635c]">
                      {ord.date}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleFetchOrderStatus(ord.pidgeOrderId)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#064e3b] text-white hover:bg-[#085a44] text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 shadow-2xs transition cursor-pointer"
                      >
                        <Search className="size-3" />
                        <span>Inspect Live</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. CHRONOLOGICAL LIVE PIDGE API WIRE LOG */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e6e2d8] shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6e2d8] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0d261e] text-[#d4af37]">
              <Terminal className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0d261e]">
                Live Pidge HTTP Wire Log (Session History)
              </h2>
              <p className="text-xs text-[#52635c]">
                Every direct HTTP request &amp; verbatim response from <code>https://store.dev.pidge.in</code> in this session. Also logged to your browser DevTools console and terminal stdout.
              </p>
            </div>
          </div>
          {apiLogs.length > 0 && (
            <button
              type="button"
              onClick={() => setApiLogs([])}
              className="px-3 py-1.5 rounded-xl border border-[#e6e2d8] text-xs font-bold text-[#52635c] hover:text-[#0d261e] cursor-pointer"
            >
              Clear Log ({apiLogs.length})
            </button>
          )}
        </div>

        {apiLogs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#fbf9f4] border border-dashed border-[#e6e2d8] text-center text-xs text-[#52635c]">
            Click <strong>Ping Auth API</strong>, <strong>Serviceability + Estimate</strong>, <strong>Live Quotes</strong>, or <strong>Create Live Test Order</strong> above to see Pidge&apos;s raw HTTP response stream here.
          </div>
        ) : (
          <div className="space-y-4">
            {apiLogs.map((log) => (
              <RawJsonViewer
                key={log.id}
                title={`[${log.timestamp}] ${log.label}`}
                method={log.method}
                endpoint={log.endpoint}
                httpStatus={log.httpStatus}
                requestPayload={log.requestPayload}
                payload={log.rawResponse}
                onCopy={() => handleCopy(JSON.stringify(log.rawResponse, null, 2), log.id)}
                copied={copiedKey === log.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
