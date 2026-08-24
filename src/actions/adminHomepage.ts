"use server";

import { connectToDatabase } from "@/database/mongoose";
import { HomepageContent } from "@/models/HomepageContent";
import { getCurrentUser } from "@/actions/user";
import { revalidatePath } from "next/cache";

const DEFAULT_PROMO_CARDS = [
  {
    id: "card_1",
    type: "hero_offer",
    title: "60% OFF",
    subtitle: "with complimentary delivery",
    badgeText: "CODE: ROYAL60",
    code: "ROYAL60",
    priceText: "",
    imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=80",
    targetType: "link",
    targetValue: "/menu",
    isActive: true,
    order: 1,
  },
  {
    id: "card_2",
    type: "deal_1",
    title: "Burger Specials",
    subtitle: "EVERYTHING AT",
    badgeText: "DEAL OF THE DAY",
    code: "",
    priceText: "₹129 only",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80",
    targetType: "category",
    targetValue: "Burger",
    isActive: true,
    order: 2,
  },
  {
    id: "card_3",
    type: "deal_2",
    title: "Royal Biryani",
    subtitle: "BIRYANIS FROM",
    badgeText: "DEAL OF THE DAY",
    code: "",
    priceText: "₹169 only",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80",
    targetType: "search",
    targetValue: "Biryani",
    isActive: true,
    order: 3,
  },
  {
    id: "card_4",
    type: "safety",
    title: "1,40,000 +",
    subtitle: "valets vaccinated!",
    badgeText: "MAX SAFETY",
    code: "",
    priceText: "",
    imageUrl: "",
    targetType: "modal",
    targetValue: "safety",
    isActive: true,
    order: 4,
  },
];

const DEFAULT_FOOD_CATEGORIES = [
  {
    id: "cat_1",
    name: "Biryani",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=200&q=80",
    isActive: true,
    order: 1,
  },
  {
    id: "cat_2",
    name: "Thali",
    image: "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?auto=format&fit=crop&w=200&q=80",
    isActive: true,
    order: 2,
  },
  {
    id: "cat_3",
    name: "Paneer",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=200&q=80",
    isActive: true,
    order: 3,
  },
  {
    id: "cat_4",
    name: "North Indian",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=200&q=80",
    isActive: true,
    order: 4,
  },
  {
    id: "cat_5",
    name: "Burger",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80",
    isActive: true,
    order: 5,
  },
  {
    id: "cat_6",
    name: "Pizza",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80",
    isActive: true,
    order: 6,
  },
  {
    id: "cat_7",
    name: "Rolls",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=200&q=80",
    isActive: true,
    order: 7,
  },
  {
    id: "cat_8",
    name: "Desserts",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=200&q=80",
    isActive: true,
    order: 8,
  },
];

/**
 * Retrieves the dynamic Homepage Content, seeding default document if none exists.
 */
export async function getHomepageContent() {
  try {
    await connectToDatabase();
    let content = await HomepageContent.findOne().lean();

    if (!content) {
      const created = await HomepageContent.create({
        announcementBanner: {
          text: "🔥 Flat 60% OFF on your first 3 orders · Code: ROYAL60",
          link: "/menu",
          isActive: true,
        },
        promoCards: DEFAULT_PROMO_CARDS,
        foodCategories: DEFAULT_FOOD_CATEGORIES,
        safetyHighlight: {
          headline: "1,40,000 +",
          subtitle: "valets vaccinated!",
          modalTitle: "MAX Safety & Vaccination",
          modalDescription: "1,40,000+ Delivery Partners Vaccinated Across India!",
          points: [
            "Daily temperature checks and sanitized kitchen gear.",
            "Tamper-evident food packaging seals on every order.",
            "100% contactless doorstep delivery option available.",
          ],
          isActive: true,
        },
      });
      content = created.toObject();
    }

    return JSON.parse(JSON.stringify(content));
  } catch (error) {
    console.error("getHomepageContent error:", error);
    return {
      promoCards: DEFAULT_PROMO_CARDS,
      foodCategories: DEFAULT_FOOD_CATEGORIES,
      announcementBanner: {
        text: "🔥 Flat 60% OFF on your first 3 orders · Code: ROYAL60",
        link: "/menu",
        isActive: true,
      },
      safetyHighlight: {
        headline: "1,40,000 +",
        subtitle: "valets vaccinated!",
        modalTitle: "MAX Safety & Vaccination",
        modalDescription: "1,40,000+ Delivery Partners Vaccinated Across India!",
        points: [
          "Daily temperature checks and sanitized kitchen gear.",
          "Tamper-evident food packaging seals on every order.",
          "100% contactless doorstep delivery option available.",
        ],
        isActive: true,
      },
    };
  }
}

/**
 * Update Promo Cards (Admin Only)
 */
export async function updateHomepagePromoCards(promoCards: any[]) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    await connectToDatabase();
    let doc = await HomepageContent.findOne();
    if (!doc) {
      doc = new HomepageContent();
    }

    doc.promoCards = promoCards;
    await doc.save();

    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { success: true };
  } catch (error: any) {
    console.error("updateHomepagePromoCards error:", error);
    return { success: false, error: error.message || "Failed to update promo cards" };
  }
}

/**
 * Update Food Categories (Admin Only)
 */
export async function updateHomepageCategories(foodCategories: any[]) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    await connectToDatabase();
    let doc = await HomepageContent.findOne();
    if (!doc) {
      doc = new HomepageContent();
    }

    doc.foodCategories = foodCategories;
    await doc.save();

    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { success: true };
  } catch (error: any) {
    console.error("updateHomepageCategories error:", error);
    return { success: false, error: error.message || "Failed to update food categories" };
  }
}

/**
 * Update Announcement & Safety (Admin Only)
 */
export async function updateHomepageAnnouncementAndSafety({
  announcementBanner,
  safetyHighlight,
}: {
  announcementBanner?: any;
  safetyHighlight?: any;
}) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    await connectToDatabase();
    let doc = await HomepageContent.findOne();
    if (!doc) {
      doc = new HomepageContent();
    }

    if (announcementBanner) doc.announcementBanner = announcementBanner;
    if (safetyHighlight) doc.safetyHighlight = safetyHighlight;

    await doc.save();

    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { success: true };
  } catch (error: any) {
    console.error("updateHomepageAnnouncementAndSafety error:", error);
    return { success: false, error: error.message || "Failed to update announcement & safety" };
  }
}
