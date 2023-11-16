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
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const UserModel = require("../models/userModel");
const rentalsDb = require("../models/rentals-db");

// Load environment variables
const apiKey = process.env.MAILGUN_API_KEY;
const domain = process.env.MAILGUN_DOMAIN;
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

// Route handler for the home page ("/")
router.get("/", (req, res) => {
  // Fetch the featured rentals from the rentals-db module
  const featuredRentals = rentalsDb.getFeaturedRentals();

  // Render the 'main.ejs' template and pass the featured rentals / features for home page
  res.render("main", { content: "home", featuredRentals });
});

// Route handler for welcome page ("/welcome")
router.get("/welcome", (req, res) => {
  res.render("main", { content: "welcome" });
});

// Route handler for the registration page ("/sign-up")
router.get("/signup", (req, res) => {
  const formData = {};
  const errors = {};
  res.render("main", { content: "sign-up", formData, errors });
});

router.post("/signup", async (req, res) => {
  const { fname, lname, email, password } = req.body;
  const validationResult = validateSignupForm(fname, lname, email, password);
  const errors = validationResult.errors || {};
  const formData = { fname, lname, email, password };

  if (validationResult.isValid) {
    try {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        errors.email = "Email already exists. Please use a different email.";
        return res.render("main", { content: "sign-up", formData, errors });
      }

      const newUser = new UserModel({ fname, lname, email, password });
      await newUser.save();

      try {
        // Send an email to the user's email address
        await mg.messages.create(process.env.MAILGUN_DOMAIN, {
          from: "Glambnb <mailgun@sandbox-123.mailgun.org>",
          to: email,
          subject: "Welcome to our website",
          text: `Dear ${fname},\n\nWelcome to our website! Thank you for signing up!\n\nBest regards,\nJigar Patel\nGlambnb`,
          html: `<h1>Dear ${fname},</h1><p>Welcome to our website! Thank you for signing up!</p><p>Best regards,<br>Jigar Patel<br>Glambnb</p>`,
        });

        res.redirect("/welcome"); // Redirect to the welcome page
      } catch (error) {
        console.error("Error sending email:", error);
        errors.email = "Error sending email. Please try again later.";
        res.render("main", { content: "sign-up", formData, errors });
      }
    } catch (error) {
      console.error("Error registering user:", error);
      errors.email = "Error registering user. Please try again.";
      res.render("main", { content: "sign-up", formData, errors });
    }
  } else {
    res.render("main", { content: "sign-up", formData, errors });
  }
});

function validateSignupForm(fname, lname, email, password) {
  const errors = {};
  // Check if the first name is null or empty
  if (!fname || fname.trim() === "") {
    errors.fname = "First name cannot be blank";
  }

  // Check if the last name is null or empty
  if (!lname || lname.trim() === "") {
    errors.lname = "Last name cannot be blank";
  }

  // Check if the email is null or empty
  if (!email || email.trim() === "") {
    errors.email = "Email cannot be blank";
  } else {
    // Check if the email is malformed
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "Invalid email address";
    }
  }

  // Check if the password is null or empty
  if (!password || password.trim() === "") {
    errors.password = "Password cannot be blank";
  } else {
    // Check if the password meets the complexity requirements
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!passwordRegex.test(password)) {
      errors.password =
        "Password must be between 8 to 20 characters and contain at least one lowercase letter, one uppercase letter, one number, and one symbol";
    }
  }

  // Return the validation result
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

router.get("/login", (req, res) => {
  res.render("main", { content: "login", errors: { email: "", password: "" } });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const validationResult = validateLoginForm(email, password);
  const errors = validationResult.errors || { email: "", password: "" };
  res.render("main", { content: "login", errors });
});

function validateLoginForm(email, password) {
  const errors = {};
  // Check if the email is null or empty
  if (!email || email.trim() === "") {
    errors.email = "Email cannot be blank";
  }

  // Check if the password is null or empty
  if (!password || password.trim() === "") {
    errors.password = "Password cannot be blank";
  }

  // Return the validation result
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

module.exports = router;
