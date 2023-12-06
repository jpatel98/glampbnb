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
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const bcrypt = require("bcrypt");
const UserModel = require("../models/userModel");
// const rentalsDb = require("../models/rentals-db");
const Rental = require('../models/rentalModel');
const ShoppingCart = require('../models/shoppingCartModel');

// Load environment variables
const apiKey = process.env.MAILGUN_API_KEY;
const domain = process.env.MAILGUN_DOMAIN;
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

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

// Route handler for the home page ("/")
router.get("/", async (req, res) => {
  try {
    const featuredRentals = await Rental.find({ featuredRental: true });

    // Render the 'main.ejs' template and pass the featured rentals for the home page
    res.render("main", {
      content: "home",
      featuredRentals,
      user: req.session.user || null,
    });
  } catch (error) {
    console.error("Error fetching featured rentals:", error);
    res
      .status(500)
      .render("main", { content: "error", user: req.session.user || null });
  }
});

// Route handler for welcome page ("/welcome")
router.get("/welcome", (req, res) => {
  res.render("main", { content: "welcome", user: req.session.user || null });
});

// Route handler for the cart ("/cart")
router.get("/cart", checkAuthenticated, checkRole("Customer"), async (req, res) => {
  try {
    // Fetch cart for the current user
    const cart = await ShoppingCart.findOne({ userId: req.session.user.id }).populate('rentals.rentalId');

    // Prepare cart items for the view
    let cartItems = [];
    let subtotal = 0;
    if (cart && cart.rentals) {
      cartItems = cart.rentals.map(item => {
        const total = item.numberOfNights * item.pricePerNight;
        subtotal += total;
        return { rental: item.rentalId, numberOfNights: item.numberOfNights, total: total };
      });
    }

    res.render("main", {
      content: "cart",
      user: req.session.user || null,
      cartItems: cartItems,
      subtotal: subtotal
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).render("main", { content: "error", user: req.session.user || null });
  }
});


// Route handler for the registration page ("/sign-up")
router.get("/signup", (req, res) => {
  const formData = {};
  const errors = {};
  res.render("main", {
    content: "signUp",
    formData,
    errors,
    user: req.session.user || null,
  });
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
        return res.render("main", {
          content: "signUp",
          formData,
          errors,
          user: req.session.user || null,
        });
      }

      const newUser = new UserModel({ fname, lname, email, password });
      await newUser.save();

      // Create a session for the new user after successful signup
      req.session.user = {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        fname: newUser.fname,
      };

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
        res.render("main", {
          content: "signUp",
          formData,
          errors,
          user: req.session.user || null,
        });
      }
    } catch (error) {
      console.error("Error registering user:", error);
      errors.email = "Error registering user. Please try again.";
      res.render("main", {
        content: "signUp",
        formData,
        errors,
        user: req.session.user || null,
      });
    }
  } else {
    res.render("main", {
      content: "signUp",
      formData,
      errors,
      user: req.session.user || null,
    });
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
  res.render("main", {
    content: "login",
    errors: { email: "", password: "" },
    user: req.session.user || null,
  });
});

router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  const validationResult = validateLoginForm(email, password);
  const errors = validationResult.errors || { email: "", password: "" };

  if (validationResult.isValid) {
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        errors.email = "Invalid email and/or password";
        return res.render("main", {
          content: "login",
          errors,
          formData: { email, role },
          user: req.session.user || null,
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        errors.email = "Invalid email and/or password";
        return res.render("main", {
          content: "login",
          errors,
          formData: { email, role },
          user: req.session.user || null,
        });
      }

      // Initialize the session object
      req.session.user = {
        id: user._id,
        email: user.email,
        role,
        fname: user.fname,
      };
      //   console.log("User logged in:", req.session.user);
      if (role === "Data Entry Clerk") {
        return res.redirect("/rentals/list");
      } else if (role === "Customer") {
        return res.redirect("/cart");
      }
    } catch (error) {
      console.error("Error during login:", error);
      errors.email = "Error during login. Please try again.";
      return res.render("main", {
        content: "login",
        errors,
        user: req.session.user || null,
      });
    }
  } else {
    return res.render("main", {
      content: "login",
      errors,
      user: req.session.user || null,
    });
  }
});

