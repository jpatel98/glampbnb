const mongoose = require('mongoose');

const shoppingCartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    rentals: [{
        rentalId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Rental'
        },
        numberOfNights: {
            type: Number,
            required: true,
            min: 1
        },
        pricePerNight: {
            type: Number,
            required: true
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ShoppingCart = mongoose.model('ShoppingCart', shoppingCartSchema);

module.exports = ShoppingCart;
