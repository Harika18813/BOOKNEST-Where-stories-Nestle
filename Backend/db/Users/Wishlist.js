const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'items' },  // Referencing the book/item
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },  // Referencing the user
    userName: String,
    title: String,
    author: String,
    genre: String,
    price: String,
    itemImage: String,
});

module.exports = mongoose.model('WishlistItem', wishlistItemSchema);
