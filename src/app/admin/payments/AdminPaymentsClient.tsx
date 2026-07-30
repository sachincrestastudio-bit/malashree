"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard, Search, ArrowUpRight, RotateCcw, AlertTriangle, X,
  CheckCircle2, AlertCircle, Clock, ShieldCheck, IndianRupee, Store, RefreshCw, Wallet,
} from "lucide-react";
import { processRefund, updateTransactionStatus } from "@/actions/adminPayment";

interface TransactionItem {
  id: string;
  transactionId: string;
  gatewayOrderId: string;
  gateway: "razorpay" | "cod" | "stripe" | "phonepe";
  customerName: string;
  customerEmail: string;
  kitchenName: string;
  orderNumber?: string;
  amount: number;
  currency: string;
  status: "pending" | "authorized" | "captured" | "failed" | "cancelled" | "refunded" | "partially_refunded";
  refundAmount: number;
  refundStatus: string;
  createdAt: string;
}

interface SummaryKPIs {
  totalProcessed: number;
  onlineVolume: number;
  codVolume: number;
  refundedVolume: number;
}

interface Props {
  transactions: TransactionItem[];
  kpis: SummaryKPIs;
}

export default function AdminPaymentsClient({ transactions, kpis }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterGateway, setFilterGateway] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [refundTarget, setRefundTarget] = useState<TransactionItem | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const q = search.toLowerCase();
      const matchesSearch =
        t.transactionId.toLowerCase().includes(q) ||
        t.gatewayOrderId.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.customerEmail.toLowerCase().includes(q) ||
        t.kitchenName.toLowerCase().includes(q) ||
        (t.orderNumber && t.orderNumber.toLowerCase().includes(q));

      const matchesGateway = filterGateway === "all" || t.gateway === filterGateway;
      const matchesStatus = filterStatus === "all" || t.status === filterStatus;

      return matchesSearch && matchesGateway && matchesStatus;
    });
  }, [transactions, search, filterGateway, filterStatus]);

  const openRefundModal = (t: TransactionItem) => {
    setRefundTarget(t);
    const maxRefund = t.amount - (t.refundAmount || 0);
    setRefundAmount(String(maxRefund));
    setRefundReason("Customer requested refund");
    setError(null);
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTarget) return;

    setLoading(true);
    setError(null);

    const res = await processRefund(refundTarget.id, {
      amount: Number(refundAmount),
      reason: refundReason,
    });

    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }

    setRefundTarget(null);
    router.refresh();
  };

  const handleMarkCaptured = async (id: string) => {
    setStatusUpdatingId(id);
    await updateTransactionStatus(id, "captured");
    setStatusUpdatingId(null);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b-2 border-ink pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-2">
            <span className="h-px w-8 bg-lime" />
            Chapter · Financial Operations
          </div>
          <h2 className="font-display text-4xl text-ink leading-[0.95]">
            Payment <span className="italic text-emerald">Transactions</span>
          </h2>
          <p className="text-sm text-olive-dark mt-2 italic font-light">
            {transactions.length} financial transactions recorded across Razorpay & COD.
          </p>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-mono uppercase tracking-widest text-olive flex items-center justify-between">
            <span>Total Volume</span>
            <Wallet className="size-4 text-emerald" />
          </div>
          <div className="font-display text-3xl font-bold text-ink mt-2">
            ₹{kpis.totalProcessed.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] font-mono text-olive mt-1">Processed transactions</div>
        </div>

        <div className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-mono uppercase tracking-widest text-olive flex items-center justify-between">
            <span>Online (Razorpay)</span>
            <CreditCard className="size-4 text-blue-600" />
          </div>
          <div className="font-display text-3xl font-bold text-ink mt-2">
            ₹{kpis.onlineVolume.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] font-mono text-blue-600 mt-1">Digital payments</div>
        </div>

        <div className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-mono uppercase tracking-widest text-olive flex items-center justify-between">
            <span>Cash on Delivery</span>
            <IndianRupee className="size-4 text-amber-600" />
          </div>
          <div className="font-display text-3xl font-bold text-ink mt-2">
            ₹{kpis.codVolume.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] font-mono text-amber-600 mt-1">COD collection</div>
        </div>

        <div className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-mono uppercase tracking-widest text-olive flex items-center justify-between">
            <span>Refunded</span>
            <RotateCcw className="size-4 text-red-500" />
          </div>
          <div className="font-display text-3xl font-bold text-ink mt-2">
            ₹{kpis.refundedVolume.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] font-mono text-red-500 mt-1">Returned to customers</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-olive" />
          <input
            type="text"
            placeholder="Search transaction ID, gateway order, customer, kitchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink"
          />
        </div>

        <select
          value={filterGateway}
          onChange={(e) => setFilterGateway(e.target.value)}
          className="h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink font-mono"
        >
          <option value="all">All Gateways</option>
          <option value="razorpay">Razorpay</option>
          <option value="cod">Cash on Delivery (COD)</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink font-mono"
        >
          <option value="all">All Statuses</option>
          <option value="captured">Captured / Paid</option>
          <option value="authorized">Authorized</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-ink/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-ink/10">
              <tr>
                {["Transaction ID", "Gateway", "Customer", "Kitchen Branch", "Amount", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-[9px] font-mono tracking-[0.24em] uppercase text-olive whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <CreditCard className="h-10 w-10 text-olive/20 mx-auto mb-3" />
                    <p className="font-display italic text-xl text-ink">No transactions found.</p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-olive mt-2">
                      Try resetting your filter parameters
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-cream/60 transition-colors">
                    {/* Transaction ID */}
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-ink text-xs flex items-center gap-2">
                        <span className="bg-ink/5 border border-ink/10 px-2 py-0.5">{t.transactionId}</span>
                      </div>
                      <div className="text-[9px] font-mono text-olive mt-1">Order: {t.gatewayOrderId}</div>
                      <div className="text-[9px] font-mono text-olive/60 mt-0.5">{t.createdAt}</div>
                    </td>

                    {/* Gateway */}
                    <td className="px-5 py-4">
                      {t.gateway === "razorpay" ? (
                        <span className="px-2 py-1 text-[9px] font-mono tracking-wider uppercase bg-blue-50 border border-blue-200 text-blue-700 font-bold">
                          Razorpay
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-[9px] font-mono tracking-wider uppercase bg-amber-50 border border-amber-200 text-amber-800 font-bold">
                          COD Cash
                        </span>
                      )}
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-ink text-sm">{t.customerName}</div>
                      <div className="text-xs text-olive-dark">{t.customerEmail}</div>
                    </td>

                    {/* Kitchen Branch */}
                    <td className="px-5 py-4">
                      <div className="text-xs text-olive-dark font-mono flex items-center gap-1">
                        <Store className="size-3 text-olive/60" />
                        {t.kitchenName}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4">
                      <div className="font-display text-lg text-ink font-bold">
                        ₹{t.amount.toLocaleString("en-IN")}
                      </div>
                      {t.refundAmount > 0 && (
                        <div className="text-[9px] font-mono text-red-600 font-bold">
                          Refunded: ₹{t.refundAmount}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {t.status === "captured" && (
                        <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-lime/40 text-lime-deep bg-lime/10 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="size-3" /> Captured
                        </span>
                      )}
                      {t.status === "authorized" && (
                        <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-amber-300 text-amber-700 bg-amber-50 flex items-center gap-1 w-fit">
                          <Clock className="size-3" /> Authorized
                        </span>
                      )}
                      {t.status === "pending" && (
                        <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-blue-200 text-blue-700 bg-blue-50 flex items-center gap-1 w-fit">
                          <RefreshCw className="size-3 animate-spin" /> Pending
                        </span>
                      )}
                      {t.status === "failed" && (
                        <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-red-200 text-red-700 bg-red-50 flex items-center gap-1 w-fit">
                          <AlertCircle className="size-3" /> Failed
                        </span>
                      )}
                      {(t.status === "refunded" || t.status === "partially_refunded") && (
                        <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-purple-200 text-purple-700 bg-purple-50 flex items-center gap-1 w-fit">
                          <RotateCcw className="size-3" /> {t.status === "refunded" ? "Refunded" : "Partial Refund"}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {t.status === "authorized" && (
                          <button
                            onClick={() => handleMarkCaptured(t.id)}
                            disabled={statusUpdatingId === t.id}
                            className="px-2.5 py-1 bg-ink text-lime text-[10px] font-mono uppercase tracking-widest hover:bg-emerald transition disabled:opacity-30"
                          >
                            Capture
                          </button>
                        )}
                        {(t.status === "captured" || t.status === "authorized") && t.refundAmount < t.amount && (
                          <button
                            onClick={() => openRefundModal(t)}
                            className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 text-[10px] font-mono uppercase tracking-widest hover:bg-red-100 transition flex items-center gap-1"
                          >
                            <RotateCcw className="size-2.5" /> Refund
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

      {/* Refund Modal */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4">
          <div className="bg-cream border-2 border-ink w-full max-w-md">
            <div className="px-6 py-4 border-b-2 border-ink flex items-center justify-between">
              <div>
                <div className="text-[9px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-1">
                  Issue Refund · {refundTarget.transactionId}
                </div>
                <h3 className="font-display text-xl text-ink">
                  Refund Transaction: <span className="font-mono text-emerald">₹{refundTarget.amount}</span>
                </h3>
              </div>
              <button onClick={() => setRefundTarget(null)} className="text-olive hover:text-ink">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleRefundSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-[9px] font-mono tracking-widest uppercase text-olive mb-1">
                  Refund Amount (₹) *
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  max={refundTarget.amount - (refundTarget.refundAmount || 0)}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full h-11 px-4 bg-white border border-ink/20 focus:border-ink outline-none text-sm text-ink font-mono"
                />
                <span className="text-[10px] text-olive mt-1 block">
                  Max refundable: ₹{refundTarget.amount - (refundTarget.refundAmount || 0)}
                </span>
              </div>

              <div>
                <label className="block text-[9px] font-mono tracking-widest uppercase text-olive mb-1">
                  Reason for Refund *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Order cancelled by customer / Food quality issue"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full p-3 bg-white border border-ink/20 focus:border-ink outline-none text-sm text-ink resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 px-6 bg-red-600 text-white text-xs font-mono uppercase tracking-widest hover:bg-red-700 transition disabled:opacity-50"
                >
                  {loading ? "Processing…" : "Process Refund"}
                </button>
                <button
                  type="button"
                  onClick={() => setRefundTarget(null)}
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
