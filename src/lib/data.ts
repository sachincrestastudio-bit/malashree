export type Dish = {
  id: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  veg: boolean;
  rating: number;
  category: string;
  tag?: string;
};

export type Branch = {
  id: string;
  name: string;
  area: string;
  tagline: string;
  vibe: string;
  distanceKm: number;
  etaMin: number;
  hero: string;
  accent: string; // tailwind-ish label
  offers: { code: string; title: string; sub: string }[];
  featured: string[]; // dish ids
  menu: Dish[];
};

const img = (q: string) => `https://images.unsplash.com/${q}?auto=format&fit=crop&w=1200&q=80`;

// Pimple Saudagar — premium paneer family dining
const pimpleMenu: Dish[] = [
  {
    id: "ps-1",
    name: "Paneer Lababdar",
    desc: "Creamy tomato gravy, hand-churned paneer, smoked finish.",
    price: 320,
    image: img("photo-1631452180519-c014fe946bc7"),
    veg: true,
    rating: 4.8,
    category: "Mains",
    tag: "Bestseller",
  },
  {
    id: "ps-2",
    name: "Paneer Tikka Masala",
    desc: "Charcoal-grilled cubes, silky kadai gravy.",
    price: 340,
    image: img("photo-1601050690597-df0568f70950"),
    veg: true,
    rating: 4.7,
    category: "Mains",
  },
  {
    id: "ps-3",
    name: "Dal Makhani",
    desc: "Slow-cooked for 18 hours. Butter, cream, smoke.",
    price: 280,
    image: img("photo-1546833999-b9f581a1996d"),
    veg: true,
    rating: 4.9,
    category: "Mains",
    tag: "Chef's pick",
  },
  {
    id: "ps-4",
    name: "Garlic Naan Basket",
    desc: "Three naans, fresh from the tandoor.",
    price: 180,
    image: img("photo-1565557623262-b51c2513a641"),
    veg: true,
    rating: 4.6,
    category: "Breads",
  },
  {
    id: "ps-5",
    name: "Hyderabadi Veg Biryani",
    desc: "Long-grain basmati, dum-sealed, mint raita.",
    price: 360,
    image: img("photo-1563379091339-03b21ab4a4f8"),
    veg: true,
    rating: 4.7,
    category: "Rice",
  },
  {
    id: "ps-6",
    name: "Gulab Jamun",
    desc: "Two warm pieces, cardamom syrup.",
    price: 120,
    image: img("photo-1601050690597-df0568f70950"),
    veg: true,
    rating: 4.8,
    category: "Desserts",
  },
];

// Chinchwad — budget combos, thalis, office lunch
const chinchwadMenu: Dish[] = [
  {
    id: "cw-1",
    name: "Malashree Special Thali",
    desc: "Dal, sabzi, paneer, 3 rotis, rice, salad, sweet.",
    price: 220,
    image: img("photo-1567337710282-00832b415979"),
    veg: true,
    rating: 4.7,
    category: "Thali",
    tag: "Office favorite",
  },
  {
    id: "cw-2",
    name: "Mini Veg Thali",
    desc: "Quick lunch combo, ready in 12 minutes.",
    price: 160,
    image: img("photo-1626777553635-c95b16635c0e"),
    veg: true,
    rating: 4.5,
    category: "Thali",
  },
  {
    id: "cw-3",
    name: "Punjabi Chole Bhature",
    desc: "Two fluffy bhature, slow-cooked chole.",
    price: 180,
    image: img("photo-1626132647523-66f5bf380027"),
    veg: true,
    rating: 4.6,
    category: "Mains",
    tag: "Bestseller",
  },
  {
    id: "cw-4",
    name: "Rajma Chawal Combo",
    desc: "Comfort food classic. Kashmiri rajma + jeera rice.",
    price: 170,
    image: img("photo-1546833999-b9f581a1996d"),
    veg: true,
    rating: 4.5,
    category: "Combos",
  },
  {
    id: "cw-5",
    name: "Veg Pulao + Raita",
    desc: "Aromatic pulao with cooling boondi raita.",
    price: 150,
    image: img("photo-1596797038530-2c107229654b"),
    veg: true,
    rating: 4.4,
    category: "Rice",
  },
  {
    id: "cw-6",
    name: "Masala Chai",
    desc: "Cutting chai, the Pune way.",
    price: 30,
    image: img("photo-1597318181409-cf64d0b5d8a2"),
    veg: true,
    rating: 4.9,
    category: "Drinks",
  },
];

