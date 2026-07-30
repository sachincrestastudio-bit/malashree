"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save, RefreshCw, AlertTriangle, CheckCircle2, Store, CreditCard,
  Truck, Cloud, ToggleLeft, ToggleRight, ShieldAlert, Key, Globe, Mail, Phone,
} from "lucide-react";
import { updateSystemSettings } from "@/actions/adminSetting";

interface Props {
  initialSettings: any;
}

export default function AdminSettingsClient({ initialSettings }: Props) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"store" | "pricing" | "delivery" | "integrations">("store");
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
      taxPercentage: Number(form.taxPercentage),
      defaultDeliveryFee: Number(form.defaultDeliveryFee),
      freeDeliveryThreshold: Number(form.freeDeliveryThreshold),
      maxDeliveryRadiusKm: Number(form.maxDeliveryRadiusKm),
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
    { id: "store", label: "Store & Operations", icon: Store },
    { id: "pricing", label: "Pricing & Taxes", icon: CreditCard },
    { id: "delivery", label: "Delivery & Logistics", icon: Truck },
    { id: "integrations", label: "Cloud & APIs", icon: Cloud },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      {/* Masthead Header */}
      <div className="border-b-2 border-ink pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-2">
            <span className="h-px w-8 bg-lime" />
            Chapter · System Configuration
          </div>
          <h2 className="font-display text-4xl text-ink leading-[0.95]">
            Global <span className="italic text-emerald">Settings</span>
          </h2>
          <p className="text-sm text-olive-dark mt-2 italic font-light">
            Manage store operations, tax rates, delivery radii, and Pidge/Cloudinary API keys.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="group h-11 px-6 inline-flex items-center gap-3 bg-ink text-lime text-[11px] font-bold tracking-[0.24em] uppercase hover:bg-emerald transition self-start sm:self-auto disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="size-4 animate-spin text-lime" /> Saving…
            </>
          ) : (
            <>
              <Save className="size-4" /> Save Configuration
            </>
          )}
        </button>
      </div>

      {/* Success Toast Banner */}
      {success && (
        <div className="p-4 bg-lime/20 border-2 border-lime/50 rounded-2xl flex items-center justify-between gap-3 text-emerald text-xs font-mono uppercase tracking-widest font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4" /> System Settings Saved Successfully!
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-medium">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Controls */}
      <div className="flex flex-wrap gap-2 border-b border-ink/10 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-mono tracking-widest uppercase transition-all border-b-2 -mb-px ${
                active
                  ? "border-ink font-bold text-ink bg-white"
                  : "border-transparent text-olive hover:text-ink"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Store Operations */}
      {activeTab === "store" && (
        <div className="bg-white border border-ink/10 rounded-2xl p-6 sm:p-8 space-y-6">
          <h3 className="font-display text-2xl text-ink pb-3 border-b border-ink/10">
            Store Profile & Operating Controls
          </h3>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-olive mb-2">
                Brand Name *
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-olive" />
                <input
                  required
                  type="text"
                  value={form.brandName || ""}
                  onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                  className="w-full h-12 pl-11 pr-4 bg-cream/30 border border-ink/10 focus:border-ink outline-none text-sm text-ink rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-olive mb-2">
                Support Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-olive" />
                <input
                  required
                  type="email"
                  value={form.supportEmail || ""}
                  onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                  className="w-full h-12 pl-11 pr-4 bg-cream/30 border border-ink/10 focus:border-ink outline-none text-sm text-ink rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-olive mb-2">
                Support Phone Helpline *
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-olive" />
                <input
                  required
                  type="text"
                  value={form.supportPhone || ""}
                  onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                  className="w-full h-12 pl-11 pr-4 bg-cream/30 border border-ink/10 focus:border-ink outline-none text-sm text-ink rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-ink/10 space-y-4">
            {/* Global Store Online Toggle */}
            <div className="flex items-center justify-between p-4 bg-cream/50 border border-ink/10 rounded-2xl">
              <div>
                <div className="font-bold text-sm text-ink">Global Kitchen Network Status</div>
                <div className="text-xs text-olive-dark mt-0.5">
                  Master switch to accept online orders across all kitchen branches.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, isStoreOnline: !form.isStoreOnline })}
                className="text-ink"
              >
                {form.isStoreOnline ? (
                  <ToggleRight className="size-8 text-lime-deep" />
                ) : (
                  <ToggleLeft className="size-8 text-olive/40" />
                )}
              </button>
            </div>

            {/* Maintenance Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
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
                className="text-ink"
              >
                {form.maintenanceMode ? (
                  <ToggleRight className="size-8 text-amber-600" />
                ) : (
                  <ToggleLeft className="size-8 text-olive/40" />
                )}
              </button>
            </div>

            {form.maintenanceMode && (
              <div>
                <label className="block text-[10px] font-mono tracking-widest uppercase text-olive mb-2">
                  Maintenance Announcement Banner Text
                </label>
                <textarea
                  rows={2}
                  value={form.maintenanceMessage || ""}
                  onChange={(e) => setForm({ ...form, maintenanceMessage: e.target.value })}
                  className="w-full p-3 bg-white border border-amber-300 text-xs text-amber-900 rounded-xl resize-none"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Pricing & Taxes */}
      {activeTab === "pricing" && (
        <div className="bg-white border border-ink/10 rounded-2xl p-6 sm:p-8 space-y-6">
          <h3 className="font-display text-2xl text-ink pb-3 border-b border-ink/10">
            Tax Rates & Fee Calculation Rules
          </h3>

          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-olive mb-2">
                GST Tax Rate (%) *
              </label>
              <input
                required
                type="number"
                step="0.1"
                min="0"
                value={form.taxPercentage ?? 5}
                onChange={(e) => setForm({ ...form, taxPercentage: e.target.value })}
                className="w-full h-12 px-4 bg-cream/30 border border-ink/10 focus:border-ink outline-none text-sm text-ink rounded-xl font-mono"
              />
              <span className="text-[10px] text-olive mt-1 block">Applied to food subtotal.</span>
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-olive mb-2">
                Default Delivery Fee (₹) *
              </label>
              <input
                required
                type="number"
                min="0"
                value={form.defaultDeliveryFee ?? 40}
                onChange={(e) => setForm({ ...form, defaultDeliveryFee: e.target.value })}
                className="w-full h-12 px-4 bg-cream/30 border border-ink/10 focus:border-ink outline-none text-sm text-ink rounded-xl font-mono"
              />
              <span className="text-[10px] text-olive mt-1 block">Standard delivery charge per order.</span>
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-olive mb-2">
                Free Delivery Threshold (₹) *
              </label>
              <input
                required
                type="number"
                min="0"
                value={form.freeDeliveryThreshold ?? 500}
                onChange={(e) => setForm({ ...form, freeDeliveryThreshold: e.target.value })}
                className="w-full h-12 px-4 bg-cream/30 border border-ink/10 focus:border-ink outline-none text-sm text-ink rounded-xl font-mono"
              />
              <span className="text-[10px] text-olive mt-1 block">Orders above this amount get ₹0 delivery.</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Delivery & Logistics */}
      {activeTab === "delivery" && (
        <div className="bg-white border border-ink/10 rounded-2xl p-6 sm:p-8 space-y-6">
          <h3 className="font-display text-2xl text-ink pb-3 border-b border-ink/10">
            Logistics & Hyperlocal Dispatch Settings
          </h3>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-olive mb-2">
                Max Kitchen Delivery Radius (km) *
              </label>
              <input
                required
                type="number"
                min="1"
                value={form.maxDeliveryRadiusKm ?? 10}
                onChange={(e) => setForm({ ...form, maxDeliveryRadiusKm: e.target.value })}
                className="w-full h-12 px-4 bg-cream/30 border border-ink/10 focus:border-ink outline-none text-sm text-ink rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-ink/10 space-y-4">
            {/* Pidge Logistics Toggle */}
            <div className="flex items-center justify-between p-4 bg-cream/50 border border-ink/10 rounded-2xl">
              <div>
                <div className="font-bold text-sm text-ink">Pidge Hyperlocal Delivery Service</div>
                <div className="text-xs text-olive-dark mt-0.5">
                  Enables 1-click Pidge rider dispatch from admin orders dashboard.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, pidgeIntegrationActive: !form.pidgeIntegrationActive })}
                className="text-ink"
              >
                {form.pidgeIntegrationActive ? (
                  <ToggleRight className="size-8 text-lime-deep" />
                ) : (
                  <ToggleLeft className="size-8 text-olive/40" />
                )}
              </button>
            </div>

            {/* Auto Driver Assignment */}
            <div className="flex items-center justify-between p-4 bg-cream/50 border border-ink/10 rounded-2xl">
              <div>
                <div className="font-bold text-sm text-ink">Auto Driver Assignment</div>
                <div className="text-xs text-olive-dark mt-0.5">
                  Automatically assigns nearest active in-house driver upon order acceptance.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, autoAssignDrivers: !form.autoAssignDrivers })}
                className="text-ink"
              >
                {form.autoAssignDrivers ? (
                  <ToggleRight className="size-8 text-lime-deep" />
                ) : (
                  <ToggleLeft className="size-8 text-olive/40" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Cloud & Integrations */}
      {activeTab === "integrations" && (
        <div className="bg-white border border-ink/10 rounded-2xl p-6 sm:p-8 space-y-6">
          <h3 className="font-display text-2xl text-ink pb-3 border-b border-ink/10">
            API Keys & External Services
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-olive mb-2">
                Pidge API Authorization Key
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-olive" />
                <input
                  type="password"
                  value={form.pidgeApiKey || ""}
                  onChange={(e) => setForm({ ...form, pidgeApiKey: e.target.value })}
                  className="w-full h-12 pl-11 pr-4 bg-cream/30 border border-ink/10 focus:border-ink outline-none text-sm text-ink rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-ink/10">
              <div>
                <label className="block text-[10px] font-mono tracking-widest uppercase text-olive mb-2">
                  Cloudinary Cloud Name
                </label>
                <input
                  type="text"
                  value={form.cloudinaryCloudName || "djoklzpse"}
                  onChange={(e) => setForm({ ...form, cloudinaryCloudName: e.target.value })}
                  className="w-full h-12 px-4 bg-cream/30 border border-ink/10 focus:border-ink outline-none text-sm text-ink rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-widest uppercase text-olive mb-2">
                  Cloudinary Unsigned Upload Preset
                </label>
                <input
                  type="text"
                  value={form.cloudinaryUploadPreset || "malashree_dishes"}
                  onChange={(e) => setForm({ ...form, cloudinaryUploadPreset: e.target.value })}
                  className="w-full h-12 px-4 bg-cream/30 border border-ink/10 focus:border-ink outline-none text-sm text-ink rounded-xl font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
