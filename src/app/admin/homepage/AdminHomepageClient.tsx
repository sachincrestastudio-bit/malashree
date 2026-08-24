"use client";

import { useState } from "react";
import {
  Sparkles,
  Layers,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  Tag,
  ShieldCheck,
  Megaphone,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import {
  updateHomepagePromoCards,
  updateHomepageCategories,
  updateHomepageAnnouncementAndSafety,
} from "@/actions/adminHomepage";

interface AdminHomepageClientProps {
  initialContent: any;
}

export default function AdminHomepageClient({ initialContent }: AdminHomepageClientProps) {
  const [activeTab, setActiveTab] = useState<"promo" | "categories" | "announcement">("promo");

  // State
  const [promoCards, setPromoCards] = useState<any[]>(initialContent.promoCards || []);
  const [foodCategories, setFoodCategories] = useState<any[]>(
    initialContent.foodCategories || []
  );
  const [announcementBanner, setAnnouncementBanner] = useState<any>(
    initialContent.announcementBanner || { text: "", link: "", isActive: true }
  );
  const [safetyHighlight, setSafetyHighlight] = useState<any>(
    initialContent.safetyHighlight || {
      headline: "1,40,000 +",
      subtitle: "valets vaccinated!",
      modalTitle: "MAX Safety & Vaccination",
      modalDescription: "1,40,000+ Delivery Partners Vaccinated Across India!",
      points: [],
      isActive: true,
    }
  );

  // Status message
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // New Category State
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState("");

  const showToast = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // 1. Save Promo Cards
  const handleSavePromoCards = async () => {
    setSaving(true);
    const res = await updateHomepagePromoCards(promoCards);
    setSaving(false);
    if (res.success) {
      showToast("success", "Homepage promotional cards updated successfully!");
    } else {
      showToast("error", res.error || "Failed to update promotional cards.");
    }
  };

  // 2. Save Food Categories
  const handleSaveCategories = async () => {
    setSaving(true);
    const res = await updateHomepageCategories(foodCategories);
    setSaving(false);
    if (res.success) {
      showToast("success", "Food categories updated successfully!");
    } else {
      showToast("error", res.error || "Failed to update food categories.");
    }
  };

  // 3. Save Announcement & Safety
  const handleSaveAnnouncementAndSafety = async () => {
    setSaving(true);
    const res = await updateHomepageAnnouncementAndSafety({
      announcementBanner,
      safetyHighlight,
    });
    setSaving(false);
    if (res.success) {
      showToast("success", "Announcement banner and safety highlight updated!");
    } else {
      showToast("error", res.error || "Failed to update settings.");
    }
  };

  // Category handlers
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat = {
      id: `cat_${Date.now()}`,
      name: newCatName.trim(),
      image:
        newCatImage.trim() ||
        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80",
      isActive: true,
      order: foodCategories.length + 1,
    };
    setFoodCategories([...foodCategories, newCat]);
    setNewCatName("");
    setNewCatImage("");
  };

  const handleDeleteCategory = (id: string) => {
    setFoodCategories(foodCategories.filter((c) => c.id !== id));
  };

  const handleToggleCategory = (id: string) => {
    setFoodCategories(
      foodCategories.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-lime">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-lime-deep uppercase">
            <Sparkles className="size-4 text-lime" />
            <span>Homepage Content Manager</span>
          </div>
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="text-3xl md:text-4xl text-ink font-bold mt-1"
          >
            Live Homepage <span className="italic text-emerald">Control Hub</span>
          </h1>
          <p className="text-xs text-olive-dark mt-1 font-mono">
            Control promo cards, food category circles, banners, and safety modals in real time.
          </p>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-lime border border-lime/40 rounded-xl text-xs font-mono font-bold tracking-wider hover:bg-ink/90 transition shadow-xs self-start"
        >
          <span>View Live Homepage</span>
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      {/* Toast Notification */}
      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-sm ${
            statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-300"
              : "bg-rose-50 text-rose-900 border-rose-300"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="size-4 text-emerald-700 shrink-0" />
          ) : (
            <AlertCircle className="size-4 text-rose-700 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setActiveTab("promo")}
          className={`px-4 py-2.5 text-xs font-bold font-mono tracking-wider border-b-2 uppercase transition whitespace-nowrap cursor-pointer ${
            activeTab === "promo"
              ? "border-[#064e3b] text-[#064e3b] font-black bg-white/50"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          1. Promo Cards ({promoCards.length})
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2.5 text-xs font-bold font-mono tracking-wider border-b-2 uppercase transition whitespace-nowrap cursor-pointer ${
            activeTab === "categories"
              ? "border-[#064e3b] text-[#064e3b] font-black bg-white/50"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          2. Category Circles ({foodCategories.length})
        </button>

        <button
          onClick={() => setActiveTab("announcement")}
          className={`px-4 py-2.5 text-xs font-bold font-mono tracking-wider border-b-2 uppercase transition whitespace-nowrap cursor-pointer ${
            activeTab === "announcement"
              ? "border-[#064e3b] text-[#064e3b] font-black bg-white/50"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          3. Ticker & Safety
        </button>
      </div>

      {/* TAB 1: 2x2 PROMO CARDS */}
      {activeTab === "promo" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-gray-900">
                  Homepage 2x2 Promotional Cards
                </h3>
                <p className="text-xs text-gray-500">
                  These 4 cards are displayed immediately below the search bar on the Homepage.
                </p>
              </div>

              <button
                onClick={handleSavePromoCards}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#064e3b] text-yellow-300 font-bold text-xs hover:bg-[#085f46] transition flex items-center gap-1.5 shadow-xs disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    <span>Save All Cards</span>
                  </>
                )}
              </button>
            </div>

            {/* Cards Grid Editor */}
            <div className="grid md:grid-cols-2 gap-4 pt-2">
              {promoCards.map((card, idx) => (
                <div
                  key={card.id || idx}
                  className="p-4 rounded-2xl border border-gray-200 bg-[#fbfcfb] space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-xs font-black uppercase text-[#064e3b]">
                      Card {idx + 1}: {card.type}
                    </span>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={card.isActive !== false}
                        onChange={(e) => {
                          const updated = [...promoCards];
                          updated[idx].isActive = e.target.checked;
                          setPromoCards(updated);
                        }}
                        className="rounded accent-[#064e3b]"
                      />
                      <span>Active</span>
                    </label>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">
                        Main Title
                      </label>
                      <input
                        type="text"
                        value={card.title || ""}
                        onChange={(e) => {
                          const updated = [...promoCards];
                          updated[idx].title = e.target.value;
                          setPromoCards(updated);
                        }}
                        placeholder="e.g. 60% OFF / Burger Specials"
                        className="w-full h-8 px-2.5 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#064e3b]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">
                        Subtitle / Tagline
                      </label>
                      <input
                        type="text"
                        value={card.subtitle || ""}
                        onChange={(e) => {
                          const updated = [...promoCards];
                          updated[idx].subtitle = e.target.value;
                          setPromoCards(updated);
                        }}
                        placeholder="e.g. EVERYTHING AT / UP TO"
                        className="w-full h-8 px-2.5 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#064e3b]"
                      />
                    </div>
                  </div>

                  {/* Badge Text & Price / Code */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        value={card.badgeText || ""}
                        onChange={(e) => {
                          const updated = [...promoCards];
                          updated[idx].badgeText = e.target.value;
                          setPromoCards(updated);
                        }}
                        placeholder="e.g. DEAL OF THE DAY / CODE"
                        className="w-full h-8 px-2.5 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#064e3b]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">
                        {card.code !== undefined ? "Promo Code" : "Price Text"}
                      </label>
                      <input
                        type="text"
                        value={card.code !== undefined ? card.code : card.priceText || ""}
                        onChange={(e) => {
                          const updated = [...promoCards];
                          if (card.code !== undefined) {
                            updated[idx].code = e.target.value;
                          } else {
                            updated[idx].priceText = e.target.value;
                          }
                          setPromoCards(updated);
                        }}
                        placeholder="e.g. ROYAL60 or ₹129 only"
                        className="w-full h-8 px-2.5 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#064e3b]"
                      />
                    </div>
                  </div>

                  {/* Target Action */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">
                        Click Action Type
                      </label>
                      <select
                        value={card.targetType || "category"}
                        onChange={(e) => {
                          const updated = [...promoCards];
                          updated[idx].targetType = e.target.value;
                          setPromoCards(updated);
                        }}
                        className="w-full h-8 px-2 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#064e3b]"
                      >
                        <option value="category">Category Filter</option>
                        <option value="search">Search Keyword</option>
                        <option value="modal">Open Modal</option>
                        <option value="link">Page Link</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">
                        Target Value
                      </label>
                      <input
                        type="text"
                        value={card.targetValue || ""}
                        onChange={(e) => {
                          const updated = [...promoCards];
                          updated[idx].targetValue = e.target.value;
                          setPromoCards(updated);
                        }}
                        placeholder="e.g. Burger / Biryani / /menu"
                        className="w-full h-8 px-2.5 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#064e3b]"
                      />
                    </div>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={card.imageUrl || ""}
                      onChange={(e) => {
                        const updated = [...promoCards];
                        updated[idx].imageUrl = e.target.value;
                        setPromoCards(updated);
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full h-8 px-2.5 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#064e3b]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FOOD CATEGORY CIRCLES */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-gray-900">
                  "Eat what makes you happy" Circular Categories
                </h3>
                <p className="text-xs text-gray-500">
                  Manage the circular dish categories shown in the 2x4 grid on the Homepage.
                </p>
              </div>

              <button
                onClick={handleSaveCategories}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#064e3b] text-yellow-300 font-bold text-xs hover:bg-[#085f46] transition flex items-center gap-1.5 shadow-xs disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    <span>Save Categories</span>
                  </>
                )}
              </button>
            </div>

            {/* Add New Category Box */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 w-full">
                <label className="text-xs font-bold text-[#064e3b] block mb-1">
                  New Category Name
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. South Indian / Chaat"
                  className="w-full h-9 px-3 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#064e3b]"
                />
              </div>

              <div className="flex-1 w-full">
                <label className="text-xs font-bold text-[#064e3b] block mb-1">Image URL</label>
                <input
                  type="text"
                  value={newCatImage}
                  onChange={(e) => setNewCatImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-9 px-3 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#064e3b]"
                />
              </div>

              <button
                onClick={handleAddCategory}
                className="h-9 px-4 rounded-lg bg-[#064e3b] text-yellow-300 font-bold text-xs hover:bg-[#085f46] transition flex items-center gap-1 shrink-0"
              >
                <Plus className="size-4" />
                <span>Add Category</span>
              </button>
            </div>

            {/* Existing Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {foodCategories.map((cat, idx) => (
                <div
                  key={cat.id || idx}
                  className="p-3 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="size-12 rounded-full object-cover border-2 border-yellow-400 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <input
                        type="text"
                        value={cat.name}
                        onChange={(e) => {
                          const updated = [...foodCategories];
                          updated[idx].name = e.target.value;
                          setFoodCategories(updated);
                        }}
                        className="w-full font-bold text-xs text-gray-900 border-b border-transparent focus:border-[#064e3b] focus:outline-none truncate"
                      />
                      <input
                        type="text"
                        value={cat.image}
                        onChange={(e) => {
                          const updated = [...foodCategories];
                          updated[idx].image = e.target.value;
                          setFoodCategories(updated);
                        }}
                        placeholder="Image URL"
                        className="w-full text-[10px] text-gray-400 border-b border-transparent focus:border-[#064e3b] focus:outline-none truncate mt-0.5"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                    <button
                      onClick={() => handleToggleCategory(cat.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cat.isActive !== false
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {cat.isActive !== false ? "Active" : "Hidden"}
                    </button>

                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-gray-400 hover:text-rose-600 p-1"
                      title="Delete Category"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TICKER & SAFETY MODAL */}
      {activeTab === "announcement" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-gray-900">
                  Announcement Ticker & Safety Modal
                </h3>
                <p className="text-xs text-gray-500">
                  Edit top announcements and the "1,40,000+ Valets Vaccinated" safety modal.
                </p>
              </div>

              <button
                onClick={handleSaveAnnouncementAndSafety}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#064e3b] text-yellow-300 font-bold text-xs hover:bg-[#085f46] transition flex items-center gap-1.5 shadow-xs disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    <span>Save Ticker & Safety</span>
                  </>
                )}
              </button>
            </div>

            {/* Announcement Ticker Form */}
            <div className="p-4 rounded-xl border border-gray-200 bg-[#fbfcfb] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="text-xs font-black uppercase text-[#064e3b] flex items-center gap-1.5">
                  <Megaphone className="size-4" /> Top Announcement Ticker
                </span>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementBanner.isActive !== false}
                    onChange={(e) =>
                      setAnnouncementBanner({
                        ...announcementBanner,
                        isActive: e.target.checked,
                      })
                    }
                    className="rounded accent-[#064e3b]"
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">
                    Announcement Text
                  </label>
                  <input
                    type="text"
                    value={announcementBanner.text || ""}
                    onChange={(e) =>
                      setAnnouncementBanner({
                        ...announcementBanner,
                        text: e.target.value,
                      })
                    }
                    placeholder="🔥 Flat 60% OFF on your first 3 orders · Code: ROYAL60"
                    className="w-full h-9 px-3 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#064e3b]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">
                    Target Route Link
                  </label>
                  <input
                    type="text"
                    value={announcementBanner.link || ""}
                    onChange={(e) =>
                      setAnnouncementBanner({
                        ...announcementBanner,
                        link: e.target.value,
                      })
                    }
                    placeholder="/menu"
                    className="w-full h-9 px-3 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#064e3b]"
                  />
                </div>
              </div>
            </div>

            {/* Safety & Vaccination Modal Form */}
            <div className="p-4 rounded-xl border border-gray-200 bg-[#fbfcfb] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="text-xs font-black uppercase text-[#064e3b] flex items-center gap-1.5">
                  <ShieldCheck className="size-4" /> MAX Safety & Vaccination Content
                </span>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyHighlight.isActive !== false}
                    onChange={(e) =>
                      setSafetyHighlight({
                        ...safetyHighlight,
                        isActive: e.target.checked,
                      })
                    }
                    className="rounded accent-[#064e3b]"
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">
                    Card Headline
                  </label>
                  <input
                    type="text"
                    value={safetyHighlight.headline || ""}
                    onChange={(e) =>
                      setSafetyHighlight({
                        ...safetyHighlight,
                        headline: e.target.value,
                      })
                    }
                    placeholder="1,40,000 +"
                    className="w-full h-9 px-3 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#064e3b]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">
                    Card Subtitle
                  </label>
                  <input
                    type="text"
                    value={safetyHighlight.subtitle || ""}
                    onChange={(e) =>
                      setSafetyHighlight({
                        ...safetyHighlight,
                        subtitle: e.target.value,
                      })
                    }
                    placeholder="valets vaccinated!"
                    className="w-full h-9 px-3 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#064e3b]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">
                  Modal Description Heading
                </label>
                <input
                  type="text"
                  value={safetyHighlight.modalDescription || ""}
                  onChange={(e) =>
                    setSafetyHighlight({
                      ...safetyHighlight,
                      modalDescription: e.target.value,
                    })
                  }
                  placeholder="1,40,000+ Delivery Partners Vaccinated Across India!"
                  className="w-full h-9 px-3 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#064e3b]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
