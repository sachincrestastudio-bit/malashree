import { Schema, model, models } from 'mongoose';

const WishlistSchema = new Schema({}, { timestamps: true });

export const Wishlist = models.Wishlist || model('Wishlist', WishlistSchema);
