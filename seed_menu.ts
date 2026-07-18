import mongoose from 'mongoose';
import { BRANCHES } from './src/lib/data';
import { Kitchen } from './src/models/Kitchen';
import { Category } from './src/models/Category';
import { MenuItem } from './src/models/MenuItem';
import { KitchenOffer } from './src/models/KitchenOffer';

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Kitchen.deleteMany({});
  await Category.deleteMany({});
  await MenuItem.deleteMany({});
  await KitchenOffer.deleteMany({});
  console.log('Cleared existing menu data');

  const KITCHENS_COORDS: Record<string, { lat: number; lng: number, radiusKm: number }> = {
    "pimple-saudagar": { lat: 18.5987, lng: 73.7978, radiusKm: 15 },
    "chinchwad": { lat: 18.6253, lng: 73.7788, radiusKm: 15 },
    "sangvi": { lat: 18.5772, lng: 73.8055, radiusKm: 15 },
  };

  for (const b of BRANCHES) {
    const coords = KITCHENS_COORDS[b.id] || { lat: 0, lng: 0 };
    
    // Create Kitchen
    const kitchen = await Kitchen.create({
      code: b.id,
      name: b.name,
      address: b.area,
      location: {
        type: 'Point',
        coordinates: [coords.lng, coords.lat] // GeoJSON is [lng, lat]
      },
      deliveryRadius: 15000,
      status: 'active'
    });

    console.log(`Created kitchen: ${kitchen.name}`);

    // Create Offers
    for (const offer of b.offers) {
      await KitchenOffer.create({
        kitchenId: kitchen._id,
        code: offer.code,
        title: offer.title,
        sub: offer.sub,
        active: true
      });
    }

    // Identify unique categories for this kitchen
    const catNames = Array.from(new Set(b.menu.map(d => d.category)));
    const catMap = new Map();

    for (const catName of catNames) {
      const category = await Category.create({
        kitchenId: kitchen._id,
        name: catName,
        description: `${catName} at ${b.name}`
      });
      catMap.set(catName, category._id);
    }

    // Create Menu Items
    for (const d of b.menu) {
      await MenuItem.create({
        kitchenId: kitchen._id,
        category: catMap.get(d.category),
        name: d.name,
        description: d.desc,
        price: d.price,
        images: [d.image],
        isVeg: d.veg,
        rating: d.rating,
        tags: d.tag ? [d.tag] : [],
        isAvailable: true
      });
    }
  }

  console.log('Seeding completed successfully');
  process.exit(0);
}

seed().catch(console.error);
