/*************************************************************************************
 * WEB322 - 2237 Project
 * I declare that this assignment is my own work in accordance with the Seneca Academic
 * Policy. No part of this assignment has been copied manually or electronically from
 * any other source (including web sites) or distributed to other students.
 *
 * Student Name  : Jigar Patel
 * Student ID    : 118005172
 * Course/Section: WEB322 NEE
 *
 **************************************************************************************/

const express = require("express");
const router = express.Router();
// const rentalsDb = require("../models/rentals-db");
const Rental = require("../models/rentalModel");

// Middleware to check if the user is logged in
const checkAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res
      .status(401)
      .render("main", { content: "404", user: req.session.user || null });
  }
  next();
};

// Middleware to check user roles
const checkRole = (role) => {
  return (req, res, next) => {
    if (req.session.user && req.session.user.role === role) {
      next();
    } else {
      return res
        .status(401)
        .render("main", { content: "404", user: req.session.user || null });
    }
  };
};

// Route handler for the rentals page ("/rentals")
router.get("/", async (req, res) => {
  try {
    const allRentals = await Rental.find({}).lean(); //.lean(), tells Mongoose to give the plain JS object.
    const groupedRentals = groupRentalsByCityAndProvince(allRentals);

    // console.log(groupedRentals);
    // Render the 'main.ejs' template and pass rental data for the rentals page
    res.render("main", {
      content: "rentals",
      allRentals: groupedRentals,
      user: req.session.user || null,
    });
  } catch (error) {
    console.error("Error fetching rentals:", error);
    res.status(500).render("main", { content: "error", user: req.session.user || null });
  }
});


// Route handler for the rentals list page ("/rentals/list")
router.get("/list", checkAuthenticated, checkRole("Data Entry Clerk"), async (req, res) => {
  try {
    const rentals = await Rental.find({}).sort({ headline: 1 }).lean();
    res.render("main", {
      content: "clerkDashboard",
      rentals,
      user: req.session.user || null,
    });
  } catch (error) {
    console.error("Error fetching rentals:", error);
    res.status(500).render("main", { content: "error", user: req.session.user || null });
  }
});


function groupRentalsByCityAndProvince(rentals) {
  const groupedRentals = {};

  rentals.forEach((rental) => {
    const cityProvince = `${rental.city}, ${rental.province}`;

    if (!groupedRentals[cityProvince]) {
      groupedRentals[cityProvince] = {
        cityProvince,
        rentals: [],
      };
    }

    // Include the city and province within each rental
    const rentalWithLocation = {
      ...rental,
      city: rental.city,
      province: rental.province,
    };

    groupedRentals[cityProvince].rentals.push(rentalWithLocation);
  });

  return Object.values(groupedRentals);
}

module.exports = router;
