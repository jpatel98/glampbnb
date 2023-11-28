const mongoose = require('mongoose');

// Define the schema for rentals
const rentalSchema = new mongoose.Schema({
    headline: {
        type: String,
        required: true
    },
    numSleeps: {
        type: Number,
        required: true
    },
    numBedrooms: {
        type: Number,
        required: true
    },
    numBathrooms: {
        type: Number,
        required: true
    },
    pricePerNight: {
        type: Number,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    province: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    featuredRental: {
        type: Boolean,
        default: false
    }
});

// Create the model
const Rental = mongoose.model('Rental', rentalSchema);

module.exports = Rental;
