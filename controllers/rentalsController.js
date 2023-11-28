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
const rentalsDb = require("../models/rentals-db");

// Middleware to check if the user is logged in
const checkAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).render("main", {content: "404", user: req.session.user || null});
  }
  next();
};

// Middleware to check user roles
const checkRole = (role) => {
  return (req, res, next) => {
    if (req.session.user && req.session.user.role === role) {
      next();
    } else {
      return res.status(401).render("main", {content: "404", user: req.session.user || null});
    }
  };
};

// Route handler for the rentals page ("/rentals")
router.get("/", (req, res) => {
  const allRentals = rentalsDb.getRentalsByCityAndProvince();

  // Render the 'main.ejs' template and pass rental data for the rentals page
  res.render("main", {
    content: "rentals",
    allRentals,
    user: req.session.user || null,
  });
});

// Route handler for the rentals list page ("/rentals/list")
router.get(
  "/list",
  checkAuthenticated,
  checkRole("Data Entry Clerk"),
  (req, res) => {
    res.render("main", {
      content: "rentals-list",
      user: req.session.user || null,
    });
  }
);

module.exports = router;
