"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useStore } from "@/lib/store";
import { submitComplaint, getUserComplaints } from "@/actions/complaint";
import {
  MessageSquareWarning, CheckCircle2, AlertTriangle, Clock, RefreshCw, Send, ShieldAlert,
} from "lucide-react";
import Link from "next/link";

function ComplaintsContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";

  const profile = useStore((s) => s.profile);

  const [form, setForm] = useState({
    orderId: initialOrderId,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    category: "food_quality" as "food_quality" | "late_delivery" | "missing_item" | "wrong_item" | "payment_issue" | "other",
    subject: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);
  const [pastComplaints, setPastComplaints] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        ...prev,
        customerName: prev.customerName || profile.name || "",
        customerEmail: prev.customerEmail || profile.email || "",
        customerPhone: prev.customerPhone || profile.phone || "",
      }));
    }
  }, [profile]);

  useEffect(() => {
    const fetchHistory = async () => {
      const history = await getUserComplaints();
      setPastComplaints(history);
      setLoadingHistory(false);
    };
    fetchHistory();
  }, [successTicket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessTicket(null);

    const res = await submitComplaint(form);

    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }

    setSuccessTicket(res.ticketId || "CMP-SUCCESS");
    setForm({
      orderId: "",
      customerName: profile?.name || "",
      customerEmail: profile?.email || "",
      customerPhone: profile?.phone || "",
      category: "food_quality",
      subject: "",
      description: "",
    });
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-lime/20 border border-lime/40 text-lime-deep text-xs font-mono uppercase tracking-widest rounded-full mb-3">
            <MessageSquareWarning className="size-3.5" /> Customer Help & Support
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
            How can we <span className="italic text-emerald">help you today?</span>
          </h1>
          <p className="mt-3 text-sm text-olive-dark leading-relaxed">
            Have an issue with your order, quality, or delivery? Submit a complaint ticket below and our kitchen response team will resolve it promptly.
          </p>
        </div>

        {/* Success Alert */}
        {successTicket && (
          <div className="mb-10 p-6 bg-lime/10 border-2 border-lime/40 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald font-bold text-base">
                <CheckCircle2 className="size-5" /> Complaint Ticket Submitted!
              </div>
              <p className="text-xs text-olive-dark mt-1 font-mono">
                Reference Ticket ID: <span className="font-bold text-ink bg-lime/30 px-2 py-0.5">{successTicket}</span>
              </p>
              <p className="text-xs text-olive-dark mt-1">
                Our support team is reviewing your ticket and will update you via email or phone.
              </p>
            </div>
            <button
              onClick={() => setSuccessTicket(null)}
              className="px-4 py-2 bg-ink text-lime text-xs font-mono uppercase tracking-widest rounded-full hover:bg-emerald transition shrink-0"
            >
              Submit Another
            </button>
          </div>
        )}

        {/* Complaint Form */}
        <div className="bg-white border-2 border-ink/10 rounded-3xl p-6 sm:p-10 shadow-sm mb-16">
          <h2 className="font-display text-2xl text-ink mb-6 pb-3 border-b border-ink/10">
            Submit a Complaint / Report Issue
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-4 border border-red-300 bg-red-50 text-xs text-red-700 rounded-xl">
                <AlertTriangle className="size-4 shrink-0 mt-0.5 text-red-600" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-mono tracking-widest uppercase text-olive mb-2">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Riya Sharma"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full h-12 px-4 bg-cream/50 border border-ink/10 focus:border-ink outline-none text-sm text-ink rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-widest uppercase text-olive mb-2">
                  Email Address *
                </label>
                <input
                  required
                  type="email"
                  placeholder="riya@example.com"
                  value={form.customerEmail}
                  onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                  className="w-full h-12 px-4 bg-cream/50 border border-ink/10 focus:border-ink outline-none text-sm text-ink rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-widest uppercase text-olive mb-2">
                  Phone Number *
                </label>
                <input
                  required
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  className="w-full h-12 px-4 bg-cream/50 border border-ink/10 focus:border-ink outline-none text-sm text-ink rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-widest uppercase text-olive mb-2">
                  Order ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ORD-948271"
                  value={form.orderId}
                  onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                  className="w-full h-12 px-4 bg-cream/50 border border-ink/10 focus:border-ink outline-none text-sm text-ink rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-olive mb-2">
                Complaint Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full h-12 px-4 bg-cream/50 border border-ink/10 focus:border-ink outline-none text-sm text-ink rounded-xl font-mono"
              >
                <option value="food_quality">🍱 Food Quality / Taste Issue</option>
                <option value="late_delivery">🛵 Delayed Delivery / Rider Issue</option>
                <option value="missing_item">📦 Missing Dish or Item</option>
                <option value="wrong_item">❌ Incorrect Dish Delivered</option>
                <option value="payment_issue">💳 Payment or Billing Issue</option>
                <option value="other">💬 General Support / Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-olive mb-2">
                Subject / Summary *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Missing paneer tikka from order ORD-948271"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full h-12 px-4 bg-cream/50 border border-ink/10 focus:border-ink outline-none text-sm text-ink rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-olive mb-2">
                Detailed Description *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Please describe what went wrong so we can resolve it immediately…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-4 bg-cream/50 border border-ink/10 focus:border-ink outline-none text-sm text-ink rounded-xl resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 bg-ink text-lime font-bold text-xs uppercase tracking-widest rounded-full hover:bg-emerald transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="size-4 animate-spin text-lime" /> Submitting Ticket…
                </>
              ) : (
                <>
                  <Send className="size-4" /> Submit Complaint Ticket
                </>
              )}
            </button>
          </form>
        </div>

        {/* Complaint History */}
        <div>
          <h2 className="font-display text-3xl text-ink mb-6 flex items-center justify-between">
            <span>your <span className="italic text-emerald">submitted tickets</span></span>
            <span className="text-xs font-mono font-normal text-olive">
              {pastComplaints.length} tickets
            </span>
          </h2>

          {loadingHistory ? (
            <div className="bg-white rounded-2xl p-8 text-center text-xs font-mono text-olive">
              <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-lime-deep" />
              Loading ticket history…
            </div>
          ) : pastComplaints.length === 0 ? (
            <div className="bg-white border border-ink/10 rounded-2xl p-8 text-center text-sm text-olive-dark">
              No complaint tickets submitted yet.
            </div>
          ) : (
            <div className="space-y-4">
              {pastComplaints.map((c) => (
                <div key={c._id} className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ink/5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-ink bg-cream px-2 py-0.5 border border-ink/10">
                          {c.ticketId}
                        </span>
                        {c.orderId && (
                          <Link href={`/orders/${c.orderId}/track`} className="text-xs text-emerald underline font-mono">
                            Order #{c.orderId}
                          </Link>
                        )}
                      </div>
                      <div className="font-medium text-ink text-base mt-1.5">{c.subject}</div>
                    </div>
                    <div>
                      {c.status === "pending" && (
                        <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-mono uppercase tracking-widest rounded-full flex items-center gap-1">
                          <Clock className="size-3" /> Under Review
                        </span>
                      )}
                      {c.status === "in_progress" && (
                        <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono uppercase tracking-widest rounded-full flex items-center gap-1">
                          <RefreshCw className="size-3 animate-spin" /> In Progress
                        </span>
                      )}
                      {c.status === "resolved" && (
                        <span className="px-3 py-1 bg-lime/20 border border-lime/50 text-emerald text-[10px] font-mono uppercase tracking-widest rounded-full flex items-center gap-1">
                          <CheckCircle2 className="size-3" /> Resolved
                        </span>
                      )}
                      {c.status === "dismissed" && (
                        <span className="px-3 py-1 bg-gray-100 border border-gray-300 text-gray-600 text-[10px] font-mono uppercase tracking-widest rounded-full flex items-center gap-1">
                          <ShieldAlert className="size-3" /> Closed
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-olive-dark mt-3 leading-relaxed">{c.description}</p>
                  {c.resolutionNotes && (
                    <div className="mt-4 p-3 bg-cream border border-ink/10 rounded-xl text-xs text-ink">
                      <div className="font-mono text-[9px] uppercase tracking-widest text-lime-deep mb-1 font-bold">
                        Kitchen Response / Resolution:
                      </div>
                      {c.resolutionNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default function ComplaintsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream p-8 text-center text-ink font-display text-2xl">Loading Complaints…</div>}>
      <ComplaintsContent />
    </Suspense>
  );
}
