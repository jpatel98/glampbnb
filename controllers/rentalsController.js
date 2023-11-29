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
    res
      .status(500)
      .render("main", { content: "error", user: req.session.user || null });
  }
});

// Route handler for the rentals list page ("/rentals/list")
router.get(
  "/list",
  checkAuthenticated,
  checkRole("Data Entry Clerk"),
  async (req, res) => {
    try {
      const rentals = await Rental.find({}).sort({ headline: 1 }).lean();
      res.render("main", {
        content: "clerkDashboard",
        rentals,
        user: req.session.user || null,
      });
    } catch (error) {
      console.error("Error fetching rentals:", error);
      res
        .status(500)
        .render("main", { content: "error", user: req.session.user || null });
    }
  }
);

// GET Route for Add Rental Form
router.get(
  "/add",
  checkAuthenticated,
  checkRole("Data Entry Clerk"),
  (req, res) => {
    // Render a form for adding new rental properties
    res.render("main", {
      content: "rentalAddForm",
      user: req.session.user || null,
    });
  }
);

// POST Route for processing rental form submission
router.post("/add", checkAuthenticated, checkRole("Data Entry Clerk"), async (req, res) => {
  // Construct a new Rental object using form data
  const newRental = new Rental({
    headline: req.body.headline,
    numSleeps: req.body.numSleeps,
    numBedrooms: req.body.numBedrooms,
    numBathrooms: req.body.numBathrooms,
    pricePerNight: req.body.pricePerNight,
    city: req.body.city,
    province: req.body.province,
    imageUrl: req.body.imageUrl,
    featuredRental: req.body.featuredRental === 'on', // Checkbox returns 'on' if checked
  });

  try {
    // Save the new rental to the database
    await newRental.save();
    // Redirect to the rentals list page or show a success message
    res.redirect("/rentals/list");
  } catch (error) {
    // Handle errors and render the form again with error messages
    console.error("Error adding new rental:", error);
    res.status(500).render("main", {
      content: "rental-add-form",
      user: req.session.user || null,
      errors: { message: "Failed to add rental. Please try again." },
      formData: req.body, // Send back the form data for user convenience
    });
  }
});

// GET Route for Edit Rental Form
router.get("/edit/:id", checkAuthenticated, checkRole("Data Entry Clerk"), async (req, res) => {
  try {
    // Find the rental by ID
    const rental = await Rental.findById(req.params.id).lean();
    if (!rental) {
      return res.status(404).render("main", { content: "error", user: req.session.user || null });
    }
    
    // Render a form pre-filled with rental data
    res.render("main", {
      content: "rentalEditForm",
      rental: rental,
      user: req.session.user || null,
    });
  } catch (error) {
    console.error("Error fetching rental:", error);
    res.status(500).render("main", { content: "error", user: req.session.user || null });
  }
});

// POST Route for processing rental form submission
router.post("/edit/:id", checkAuthenticated, checkRole("Data Entry Clerk"), async (req, res) => {
  try {
    // Find the rental by ID and update it
    const updatedRental = await Rental.findByIdAndUpdate(req.params.id, {
      ...req.body,
      featuredRental: !!req.body.featuredRental,
    }, { new: true, runValidators: true });

    // Redirect to the rentals list page or show a success message
    res.redirect("/rentals/list");
  } catch (error) {
    // Handle validation errors or display error messages
    res.status(400).render("main", {
      content: "rentalEditForm",
      errors: error.message,
      rental: req.body,
      user: req.session.user || null,
    });
  }
});

// Utility functions
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
