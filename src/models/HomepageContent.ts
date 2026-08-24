import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const PromoCardSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ["hero_offer", "deal_1", "deal_2", "safety"], required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    badgeText: { type: String },
    code: { type: String },
    priceText: { type: String },
    imageUrl: { type: String },
    targetType: { type: String, enum: ["category", "search", "modal", "link"], default: "category" },
    targetValue: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const FoodCategorySchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const HomepageContentSchema = new Schema(
  {
    announcementBanner: {
      text: { type: String, default: "🔥 Flat 60% OFF on your first 3 orders · Code: ROYAL60" },
      link: { type: String, default: "/menu" },
      isActive: { type: Boolean, default: true },
    },
    promoCards: [PromoCardSchema],
    foodCategories: [FoodCategorySchema],
    safetyHighlight: {
      headline: { type: String, default: "1,40,000 +" },
      subtitle: { type: String, default: "valets vaccinated!" },
      modalTitle: { type: String, default: "MAX Safety & Vaccination" },
      modalDescription: {
        type: String,
        default: "1,40,000+ Delivery Partners Vaccinated Across India!",
      },
      points: [
        { type: String, default: "Daily temperature checks and sanitized kitchen gear." },
        { type: String, default: "Tamper-evident food packaging seals on every order." },
        { type: String, default: "100% contactless doorstep delivery option available." },
      ],
      isActive: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const HomepageContent =
  models.HomepageContent || model("HomepageContent", HomepageContentSchema);