// Sangvi — youth, Chinese, snacks, late night
const sangviMenu: Dish[] = [
  {
    id: "sv-1",
    name: "Schezwan Veg Noodles",
    desc: "Wok-tossed, fiery house schezwan.",
    price: 180,
    image: img("photo-1612929633738-8fe44f7ec841"),
    veg: true,
    rating: 4.7,
    category: "Chinese",
    tag: "Late-night hit",
  },
  {
    id: "sv-2",
    name: "Crispy Honey Chilli Potato",
    desc: "Sticky, sweet, crunchy. Made to share.",
    price: 200,
    image: img("photo-1626804475297-41608ea09aeb"),
    veg: true,
    rating: 4.8,
    category: "Starters",
    tag: "Trending",
  },
  {
    id: "sv-3",
    name: "Veg Manchurian Dry",
    desc: "Hand-rolled balls in tangy garlic sauce.",
    price: 190,
    image: img("photo-1585032226651-759b368d7246"),
    veg: true,
    rating: 4.6,
    category: "Chinese",
  },
  {
    id: "sv-4",
    name: "Paneer Chilli",
    desc: "Indo-Chinese classic, extra wok-fire.",
    price: 240,
    image: img("photo-1606491956689-2ea866880c84"),
    veg: true,
    rating: 4.7,
    category: "Starters",
  },
  {
    id: "sv-5",
    name: "Cheese Burst Maggi",
    desc: "Late-night fuel. Loaded with mozzarella.",
    price: 140,
    image: img("photo-1612927601601-6638404737ce"),
    veg: true,
    rating: 4.8,
    category: "Snacks",
  },
  {
    id: "sv-6",
    name: "Cold Coffee Frappé",
    desc: "Iced, blended, topped with cocoa.",
    price: 160,
    image: img("photo-1461023058943-07fcbe16d735"),
    veg: true,
    rating: 4.6,
    category: "Drinks",
  },
];

export const BRANCHES: Branch[] = [
  {
    id: "pimple-saudagar",
    name: "Malashree Pimple Saudagar",
    area: "Pimple Saudagar",
    tagline: "Premium family dining",
    vibe: "Slow-cooked. Generous. Made for the table.",
    distanceKm: 1.2,
    etaMin: 28,
    hero: img("photo-1565557623262-b51c2513a641"),
    accent: "lime",
    offers: [
      { code: "FAMILY20", title: "Flat 20% off", sub: "On orders above ₹699" },
      { code: "PANEER100", title: "₹100 off paneer", sub: "Bestselling paneer dishes" },
    ],
    featured: ["ps-1", "ps-3", "ps-5"],
    menu: pimpleMenu,
  },
  {
    id: "chinchwad",
    name: "Malashree Chinchwad",
    area: "Chinchwad",
    tagline: "Budget combos & thalis",
    vibe: "Lunch hour, sorted. Combos that show up fast.",
    distanceKm: 3.4,
    etaMin: 22,
    hero: img("photo-1567337710282-00832b415979"),
    accent: "lime",
    offers: [
      { code: "LUNCH50", title: "₹50 off lunch", sub: "12–3 PM, weekdays" },
      { code: "THALI10", title: "10% off thalis", sub: "Every single day" },
    ],
    featured: ["cw-1", "cw-3", "cw-4"],
    menu: chinchwadMenu,
  },
  {
    id: "sangvi",
    name: "Malashree Sangvi",
    area: "Sangvi",
    tagline: "Chinese, snacks, late-night",
    vibe: "Open till 1 AM. Bring the cravings.",
    distanceKm: 5.1,
    etaMin: 32,
    hero: img("photo-1612929633738-8fe44f7ec841"),
    accent: "lime",
    offers: [
      { code: "MIDNIGHT", title: "Free delivery", sub: "After 10 PM" },
      { code: "STUDENT15", title: "15% student off", sub: "With valid ID" },
    ],
    featured: ["sv-1", "sv-2", "sv-5"],
    menu: sangviMenu,
  },
];

export const CATEGORIES = [
  "All",
  "Bestseller",
  "Mains",
  "Starters",
  "Chinese",
  "Thali",
  "Combos",
  "Rice",
  "Breads",
  "Snacks",
  "Drinks",
  "Desserts",
];

export const getBranch = (id: string) => BRANCHES.find((b) => b.id === id) ?? BRANCHES[0];
export const findDish = (id: string) => {
  for (const b of BRANCHES) {
    const d = b.menu.find((m) => m.id === id);
    if (d) return d;
  }
  return undefined;
};