// Logout route
router.get("/logout", (req, res) => {
  // Clear the user session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.redirect("/");
    }
    // Redirect to the home page after successfully logging out
    res.redirect("/login");
  });
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

// route for adding to cart
router.post("/cart/add/:rentalId", checkAuthenticated, checkRole("Customer"), async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.rentalId);
    if (!rental) {
      return res.status(404).send("Rental not found");
    }

    // Add or update the rental in the user's shopping cart
    const cart = await ShoppingCart.findOneAndUpdate(
      { userId: req.session.user.id },
      {
        $push: {
          rentals: {
            rentalId: rental._id,
            numberOfNights: 1, // default to 1 night, can be adjusted later
            pricePerNight: rental.pricePerNight
          }
        }
      },
      { new: true, upsert: true }
    );

    res.redirect("/cart");
  } catch (error) {
    console.error("Error adding rental to cart:", error);
    res.status(500).send("Error adding rental to cart");
  }
});

// POST route to update number of nights for a rental in the cart
router.post("/cart/update/:rentalId", checkAuthenticated, checkRole("Customer"), async (req, res) => {
  try {
    const numberOfNights = parseInt(req.body.numberOfNights);
    if (numberOfNights < 1) throw new Error('Number of nights must be at least 1');

    // Update the number of nights for the specific rental in the user's cart
    await ShoppingCart.findOneAndUpdate(
      { userId: req.session.user.id, 'rentals.rentalId': req.params.rentalId },
      { $set: { 'rentals.$.numberOfNights': numberOfNights } }
    );

    res.redirect("/cart");
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).send("Error updating cart");
  }
});

// GET route to remove a rental from the cart
router.get("/cart/remove/:rentalId", checkAuthenticated, checkRole("Customer"), async (req, res) => {
  try {
    // Remove the specific rental from the user's cart
    await ShoppingCart.findOneAndUpdate(
      { userId: req.session.user.id },
      { $pull: { rentals: { rentalId: req.params.rentalId } } }
    );

    res.redirect("/cart");
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).send("Error removing item from cart");
  }
});

// POST route for checkout and sending order details via email
router.post("/checkout", checkAuthenticated, checkRole("Customer"), async (req, res) => {
  try {
    // Retrieve the shopping cart for the current user
    const cart = await ShoppingCart.findOne({ userId: req.session.user.id }).populate('rentals.rentalId');
    if (!cart || cart.rentals.length === 0) {
      return res.status(400).send("Shopping cart is empty.");
    }

    // Calculate subtotal, VAT, and total
    let subtotal = 0;
    cart.rentals.forEach(item => {
      subtotal += item.numberOfNights * item.rentalId.pricePerNight;
    });
    const vat = subtotal * 0.20;
    const total = subtotal + vat;

    // Prepare email content
    let emailContent = `Hello ${req.session.user.fname},\n\nHere are the details of your order:\n\n`;
    cart.rentals.forEach(item => {
      emailContent += `Rental: ${item.rentalId.headline}\nCity: ${item.rentalId.city}\nProvince: ${item.rentalId.province}\nNights: ${item.numberOfNights}\nPrice per night: $${item.rentalId.pricePerNight}\nTotal: $${(item.numberOfNights * item.rentalId.pricePerNight).toFixed(2)}\n\n`;
    });
    emailContent += `Subtotal: $${subtotal.toFixed(2)}\nVAT: $${vat.toFixed(2)}\nGrand Total: $${total.toFixed(2)}\n\nThank you for your order.`;

    // Send email to the user
    await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: "Glambnb <mailgun@sandbox-123.mailgun.org>",
      to: req.session.user.email,
      subject: "Your Glambnb Order Details",
      text: emailContent
    });

    // Clear the shopping cart
    await ShoppingCart.findOneAndUpdate(
      { userId: req.session.user.id },
      { $set: { rentals: [] } }
    );

    res.render("main", {
      content: "orderConfirmation",
      user: req.session.user || null,
      message: "Your order has been placed successfully. A confirmation email has been sent."
    });
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).send("Error during checkout");
  }
});

module.exports = router;
