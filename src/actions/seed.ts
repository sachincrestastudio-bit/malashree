"use server";

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/database/mongoose";
import { Kitchen } from "@/models/Kitchen";
import { Category } from "@/models/Category";
import { MenuItem } from "@/models/MenuItem";
import { Coupon } from "@/models/Coupon";
import { HomepageContent } from "@/models/HomepageContent";
import { User } from "@/models/User";

export const seedDatabase = async () => {
  try {
    await connectToDatabase();

    // 1. EXACT 6 KITCHEN BRANCHES SPECIFIED BY USER
    const kitchensData = [
      {
        code: "pimple-saudagar",
        name: "Malashree Pimple Saudagar Kitchen",
        address: "Kunal Icon Road, Shivar Chowk, Pimple Saudagar, Pune",
        area: "Pimple Saudagar",
        location: { type: "Point", coordinates: [73.7978578, 18.5989276] },
        deliveryRadius: 10000,
        preparationTime: 20,
        status: "active",
      },
      {
        code: "sangvi",
        name: "Malashree Sangvi Kitchen",
        address: "Old Sangvi Main Road, Near PWD Ground, Sangvi, Pune",
        area: "Sangvi",
        location: { type: "Point", coordinates: [73.8174781, 18.5814833] },
        deliveryRadius: 10000,
        preparationTime: 20,
        status: "active",
      },
      {
        code: "aundh",
        name: "Malashree Aundh Kitchen",
        address: "DP Road, Near Medipoint Hospital, Aundh, Pune",
        area: "Aundh",
        location: { type: "Point", coordinates: [73.8075, 18.5580] },
        deliveryRadius: 10000,
        preparationTime: 22,
        status: "active",
      },
      {
        code: "chinchwad-station",
        name: "Malashree Chinchwad Station Kitchen",
        address: "Near Elpro City Square / Station Road, Chinchwad, Pune",
        area: "Chinchwad Station",
        location: { type: "Point", coordinates: [73.7997, 18.6275] },
        deliveryRadius: 10000,
        preparationTime: 25,
        status: "active",
      },
      {
        code: "chinchwad-gaon",
        name: "Malashree Chinchwad Gaon Kitchen",
        address: "Thergaon Link Road, Chinchwad Gaon, Pune",
        area: "Chinchwad Gaon",
        location: { type: "Point", coordinates: [73.7850, 18.6350] },
        deliveryRadius: 10000,
        preparationTime: 25,
        status: "active",
      },
      {
        code: "kalewadi",
        name: "Malashree Kalewadi Kitchen",
        address: "Kalewadi Main Road, Near Vijayanagar, Kalewadi, Pune",
        area: "Kalewadi",
        location: { type: "Point", coordinates: [73.7890, 18.6080] },
        deliveryRadius: 10000,
        preparationTime: 20,
        status: "active",
      },
    ];

    // Clear old kitchens and insert the 6 branches
    await Kitchen.deleteMany({});
    const createdKitchens: any[] = [];
    for (const k of kitchensData) {
      const doc = await Kitchen.create(k);
      createdKitchens.push(doc);
    }

    // 2. CATEGORIES
    const categoriesData = [
      { name: "Main Course", description: "Rich North Indian gravies & cottage cheese delights" },
      { name: "Biryani & Pulao", description: "Aromatic basmati rice cooked with whole royal spices" },
      { name: "Breads & Naan", description: "Fresh from the tandoor clay oven" },
      { name: "Starters & Snacks", description: "Crispy tandoori kebabs & appetizers" },
      { name: "Dal & Curries", description: "Slow-cooked lentils & home-style curries" },
      { name: "Royal Thalis", description: "Complete grand meals with sweets, breads & curries" },
      { name: "Desserts & Beverages", description: "Authentic Indian sweets & refreshing drinks" },
    ];

    const categoryMap = new Map<string, string>();
    for (const cat of categoriesData) {
      const doc = await Category.findOneAndUpdate(
        { name: cat.name },
        { ...cat, deletedAt: null, isGlobal: true },
        { upsert: true, new: true }
      );
      categoryMap.set(cat.name, doc._id.toString());
    }

    // 3. MASTER MENU ITEMS (Equipped with branch pricing for all 6 branches)
    const dishesData = [
      {
        name: "Paneer Butter Masala",
        description: "Fresh cottage cheese cubes cooked in rich, velvety tomato and cashew butter gravy.",
        price: 280,
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.9,
        tag: "Bestseller",
      },
      {
        name: "Kadhai Paneer Special",
        description: "Cottage cheese tossed with crunchy bell peppers, onions, and freshly ground kadhai spices.",
        price: 290,
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.8,
        tag: "Chef Special",
      },
      {
        name: "Malai Kofta Deluxe",
        description: "Melt-in-mouth cottage cheese and potato dumplings simmered in rich saffron cashew gravy.",
        price: 310,
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.9,
        tag: "Must Try",
      },
      {
        name: "Dal Makhani (Slow Cooked 18h)",
        description: "Black lentils simmered overnight over slow charcoal with white butter and cream.",
        price: 240,
        category: "Dal & Curries",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.9,
        tag: "Bestseller",
      },
      {
        name: "Dal Tadka (Double Tadka)",
        description: "Yellow lentils tempered with ghee, cumin seeds, garlic, and dry Kashmiri red chillies.",
        price: 190,
        category: "Dal & Curries",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.7,
      },
      {
        name: "Malashree Special Dum Biryani",
        description: "Layered royal basmati rice, marinated vegetables, saffron milk, served with burani raita.",
        price: 280,
        category: "Biryani & Pulao",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.9,
        tag: "Bestseller",
      },
      {
        name: "Hyderabadi Paneer Dum Biryani",
        description: "Spiced chargrilled paneer layered with fragrant mint, fried onions, and aged basmati rice.",
        price: 295,
        category: "Biryani & Pulao",
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.8,
        tag: "Chef Special",
      },
      {
        name: "Royal Jeera Rice",
        description: "Fluffy aged basmati rice tempered with roasted cumin seeds and fresh desi ghee.",
        price: 160,
        category: "Biryani & Pulao",
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.7,
      },
      {
        name: "Butter Naan",
        description: "Classic soft leavened flatbread baked in tandoor and brushed generously with butter.",
        price: 55,
        category: "Breads & Naan",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.9,
      },
      {
        name: "Garlic Butter Naan",
        description: "Tandoori naan topped with roasted garlic bits, coriander, and white butter.",
        price: 75,
        category: "Breads & Naan",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.9,
        tag: "Top Choice",
      },
      {
        name: "Tandoori Roti (Butter)",
        description: "Whole wheat traditional tandoori roti brushed with fresh butter.",
        price: 30,
        category: "Breads & Naan",
        image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.8,
      },
      {
        name: "Tandoori Paneer Tikka (6 pcs)",
        description: "Juicy paneer cubes marinated in spiced hung curd and charbroiled in clay oven.",
        price: 260,
        category: "Starters & Snacks",
        image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.9,
        tag: "Bestseller",
      },
      {
        name: "Hara Bhara Kebab (6 pcs)",
        description: "Crispy pan-fried patties made with spinach, green peas, paneer, and aromatic herbs.",
        price: 220,
        category: "Starters & Snacks",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.7,
      },
      {
        name: "Crispy Veg Spring Rolls",
        description: "Golden fried crispy rolls stuffed with julienned vegetables and sweet chilli dip.",
        price: 190,
        category: "Starters & Snacks",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.6,
      },
      {
        name: "Malashree Royal Maharaja Thali",
        description: "Grand meal with Paneer Gravy, Dal Makhani, Veg Sabzi, 2 Butter Naans, Jeera Rice, Gulab Jamun, Papad & Salad.",
        price: 349,
        category: "Royal Thalis",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.9,
        tag: "Best Value",
      },
      {
        name: "Executive Mini Thali",
        description: "Paneer Butter Masala, Dal Tadka, 2 Rotis, Rice, Salad & Pickle.",
        price: 219,
        category: "Royal Thalis",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.8,
      },
      {
        name: "Warm Gulab Jamun (2 pcs)",
        description: "Golden fried milk solids soaked in cardamom and saffron sugar syrup.",
        price: 90,
        category: "Desserts & Beverages",
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.9,
      },
      {
        name: "Royal Kesari Sweet Lassi",
        description: "Thick chilled Punjabi yogurt lassi topped with saffron, cardamom, and sliced almonds.",
        price: 80,
        category: "Desserts & Beverages",
        image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.9,
        tag: "Chilled",
      },
      {
        name: "Alphonso Mango Lassi",
        description: "Blended with authentic Ratnagiri Alphonso mango pulp and thick creamy curd.",
        price: 95,
        category: "Desserts & Beverages",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.9,
      },
    ];

    for (const d of dishesData) {
      const catId = categoryMap.get(d.category);
      if (!catId) continue;

      const branchPricing = createdKitchens.map((k) => ({
        kitchenId: k._id,
        price: d.price,
        isAvailable: true,
        isEnabled: true,
      }));

      await MenuItem.findOneAndUpdate(
        { name: d.name },
        {
          name: d.name,
          description: d.description,
          price: d.price,
          category: catId,
          isGlobalMaster: true,
          branchPricing,
          images: [d.image],
          isVeg: d.isVeg,
          rating: d.rating,
          tags: d.tag ? [d.tag] : [],
          isAvailable: true,
          deletedAt: null,
        },
        { upsert: true, new: true }
      );
    }

    // 4. COUPONS
    const couponsData = [
      {
        code: "ROYAL60",
        discountType: "percentage",
        discountValue: 60,
        maximumDiscount: 120,
        minimumOrder: 199,
        expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: "active",
      },
      {
        code: "WELCOME50",
        discountType: "percentage",
        discountValue: 50,
        maximumDiscount: 100,
        minimumOrder: 149,
        expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: "active",
      },
      {
        code: "MALASHREE100",
        discountType: "fixed",
        discountValue: 100,
        maximumDiscount: 100,
        minimumOrder: 499,
        expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: "active",
      },
    ];

    for (const c of couponsData) {
      await Coupon.findOneAndUpdate({ code: c.code }, c, { upsert: true, new: true });
    }

    // 5. DEFAULT USERS
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash("admin123", salt);
    const kitchenPass = await bcrypt.hash("kitchen123", salt);
    const demoPass = await bcrypt.hash("demo123", salt);

    await User.findOneAndUpdate(
      { email: "admin@malashree.in" },
      {
        name: "System Admin",
        email: "admin@malashree.in",
        password: adminPass,
        role: "admin",
        phone: "9876543210",
        address: "Flat 402, Green Acres, Pimple Saudagar, Pune",
      },
      { upsert: true, new: true }
    );

    await User.findOneAndUpdate(
      { email: "kitchen@malashree.in" },
      {
        name: "Pimple Saudagar Chef",
        email: "kitchen@malashree.in",
        password: kitchenPass,
        role: "kitchen_manager",
        phone: "9876543211",
        assignedKitchen: createdKitchens[0]._id,
        address: "Pimple Saudagar Kitchen, Pune",
      },
      { upsert: true, new: true }
    );

    return {
      success: true,
      kitchensCount: createdKitchens.length,
      categoriesCount: categoriesData.length,
      dishesCount: dishesData.length,
      couponsCount: couponsData.length,
      kitchens: createdKitchens.map((k) => ({ id: k._id.toString(), name: k.name, code: k.code })),
    };
  } catch (err: any) {
    console.error("seedDatabase error:", err);
    return { success: false, error: err.message || "Failed to seed database" };
  }
};
