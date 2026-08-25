"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  Plus,
  Search,
  KeyRound,
  Trash2,
  Edit2,
  Store,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  createBranchManager,
  updateBranchManager,
  resetBranchManagerPassword,
  deleteBranchManager,
} from "@/actions/adminManagers";

interface Branch {
  id: string;
  name: string;
  code: string;
  area: string;
}

interface Manager {
  id: string;
  name: string;
  email: string;
  phone: string;
  branchId: string;
  branchName: string;
  branchCode: string;
  branchArea: string;
  createdAt: string;
  lastLogin: string;
}

interface Props {
  initialManagers: Manager[];
  branches: Branch[];
}

export default function BranchManagersClient({ initialManagers, branches }: Props) {
  const router = useRouter();
  const [managers, setManagers] = useState<Manager[]>(initialManagers || []);
  const [search, setSearch] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    branchId: branches[0]?.id || "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    branchId: "",
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const showNotification = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.branchId) {
      showNotification("error", "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    const res = await createBranchManager(formData);
    setLoading(false);

    if (res.success) {
      showNotification("success", `Branch manager account created for ${formData.email}`);
      setIsAddModalOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        branchId: branches[0]?.id || "",
      });
      router.refresh();
    } else {
      showNotification("error", res.error || "Failed to create manager account.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManager || !newPassword) return;

    setLoading(true);
    const res = await resetBranchManagerPassword(selectedManager.id, newPassword);
    setLoading(false);

    if (res.success) {
      showNotification("success", `Password reset successfully for ${selectedManager.name}`);
      setIsResetModalOpen(false);
      setNewPassword("");
      setSelectedManager(null);
    } else {
      showNotification("error", res.error || "Failed to reset password.");
    }
  };

  const handleEditManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManager) return;

    setLoading(true);
    const res = await updateBranchManager(selectedManager.id, editData);
    setLoading(false);

    if (res.success) {
      showNotification("success", `Details updated for ${selectedManager.name}`);
      setIsEditModalOpen(false);
      setSelectedManager(null);
      router.refresh();
    } else {
      showNotification("error", res.error || "Failed to update manager.");
    }
  };

  const handleDeleteManager = async (m: Manager) => {
    if (!window.confirm(`Are you sure you want to revoke access and delete manager ${m.name} (${m.email})?`)) {
      return;
    }

    setLoading(true);
    const res = await deleteBranchManager(m.id);
    setLoading(false);

    if (res.success) {
      showNotification("success", `Manager access deleted for ${m.name}`);
      setManagers((prev) => prev.filter((item) => item.id !== m.id));
      router.refresh();
    } else {
      showNotification("error", res.error || "Failed to delete manager.");
    }
  };

  const filteredManagers = managers.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.branchName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-[#064e3b] border-emerald-300"
              : "bg-rose-50 text-rose-800 border-rose-300"
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold">
            {feedback.type === "success" ? (
              <CheckCircle2 className="size-4 text-[#064e3b] shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-rose-700 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:bg-black/5 rounded-lg text-current"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Page Masthead */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e6e2d8] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#064e3b] uppercase font-bold">
            <ShieldCheck className="size-4 text-[#d4af37]" />
            <span>Multi-Tenant Access Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0d261e] tracking-tight mt-1">
            Branch Heads & Kitchen Managers
          </h1>
          <p className="text-xs text-[#52635c] mt-0.5 max-w-2xl">
            Create dedicated login credentials for each hotel/branch head. Branch managers are strictly
            isolated and can only see their own kitchen's live orders, menu stock, and revenue.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-[#064e3b] text-[#d4af37] font-bold text-xs uppercase tracking-wider hover:bg-[#0a5c46] transition flex items-center gap-2 shadow-md border border-[#d4af37]/30 self-start sm:self-center cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Add Branch Head</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#e6e2d8] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-[#52635c]">
              Total Branch Heads
            </span>
            <div className="text-3xl font-black text-[#0d261e] mt-1">{managers.length}</div>
            <p className="text-[11px] text-[#064e3b] font-semibold mt-0.5">Active login credentials</p>
          </div>
          <div className="size-12 rounded-2xl bg-emerald-50 text-[#064e3b] border border-emerald-200 grid place-items-center">
            <UserCheck className="size-6 text-[#064e3b]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#e6e2d8] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-[#52635c]">
              Cloud Kitchen Branches
            </span>
            <div className="text-3xl font-black text-[#0d261e] mt-1">{branches.length}</div>
            <p className="text-[11px] text-[#52635c] font-semibold mt-0.5">Available for assignment</p>
          </div>
          <div className="size-12 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 grid place-items-center">
            <Store className="size-6 text-[#d4af37]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#e6e2d8] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-[#52635c]">
              Privacy & Data Isolation
            </span>
            <div className="text-2xl font-black text-[#064e3b] mt-1">100% Enforced</div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              Zero cross-branch data access
            </p>
          </div>
          <div className="size-12 rounded-2xl bg-emerald-50 text-[#064e3b] border border-emerald-200 grid place-items-center">
            <Lock className="size-6 text-[#064e3b]" />
          </div>
        </div>
      </div>

      {/* Managers Table Container */}
      <div className="bg-white rounded-3xl border border-[#e6e2d8] shadow-2xs overflow-hidden">
        {/* Table Header & Search */}
        <div className="p-4 sm:p-5 border-b border-[#e6e2d8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fbf9f4]/40">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-[#0d261e] uppercase tracking-wider">
              Assigned Branch Heads ({filteredManagers.length})
            </h3>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="size-4 text-[#52635c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, branch..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-[#e6e2d8] text-xs font-semibold text-[#0d261e] placeholder:text-[#52635c] focus:outline-none focus:border-[#064e3b]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fbf9f4] border-b border-[#e6e2d8] text-[10px] font-black font-mono tracking-wider uppercase text-[#52635c]">
              <tr>
                <th className="px-5 py-3.5">Branch Manager</th>
                <th className="px-5 py-3.5">Login Email & Phone</th>
                <th className="px-5 py-3.5">Assigned Kitchen Branch</th>
                <th className="px-5 py-3.5">Last Login</th>
                <th className="px-5 py-3.5">Created</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e2d8]/60">
              {filteredManagers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#52635c] font-bold">
                    No branch managers found. Click "Add Branch Head" to create credentials.
                  </td>
                </tr>
              ) : (
                filteredManagers.map((m) => (
                  <tr key={m.id} className="hover:bg-[#fbf9f4]/50 transition">
                    {/* Manager Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-[#064e3b] text-[#d4af37] font-black text-xs grid place-items-center shrink-0">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-[#0d261e]">{m.name}</p>
                          <span className="text-[10px] font-bold text-[#52635c]">Branch Head</span>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-[#0d261e] flex items-center gap-1.5">
                        <Mail className="size-3 text-[#52635c]" />
                        <span>{m.email}</span>
                      </div>
                      {m.phone && m.phone !== "-" && (
                        <div className="text-[11px] text-[#52635c] flex items-center gap-1.5 mt-0.5 font-mono">
                          <Phone className="size-3 text-[#52635c]" />
                          <span>{m.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Assigned Branch */}
                    <td className="px-5 py-3.5">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                        <Store className="size-3.5 text-[#064e3b]" />
                        <div>
                          <p className="text-xs font-black text-[#064e3b] leading-tight">
                            {m.branchName}
                          </p>
                          <p className="text-[10px] text-[#52635c] font-semibold">{m.branchArea}</p>
                        </div>
                      </div>
                    </td>

                    {/* Last Login */}
                    <td className="px-5 py-3.5 font-mono text-xs text-[#52635c]">
                      {m.lastLogin}
                    </td>

                    {/* Created */}
                    <td className="px-5 py-3.5 font-mono text-xs text-[#52635c]">
                      {m.createdAt}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit / Reassign */}
                        <button
                          onClick={() => {
                            setSelectedManager(m);
                            setEditData({
                              name: m.name,
                              phone: m.phone === "-" ? "" : m.phone,
                              branchId: m.branchId,
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#064e3b] hover:bg-emerald-50 transition cursor-pointer"
                          title="Edit Details & Reassign Branch"
                        >
                          <Edit2 className="size-4" />
                        </button>

                        {/* Reset Password */}
                        <button
                          onClick={() => {
                            setSelectedManager(m);
                            setNewPassword("");
                            setIsResetModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-amber-700 hover:bg-amber-50 transition cursor-pointer"
                          title="Reset Login Password"
                        >
                          <KeyRound className="size-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteManager(m)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete / Revoke Credentials"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD BRANCH MANAGER */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-[#e6e2d8] space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#e6e2d8] pb-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-emerald-50 text-[#064e3b] border border-emerald-200 grid place-items-center">
                  <UserCheck className="size-4 text-[#064e3b]" />
                </div>
                <h3 className="text-base font-black text-[#0d261e]">Add New Branch Head</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManager} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0d261e] mb-1">
                  Manager Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Patil"
                  className="w-full h-11 px-4 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs font-semibold text-[#0d261e] focus:outline-none focus:border-[#064e3b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d261e] mb-1">
                  Login Email Address <span className="text-rose-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. rahul.chinchwad@malashree.in"
                  className="w-full h-11 px-4 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs font-semibold text-[#0d261e] focus:outline-none focus:border-[#064e3b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d261e] mb-1">
                  Login Password <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="w-full h-11 pl-4 pr-10 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs font-semibold text-[#0d261e] focus:outline-none focus:border-[#064e3b]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d261e] mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full h-11 px-4 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs font-semibold text-[#0d261e] focus:outline-none focus:border-[#064e3b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d261e] mb-1">
                  Assigned Branch / Cloud Kitchen <span className="text-rose-600">*</span>
                </label>
                <select
                  required
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs font-bold text-[#0d261e] focus:outline-none focus:border-[#064e3b] cursor-pointer"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.area})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#52635c] mt-1">
                  This manager will strictly only have access to this selected branch.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-[#e6e2d8] text-xs font-bold text-[#52635c] hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-[#064e3b] text-[#d4af37] text-xs font-bold hover:bg-[#0a5c46] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md border border-[#d4af37]/30"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                  <span>Create Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RESET PASSWORD */}
      {/* ========================================================================= */}
      {isResetModalOpen && selectedManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-[#e6e2d8] space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#e6e2d8] pb-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 grid place-items-center">
                  <KeyRound className="size-4 text-amber-800" />
                </div>
                <h3 className="text-base font-black text-[#0d261e]">Reset Manager Password</h3>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="text-xs text-[#52635c]">
              Enter a new password for <b>{selectedManager.name}</b> ({selectedManager.email}).
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0d261e] mb-1">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full h-11 pl-4 pr-10 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs font-semibold text-[#0d261e] focus:outline-none focus:border-[#064e3b]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-[#e6e2d8] text-xs font-bold text-[#52635c] hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-[#064e3b] text-[#d4af37] text-xs font-bold hover:bg-[#0a5c46] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <KeyRound className="size-4" />
                  )}
                  <span>Save New Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT MANAGER & REASSIGN BRANCH */}
      {/* ========================================================================= */}
      {isEditModalOpen && selectedManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-[#e6e2d8] space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#e6e2d8] pb-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-emerald-50 text-[#064e3b] border border-emerald-200 grid place-items-center">
                  <Edit2 className="size-4 text-[#064e3b]" />
                </div>
                <h3 className="text-base font-black text-[#0d261e]">Edit Manager Details</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleEditManager} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0d261e] mb-1">
                  Manager Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs font-semibold text-[#0d261e] focus:outline-none focus:border-[#064e3b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d261e] mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs font-semibold text-[#0d261e] focus:outline-none focus:border-[#064e3b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d261e] mb-1">
                  Assigned Kitchen Branch
                </label>
                <select
                  value={editData.branchId}
                  onChange={(e) => setEditData({ ...editData, branchId: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs font-bold text-[#0d261e] focus:outline-none focus:border-[#064e3b] cursor-pointer"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.area})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-[#e6e2d8] text-xs font-bold text-[#52635c] hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-[#064e3b] text-[#d4af37] text-xs font-bold hover:bg-[#0a5c46] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Edit2 className="size-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
