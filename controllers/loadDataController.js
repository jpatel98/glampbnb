const express = require("express");
const router = express.Router();
const Rental = require("../models/rentalModel");

// Data for rental entries
const rentals = [
  {
    headline: "Haliburton Glamping Retreat",
    numSleeps: 2,
    numBedrooms: 1,
    numBathrooms: 1,
    pricePerNight: 249.99,
    city: "Haliburton",
    province: "Ontario",
    imageUrl: "/assets/Images/property5.jpg",
    featuredRental: false,
  },
  {
    headline: "Haliburton Cozy Cottage Getaway",
    numSleeps: 4,
    numBedrooms: 2,
    numBathrooms: 1,
    pricePerNight: 179.99,
    city: "Haliburton",
    province: "Ontario",
    imageUrl: "/assets/Images/property1.jpg",
    featuredRental: false,
  },
  {
    headline: "North Bay Lakeside Cabin Retreat",
    numSleeps: 6,
    numBedrooms: 3,
    numBathrooms: 2,
    pricePerNight: 299.99,
    city: "North Bay",
    province: "Ontario",
    imageUrl: "/assets/Images/property6.jpg",
    featuredRental: false,
  },
  {
    headline: "Tranquil Muskoka Waterfront Cottage",
    numSleeps: 5,
    numBedrooms: 2,
    numBathrooms: 1,
    pricePerNight: 219.99,
    city: "Muskoka",
    province: "Ontario",
    imageUrl: "/assets/Images/property2.jpg",
    featuredRental: true,
  },
  {
    headline: "Haliburton Forest Retreat Cabin",
    numSleeps: 4,
    numBedrooms: 2,
    numBathrooms: 1,
    pricePerNight: 189.99,
    city: "Haliburton",
    province: "Ontario",
    imageUrl: "/assets/Images/property4.jpg",
    featuredRental: false,
  },
  {
    headline: "Haliburton Lakeside Luxury Lodge",
    numSleeps: 8,
    numBedrooms: 4,
    numBathrooms: 3,
    pricePerNight: 399.99,
    city: "Haliburton",
    province: "Ontario",
    imageUrl: "/assets/Images/property3.jpg",
    featuredRental: true,
  },
  {
    headline: "Muskoka Lakeside Getaway",
    numSleeps: 6,
    numBedrooms: 3,
    numBathrooms: 2,
    pricePerNight: 259.99,
    city: "Muskoka",
    province: "Ontario",
    imageUrl: "/assets/Images/property7.jpg",
    featuredRental: false,
  },
  {
    headline: "Cozy North Bay Cottage",
    numSleeps: 3,
    numBedrooms: 1,
    numBathrooms: 1,
    pricePerNight: 149.99,
    city: "North Bay",
    province: "Ontario",
    imageUrl: "/assets/Images/property8.jpg",
    featuredRental: true,
  },
  {
    headline: "Muskoka Lakeside Paradise",
    numSleeps: 8,
    numBedrooms: 4,
    numBathrooms: 2,
    pricePerNight: 349.99,
    city: "Muskoka",
    province: "Ontario",
    imageUrl: "/assets/Images/property9.jpg",
    featuredRental: false,
  },
  {
    headline: "North Bay Waterfront Cabin",
    numSleeps: 5,
    numBedrooms: 2,
    numBathrooms: 1,
    pricePerNight: 199.99,
    city: "North Bay",
    province: "Ontario",
    imageUrl: "/assets/Images/property10.jpg",
    featuredRental: false,
  },
];

// Middleware to check if user is a data clerk
function checkDataClerk(req, res, next) {
  if (
    req.session &&
    req.session.user &&
    req.session.user.role === "Data Entry Clerk"
  ) {
    next();
  } else {
    res.status(401).render("main", {
      content: "loadDataOutcome",
      message: "You are not authorized to add rentals",
      user: req.session.user || null,
    });
  }
}

router.get("/", checkDataClerk, async (req, res) => {
  try {
    const existingRentals = await Rental.find({});
    if (existingRentals.length > 0) {
      res.render("main", {
        content: "loadDataOutcome",
        message: "Rentals have already been added to the database",
        user: req.session.user || null,
      });
    } else {
      await Rental.insertMany(rentals);
      res.render("main", {
        content: "loadDataOutcome",
        message: "Added rentals to the database",
        user: req.session.user || null,
      });
    }
  } catch (error) {
    res.status(500).render("main", {
      content: "loadDataOutcome",
      message: "Error loading rentals",
      user: req.session.user || null,
    });
  }
});

module.exports = router;
