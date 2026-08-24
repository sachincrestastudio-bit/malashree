"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Store,
  CreditCard,
  Truck,
  Cloud,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Key,
  Globe,
  Mail,
  Phone,
  Percent,
  Receipt,
  Package,
} from "lucide-react";
import { updateSystemSettings } from "@/actions/adminSetting";

interface Props {
  initialSettings: any;
}

export default function AdminSettingsClient({ initialSettings }: Props) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"pricing" | "store" | "delivery" | "integrations">("pricing");
  const [form, setForm] = useState(initialSettings || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = {
      ...form,
      taxPercentage: Number(form.taxPercentage) || 0,
      packagingCharge: Number(form.packagingCharge) || 0,
      platformFee: Number(form.platformFee) || 0,
      defaultDeliveryFee: Number(form.defaultDeliveryFee) || 0,
      freeDeliveryThreshold: Number(form.freeDeliveryThreshold) || 0,
      maxDeliveryRadiusKm: Number(form.maxDeliveryRadiusKm) || 10,
    };

    const res = await updateSystemSettings(payload);

    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
    router.refresh();
  };

  const tabs = [
    { id: "pricing", label: "GST & Billing Rates", icon: CreditCard },
    { id: "store", label: "Store & Brand", icon: Store },
    { id: "delivery", label: "Delivery & Logistics", icon: Truck },
    { id: "integrations", label: "Cloud & APIs", icon: Cloud },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#e6e2d8] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black tracking-widest uppercase text-[#52635c]">
            ADMIN PORTAL · CONFIGURATION
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0d261e] tracking-tight">
            System & Billing Settings
          </h1>
          <p className="text-xs text-[#52635c] mt-1">
            Configure GST rates, packaging fees, delivery rules, and platform parameters.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-11 px-6 inline-flex items-center gap-2.5 bg-[#064e3b] text-[#d4af37] text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-[#0a5c46] transition shadow-md border border-[#d4af37]/30 self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="size-4 animate-spin text-[#d4af37]" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="size-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Success Toast */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-[#064e3b] text-xs font-bold shadow-2xs">
          <CheckCircle2 className="size-4 text-[#064e3b] shrink-0" />
          <span>System Settings & Billing Rules Saved Successfully!</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold shadow-2xs">
          <AlertTriangle className="size-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Controls */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl transition cursor-pointer border ${
                active
                  ? "bg-[#064e3b] text-[#d4af37] border-[#064e3b] shadow-xs"
                  : "bg-white text-[#52635c] border-[#e6e2d8] hover:border-[#d4af37]"
              }`}
            >
              <Icon className="size-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: GST & Billing Rates (Featured First) */}
      {activeTab === "pricing" && (
        <div className="bg-white border border-[#e6e2d8] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-black text-lg text-[#0d261e]">
              GST Tax Rates & Billing Breakdown Settings
            </h3>
            <p className="text-xs text-[#52635c] mt-0.5">
              These percentages and charges are automatically computed across the customer cart, bill summary drawer, and checkout.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* GST Tax Rate */}
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-[#064e3b]">
                  GST Tax Rate (%)
                </label>
                <Percent className="size-4 text-[#d4af37]" />
              </div>
              <input
                required
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={form.taxPercentage ?? 5}
                onChange={(e) => setForm({ ...form, taxPercentage: e.target.value })}
                className="w-full h-12 px-4 bg-white border border-amber-300 focus:border-[#064e3b] outline-none text-base font-black text-[#0d261e] rounded-xl"
              />
              <span className="text-[11px] text-[#52635c] block">
                Applied to food item subtotal. (e.g. 5% for Restaurant GST).
              </span>
            </div>

            {/* Restaurant Packaging Charge */}
            <div className="p-5 rounded-2xl bg-[#fbf9f4] border border-[#e6e2d8] space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-[#0d261e]">
                  Packaging Charges (₹)
                </label>
                <Package className="size-4 text-[#064e3b]" />
              </div>
              <input
                required
                type="number"
                min="0"
                value={form.packagingCharge ?? 15}
                onChange={(e) => setForm({ ...form, packagingCharge: e.target.value })}
                className="w-full h-12 px-4 bg-white border border-[#e6e2d8] focus:border-[#064e3b] outline-none text-base font-black text-[#0d261e] rounded-xl"
              />
              <span className="text-[11px] text-[#52635c] block">
                Fixed restaurant hygienic packaging charge per order.
              </span>
            </div>

            {/* Platform Fee */}
            <div className="p-5 rounded-2xl bg-[#fbf9f4] border border-[#e6e2d8] space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-[#0d261e]">
                  Platform Fee (₹)
                </label>
                <Receipt className="size-4 text-[#064e3b]" />
              </div>
              <input
                required
                type="number"
                step="0.5"
                min="0"
                value={form.platformFee ?? 5}
                onChange={(e) => setForm({ ...form, platformFee: e.target.value })}
                className="w-full h-12 px-4 bg-white border border-[#e6e2d8] focus:border-[#064e3b] outline-none text-base font-black text-[#0d261e] rounded-xl"
              />
              <span className="text-[11px] text-[#52635c] block">
                App operating fee per order.
              </span>
            </div>

            {/* Standard Delivery Fee */}
            <div className="p-5 rounded-2xl bg-[#fbf9f4] border border-[#e6e2d8] space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-[#0d261e]">
                Default Delivery Fee (₹)
              </label>
              <input
                required
                type="number"
                min="0"
                value={form.defaultDeliveryFee ?? 34}
                onChange={(e) => setForm({ ...form, defaultDeliveryFee: e.target.value })}
                className="w-full h-12 px-4 bg-white border border-[#e6e2d8] focus:border-[#064e3b] outline-none text-base font-black text-[#0d261e] rounded-xl"
              />
              <span className="text-[11px] text-[#52635c] block">
                Base fee for orders below free delivery threshold.
              </span>
            </div>

            {/* Free Delivery Threshold */}
            <div className="p-5 rounded-2xl bg-[#fbf9f4] border border-[#e6e2d8] space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-[#0d261e]">
                Free Delivery Above (₹)
              </label>
              <input
                required
                type="number"
                min="0"
                value={form.freeDeliveryThreshold ?? 500}
                onChange={(e) => setForm({ ...form, freeDeliveryThreshold: e.target.value })}
                className="w-full h-12 px-4 bg-white border border-[#e6e2d8] focus:border-[#064e3b] outline-none text-base font-black text-[#0d261e] rounded-xl"
              />
              <span className="text-[11px] text-[#52635c] block">
                Orders with item total ≥ this amount get free delivery.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Store & Brand Profile */}
      {activeTab === "store" && (
        <div className="bg-white border border-[#e6e2d8] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <h3 className="font-black text-lg text-[#0d261e] pb-3 border-b border-gray-100">
            Brand Profile & Operating Controls
          </h3>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#0d261e] mb-2">
                Brand Name *
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#52635c]" />
                <input
                  required
                  type="text"
                  value={form.brandName || ""}
                  onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                  className="w-full h-12 pl-11 pr-4 bg-[#fbf9f4] border border-[#e6e2d8] focus:border-[#064e3b] outline-none text-xs font-bold text-[#0d261e] rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0d261e] mb-2">
                Support Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#52635c]" />
                <input
                  required
                  type="email"
                  value={form.supportEmail || ""}
                  onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                  className="w-full h-12 pl-11 pr-4 bg-[#fbf9f4] border border-[#e6e2d8] focus:border-[#064e3b] outline-none text-xs font-bold text-[#0d261e] rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0d261e] mb-2">
                Support Phone Helpline *
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#52635c]" />
                <input
                  required
                  type="text"
                  value={form.supportPhone || ""}
                  onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                  className="w-full h-12 pl-11 pr-4 bg-[#fbf9f4] border border-[#e6e2d8] focus:border-[#064e3b] outline-none text-xs font-bold text-[#0d261e] rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-4">
            {/* Global Store Online Toggle */}
            <div className="flex items-center justify-between p-4 bg-[#fbf9f4] border border-[#e6e2d8] rounded-2xl">
              <div>
                <div className="font-bold text-sm text-[#0d261e]">Global Kitchen Network Status</div>
                <div className="text-xs text-[#52635c] mt-0.5">
                  Master switch to accept online orders across all kitchen branches.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, isStoreOnline: !form.isStoreOnline })}
                className="cursor-pointer"
              >
                {form.isStoreOnline ? (
                  <ToggleRight className="size-8 text-[#064e3b]" />
                ) : (
                  <ToggleLeft className="size-8 text-gray-400" />
                )}
              </button>
            </div>

            {/* Maintenance Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <div>
                <div className="font-bold text-sm text-amber-900 flex items-center gap-2">
                  <ShieldAlert className="size-4 text-amber-600" /> Maintenance Mode
                </div>
                <div className="text-xs text-amber-800 mt-0.5">
                  Displays maintenance banner to visitors and pauses checkout.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, maintenanceMode: !form.maintenanceMode })}
                className="cursor-pointer"
              >
                {form.maintenanceMode ? (
                  <ToggleRight className="size-8 text-amber-600" />
                ) : (
                  <ToggleLeft className="size-8 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Delivery & Logistics */}
      {activeTab === "delivery" && (
        <div className="bg-white border border-[#e6e2d8] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <h3 className="font-black text-lg text-[#0d261e] pb-3 border-b border-gray-100">
            Logistics & Hyperlocal Dispatch Settings
          </h3>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#0d261e] mb-2">
                Max Kitchen Delivery Radius (km) *
              </label>
              <input
                required
                type="number"
                min="1"
                value={form.maxDeliveryRadiusKm ?? 10}
                onChange={(e) => setForm({ ...form, maxDeliveryRadiusKm: e.target.value })}
                className="w-full h-12 px-4 bg-[#fbf9f4] border border-[#e6e2d8] focus:border-[#064e3b] outline-none text-xs font-bold text-[#0d261e] rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Cloud & Integrations */}
      {activeTab === "integrations" && (
        <div className="bg-white border border-[#e6e2d8] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <h3 className="font-black text-lg text-[#0d261e] pb-3 border-b border-gray-100">
            API Keys & External Services
          </h3>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#0d261e] mb-2">
                Cloudinary Cloud Name
              </label>
              <input
                type="text"
                value={form.cloudinaryCloudName || "djoklzpse"}
                onChange={(e) => setForm({ ...form, cloudinaryCloudName: e.target.value })}
                className="w-full h-12 px-4 bg-[#fbf9f4] border border-[#e6e2d8] focus:border-[#064e3b] outline-none text-xs font-bold text-[#0d261e] rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0d261e] mb-2">
                Cloudinary Upload Preset
              </label>
              <input
                type="text"
                value={form.cloudinaryUploadPreset || "malashree_dishes"}
                onChange={(e) => setForm({ ...form, cloudinaryUploadPreset: e.target.value })}
                className="w-full h-12 px-4 bg-[#fbf9f4] border border-[#e6e2d8] focus:border-[#064e3b] outline-none text-xs font-bold text-[#0d261e] rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
