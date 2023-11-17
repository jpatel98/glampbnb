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

const path = require("path");
const express = require("express");
const router = express.Router();
const rentalsDb = require("../models/rentals-db");

// Route handler for the rentals page ("/rentals")
router.get("/", (req, res) => {
  const allRentals = rentalsDb.getRentalsByCityAndProvince();

  // Render the 'main.ejs' template and pass rental data for the rentals page
  res.render("main", { content: "rentals", allRentals });
});

// Route handler for the rentals page ("/rentals/list")
router.get("/list", (req, res) => {
  res.render("main", { content: "rentals-list" });
});

module.exports = router;
