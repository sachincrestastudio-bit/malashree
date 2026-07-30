"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquareWarning, Search, CheckCircle2, Clock, RefreshCw, ShieldAlert,
  X, AlertTriangle, ExternalLink, Mail, Phone, Filter,
} from "lucide-react";
import { updateComplaintStatus } from "@/actions/complaint";
import Link from "next/link";

interface ComplaintItem {
  id: string;
  ticketId: string;
  orderId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  category: string;
  subject: string;
  description: string;
  status: "pending" | "in_progress" | "resolved" | "dismissed";
  resolutionNotes: string;
  createdAt: string;
}

interface Props {
  complaints: ComplaintItem[];
}

export default function AdminComplaintsClient({ complaints }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const [selectedTarget, setSelectedTarget] = useState<ComplaintItem | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [targetStatus, setTargetStatus] = useState<"pending" | "in_progress" | "resolved" | "dismissed">("resolved");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        c.ticketId.toLowerCase().includes(q) ||
        (c.orderId && c.orderId.toLowerCase().includes(q)) ||
        c.customerName.toLowerCase().includes(q) ||
        c.customerEmail.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q);

      const matchesStatus = filterStatus === "all" || c.status === filterStatus;
      const matchesCategory = filterCategory === "all" || c.category === filterCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [complaints, search, filterStatus, filterCategory]);

  const openResolveModal = (c: ComplaintItem, nextStatus: "in_progress" | "resolved" | "dismissed") => {
    setSelectedTarget(c);
    setTargetStatus(nextStatus);
    setResolutionNotes(c.resolutionNotes || "");
    setError(null);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget) return;

    setUpdating(true);
    setError(null);

    const res = await updateComplaintStatus(selectedTarget.id, {
      status: targetStatus,
      resolutionNotes,
    });

    setUpdating(false);
    if (res.error) {
      setError(res.error);
      return;
    }

    setSelectedTarget(null);
    router.refresh();
  };

  const categoryLabels: Record<string, string> = {
    food_quality: "🍱 Food Quality",
    late_delivery: "🛵 Late Delivery",
    missing_item: "📦 Missing Item",
    wrong_item: "❌ Wrong Item",
    payment_issue: "💳 Payment / Billing",
    other: "💬 General Support",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b-2 border-ink pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-2">
            <span className="h-px w-8 bg-lime" />
            Chapter · Customer Care
          </div>
          <h2 className="font-display text-4xl text-ink leading-[0.95]">
            Customer <span className="italic text-emerald">Complaints</span>
          </h2>
          <p className="text-sm text-olive-dark mt-2 italic font-light">
            {complaints.length} customer issues registered · track and resolve tickets.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-olive" />
          <input
            type="text"
            placeholder="Search ticket ID, order ID, customer name, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink font-mono"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed / Closed</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink font-mono"
        >
          <option value="all">All Categories</option>
          <option value="food_quality">Food Quality</option>
          <option value="late_delivery">Late Delivery</option>
          <option value="missing_item">Missing Item</option>
          <option value="wrong_item">Wrong Item</option>
          <option value="payment_issue">Payment Issue</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-ink/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-ink/10">
              <tr>
                {["Ticket ID", "Customer Details", "Category & Subject", "Description", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-[9px] font-mono tracking-[0.24em] uppercase text-olive whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <MessageSquareWarning className="h-10 w-10 text-olive/20 mx-auto mb-3" />
                    <p className="font-display italic text-xl text-ink">No complaints found.</p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-olive mt-2">
                      Zero complaints matching filter criteria
                    </p>
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-cream/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-ink text-xs">
                        <span className="bg-ink/5 border border-ink/10 px-2 py-0.5">{c.ticketId}</span>
                      </div>
                      {c.orderId && (
                        <Link href={`/delivery/order/${c.orderId}`} className="text-[10px] font-mono text-emerald hover:underline mt-1.5 flex items-center gap-1">
                          Order #{c.orderId} <ExternalLink className="size-2.5" />
                        </Link>
                      )}
                      <div className="text-[9px] font-mono text-olive mt-1">{c.createdAt}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-ink text-sm">{c.customerName}</div>
                      <div className="text-xs text-olive-dark flex items-center gap-1 mt-0.5">
                        <Mail className="size-3 text-olive/50" /> {c.customerEmail}
                      </div>
                      <div className="text-xs text-olive-dark flex items-center gap-1 mt-0.5">
                        <Phone className="size-3 text-olive/50" /> {c.customerPhone}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-xs font-mono font-bold text-lime-deep">
                        {categoryLabels[c.category] || c.category}
                      </div>
                      <div className="font-medium text-ink text-sm mt-1 max-w-xs">{c.subject}</div>
                    </td>

                    <td className="px-5 py-4 text-xs text-olive-dark max-w-sm">
                      <p className="line-clamp-3">{c.description}</p>
                      {c.resolutionNotes && (
                        <div className="mt-2 p-2 bg-cream border border-ink/10 rounded text-[10px] text-ink font-mono">
                          <span className="font-bold text-lime-deep uppercase">Response: </span>
                          {c.resolutionNotes}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {c.status === "pending" && (
                        <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-amber-300 text-amber-700 bg-amber-50 flex items-center gap-1 w-fit">
                          <Clock className="size-3" /> Pending
                        </span>
                      )}
                      {c.status === "in_progress" && (
                        <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-blue-300 text-blue-700 bg-blue-50 flex items-center gap-1 w-fit">
                          <RefreshCw className="size-3 animate-spin" /> In Progress
                        </span>
                      )}
                      {c.status === "resolved" && (
                        <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-lime/50 text-lime-deep bg-lime/10 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="size-3" /> Resolved
                        </span>
                      )}
                      {c.status === "dismissed" && (
                        <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-gray-300 text-gray-600 bg-gray-100 flex items-center gap-1 w-fit">
                          <ShieldAlert className="size-3" /> Closed
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        {c.status !== "resolved" && (
                          <button
                            onClick={() => openResolveModal(c, "resolved")}
                            className="px-3 py-1 bg-ink text-lime text-[10px] font-mono tracking-widest uppercase hover:bg-emerald transition w-full text-center"
                          >
                            Resolve
                          </button>
                        )}
                        {c.status === "pending" && (
                          <button
                            onClick={() => openResolveModal(c, "in_progress")}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-[10px] font-mono tracking-widest uppercase hover:bg-blue-200 transition w-full text-center"
                          >
                            Mark In Progress
                          </button>
                        )}
                        {c.status !== "dismissed" && (
                          <button
                            onClick={() => openResolveModal(c, "dismissed")}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-[10px] font-mono tracking-widest uppercase hover:bg-gray-200 transition w-full text-center"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Modal */}
      {selectedTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4">
          <div className="bg-cream border-2 border-ink w-full max-w-md">
            <div className="px-6 py-4 border-b-2 border-ink flex items-center justify-between">
              <div>
                <div className="text-[9px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-1">
                  Ticket Status Update · {selectedTarget.ticketId}
                </div>
                <h3 className="font-display text-xl text-ink">
                  Update Status to: <span className="uppercase text-emerald">{targetStatus}</span>
                </h3>
              </div>
              <button onClick={() => setSelectedTarget(null)} className="text-olive hover:text-ink">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-[9px] font-mono tracking-widest uppercase text-olive mb-1">
                  Resolution Notes / Response to Customer
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Issue resolved. Refund of ₹250 initiated for missing dish. Customer contacted via phone."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full p-3 bg-white border border-ink/20 focus:border-ink outline-none text-sm text-ink resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="h-10 px-6 bg-ink text-lime text-xs font-mono uppercase tracking-widest hover:bg-emerald transition disabled:opacity-50"
                >
                  {updating ? "Updating…" : "Confirm Update"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTarget(null)}
                  className="text-xs font-mono uppercase tracking-widest text-olive hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
