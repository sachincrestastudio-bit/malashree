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
import { SystemSetting } from "@/models/SystemSetting";

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

    // Upsert or create the 6 branches
    const createdKitchens: any[] = [];
    for (const k of kitchensData) {
      const doc = await Kitchen.findOneAndUpdate(
        { code: k.code },
        { ...k, deletedAt: null },
        { upsert: true, new: true }
      );
      createdKitchens.push(doc);
    }

    // 2. CATEGORIES
    const categoriesData = [
      { name: "Royal Thalis", description: "Complete grand meals with sweets, breads & curries" },
      { name: "Main Course", description: "Rich North Indian gravies & cottage cheese delights" },
      { name: "Biryani & Pulao", description: "Aromatic basmati rice cooked with whole royal spices" },
      { name: "Dal & Curries", description: "Slow-cooked lentils & home-style comfort curries" },
      { name: "Breads & Naan", description: "Fresh from the tandoor clay oven" },
      { name: "Starters & Snacks", description: "Crispy appetizers, Indo-Chinese & evening snacks" },
      { name: "Combos", description: "Quick lunch & dinner combos ready in minutes" },
      { name: "Desserts & Beverages", description: "Authentic Indian sweets & refreshing chilled drinks" },
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

    // 3. MASTER MENU ITEMS (INCLUDING ALL CHINCHWAD ITEMS + SIGNATURE ITEMS)
    const dishesData = [
      // --- ALL CHINCHWAD MENU ITEMS ---
      {
        name: "Malashree Special Thali",
        description: "Dal makhani, seasonal veg sabzi, shahi paneer, 3 butter rotis, jeera rice, salad, papad & sweet.",
        price: 220,
        category: "Royal Thalis",
        image: "https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.8,
        tag: "Office Favorite",
      },
      {
        name: "Mini Veg Thali",
        description: "Quick lunch combo: Paneer curry, yellow dal tadka, 2 rotis, steamed rice & pickle. Ready in 12 mins.",
        price: 160,
        category: "Royal Thalis",
        image: "https://images.unsplash.com/photo-1626777553635-c95b16635c0e?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.6,
        tag: "Quick Lunch",
      },
      {
        name: "Punjabi Chole Bhature",
        description: "Two golden fluffy bhature served with slow-cooked Amritsari pindi chole, pickled onions & green chutney.",
        price: 180,
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.9,
        tag: "Bestseller",
      },
      {
        name: "Rajma Chawal Combo",
        description: "Comfort food classic: Slow-simmered Kashmiri rajma served with fragrant jeera basmati rice & salad.",
        price: 170,
        category: "Combos",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.7,
        tag: "Comfort Food",
      },
      {
        name: "Veg Pulao + Raita",
        description: "Aromatic basmati pulao loaded with garden fresh vegetables, served with cooling roasted cumin boondi raita.",
        price: 150,
        category: "Biryani & Pulao",
        image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.6,
      },
      {
        name: "Masala Chai",
        description: "Authentic Pune style cutting chai brewed with fresh ginger, crushed cardamom, cloves and whole milk.",
        price: 30,
        category: "Desserts & Beverages",
        image: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.9,
        tag: "Hot & Fresh",
      },
      {
        name: "Schezwan Veg Noodles",
        description: "Wok-tossed hakka noodles with crisp shredded veggies in spicy homemade fiery schezwan sauce.",
        price: 180,
        category: "Starters & Snacks",
        image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.7,
        tag: "Late-night Hit",
      },
      {
        name: "Crispy Honey Chilli Potato",
        description: "Crisp potato fingers tossed in sweet honey chilli glaze, toasted sesame seeds and fresh spring onions.",
        price: 200,
        category: "Starters & Snacks",
        image: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.8,
        tag: "Trending",
      },
      {
        name: "Veg Manchurian Dry",
        description: "Crispy hand-rolled vegetable dumplings tossed in ginger garlic soya glaze with green chillies.",
        price: 190,
        category: "Starters & Snacks",
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.6,
      },
      {
        name: "Paneer Chilli",
        description: "Indo-Chinese favorite: Crispy paneer tossed with capsicum, onions, dark soy and spicy green chillies.",
        price: 240,
        category: "Starters & Snacks",
        image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.8,
        tag: "Must Try",
      },
      {
        name: "Cheese Burst Maggi",
        description: "Late-night favorite: Masala Maggi loaded with molten mozzarella cheese and toasted butter.",
        price: 140,
        category: "Starters & Snacks",
        image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.9,
      },
      {
        name: "Cold Coffee Frappé",
        description: "Chilled blended coffee with rich dark roasted espresso, vanilla ice cream, and cocoa powder.",
        price: 160,
        category: "Desserts & Beverages",
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.7,
      },

      // --- SIGNATURE ROYAL MAINS & CURRIES ---
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
        name: "Paneer Lababdar",
        description: "Luscious cubes of cottage cheese simmered in spicy, chunky onion-tomato gravy with grated paneer.",
        price: 320,
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.9,
        tag: "Royal Special",
      },
      {
        name: "Paneer Tikka Masala",
        description: "Charcoal grilled paneer tikka tossed in robust spiced bell pepper and tomato masala.",
        price: 340,
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.8,
        tag: "Chef Special",
      },
      {
        name: "Kadhai Paneer Special",
        description: "Cottage cheese tossed with crunchy bell peppers, onions, and freshly ground kadhai spices.",
        price: 290,
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.8,
      },
      {
        name: "Malai Kofta Deluxe",
        description: "Melt-in-mouth cottage cheese and potato dumplings simmered in rich saffron cashew gravy.",
        price: 310,
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.9,
      },
      {
        name: "Dal Makhani (Slow Cooked 18h)",
        description: "Black lentils simmered overnight over slow charcoal with white butter and fresh cream.",
        price: 240,
        category: "Dal & Curries",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.9,
        tag: "Signature",
      },
      {
        name: "Dal Tadka (Double Tadka)",
        description: "Yellow lentils tempered with desi ghee, cumin seeds, garlic, and dry Kashmiri red chillies.",
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
        name: "Malashree Royal Maharaja Thali",
        description: "Grand feast: Shahi Paneer, Dal Makhani, Mix Veg, 2 Butter Naans, Jeera Rice, Gulab Jamun, Papad & Salad.",
        price: 349,
        category: "Royal Thalis",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
        isVeg: true,
        rating: 4.9,
        tag: "Grand Feast",
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

    // Seed master dishes with default branchPricing for all 6 branches
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
          isVeg: d.isVeg,
          rating: d.rating || 4.8,
          tags: d.tag ? [d.tag] : [],
          images: [d.image],
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
        minOrderAmount: 149,
        maxDiscountAmount: 120,
        isActive: true,
        description: "Flat 60% OFF up to ₹120 on your pure veg order",
      },
      {
        code: "FAMILY20",
        discountType: "percentage",
        discountValue: 20,
        minOrderAmount: 699,
        maxDiscountAmount: 200,
        isActive: true,
        description: "Flat 20% OFF on grand family orders above ₹699",
      },
      {
        code: "LUNCH50",
        discountType: "fixed",
        discountValue: 50,
        minOrderAmount: 199,
        isActive: true,
        description: "Flat ₹50 OFF on weekday lunch orders",
      },
    ];

    for (const c of couponsData) {
      await Coupon.findOneAndUpdate({ code: c.code }, c, { upsert: true, new: true });
    }

    // 5. SYSTEM SETTINGS
    await SystemSetting.findOneAndUpdate(
      {},
      {
        taxPercentage: 5,
        packagingCharge: 15,
        platformFee: 5.0,
        defaultDeliveryFee: 34,
        freeDeliveryThreshold: 500,
        maxDeliveryRadiusKm: 10,
        isStoreOnline: true,
        brandName: "Malashree Pure Veg",
      },
      { upsert: true, new: true }
    );

    return { success: true, count: dishesData.length };
  } catch (err: any) {
    console.error("seedDatabase error:", err);
    return { error: err.message || "Failed to seed database." };
  }
};
