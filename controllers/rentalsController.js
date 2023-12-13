const express = require("express");
const router = express.Router();
// const rentalsDb = require("../models/rentals-db");
const Rental = require("../models/rentalModel");
// for image upload
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require('uuid');

// Configure AWS and create S3 instance
AWS.config.update({
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
  region: process.env.MY_AWS_REGION || "us-east-1",
});
const s3 = new AWS.S3();

// Middleware to handle file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/gif") {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
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


// Route handler for the rentals page ("/rentals")
router.get("/", async (req, res) => {
  try {
    const allRentals = await Rental.find({}).lean();
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

// GET Route for Add Rental Form ("/rentals/add")
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

// POST Route for processing rental form submission ("/rentals/add")
router.post(
  "/add",
  checkAuthenticated,
  checkRole("Data Entry Clerk"),
  upload.single("imageUrl"),
  async (req, res) => {
    // const imageUrl = req.file ? `/assets/Images/${req.file.filename}` : '';

    let imageUrl = '';
    if (req.file && req.file.buffer) {
      const fileKey = `${uuidv4()}${path.extname(req.file.originalname)}`;
      const params = {
        Bucket: process.env.MY_AWS_BUCKET_NAME,
        Key: `uploads/${fileKey}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: 'public-read'
      };

      try {
        const uploadResult = await s3.upload(params).promise();
        imageUrl = uploadResult.Location;
      } catch (err) {
        console.error("Error uploading file to S3:", err);
        return res.status(500).render("main", {
          content: "error",
          user: req.session.user || null
        });
      }
    }
    const newRental = new Rental({
      headline: req.body.headline,
      numSleeps: req.body.numSleeps,
      numBedrooms: req.body.numBedrooms,
      numBathrooms: req.body.numBathrooms,
      pricePerNight: req.body.pricePerNight,
      city: req.body.city,
      province: req.body.province,
      imageUrl: imageUrl,
      featuredRental: req.body.featuredRental === "on", // returns 'on' if checked
    });

    try {
      // Save the new rental to the database
      // log(newRental);
      await newRental.save();
      // Redirect to the rentals list page
      res.redirect("/rentals/list");
    } catch (error) {
      console.error("Error adding new rental:", error);
      res.status(500).render("main", {
        content: "rental-add-form",
        user: req.session.user || null,
        errors: { message: "Failed to add rental. Please try again." },
        formData: req.body,
      });
    }
  }
);

// GET Route for Edit Rental Form ("/rentals/edit/:id")
router.get(
  "/edit/:id",
  checkAuthenticated,
  checkRole("Data Entry Clerk"),
  async (req, res) => {
    try {
      // Find the rental by ID
      const rental = await Rental.findById(req.params.id).lean();
      if (!rental) {
        return res
          .status(404)
          .render("main", { content: "error", user: req.session.user || null });
      }

      // Render a form pre-filled with rental data
      res.render("main", {
        content: "rentalEditForm",
        rental: rental,
        user: req.session.user || null,
      });
    } catch (error) {
      console.error("Error fetching rental:", error);
      res
        .status(500)
        .render("main", { content: "error", user: req.session.user || null });
    }
  }
);

// POST Route for processing rental form submission ("/rentals/edit/:id")
router.post("/edit/:id", checkAuthenticated, checkRole("Data Entry Clerk"), upload.single("imageUrl"), async (req, res) => {
  try {
    const rentalToUpdate = await Rental.findById(req.params.id);

    if (!rentalToUpdate) {
      return res.status(404).render("main", { content: "error", user: req.session.user || null });
    }

    let imageUrl = rentalToUpdate.imageUrl;
    if (req.file && req.file.buffer) {
      // If a new file is uploaded, upload it to S3
      const fileKey = `${uuidv4()}${path.extname(req.file.originalname)}`;
      const params = {
        Bucket: process.env.MY_AWS_BUCKET_NAME,
        Key: `uploads/${fileKey}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: 'public-read'
      };

      try {
        const uploadResult = await s3.upload(params).promise();
        imageUrl = uploadResult.Location;

        // Delete old image from S3
        const oldFileKey = extractKeyFromUrl(rentalToUpdate.imageUrl);
        if (oldFileKey) {
          await s3.deleteObject({ Bucket: process.env.MY_AWS_BUCKET_NAME, Key: oldFileKey }).promise();
        }
      } catch (err) {
        console.error("Error uploading file to S3:", err);
        return res.status(500).render("main", {
          content: "error",
          user: req.session.user || null
        });
      }
    }

    // Update the rental with new data
    await Rental.findByIdAndUpdate(req.params.id, {
      ...req.body,
      imageUrl: imageUrl,
      featuredRental: req.body.featuredRental === 'on',
    }, { new: true, runValidators: true });

    res.redirect("/rentals/list");
  } catch (error) {
    console.error("Error updating rental:", error);
    res.status(500).render("main", {
      content: "rentalEditForm",
      errors: { message: "Failed to update rental. Please try again." },
      rental: req.body,
      user: req.session.user || null
    });
  }
});

// GET Route for Delete Rental Form ("/rentals/remove/:id")
router.get(
  "/remove/:id",
  checkAuthenticated,
  checkRole("Data Entry Clerk"),
  async (req, res) => {
    try {
      const rental = await Rental.findById(req.params.id).lean();
      if (!rental) {
        return res
          .status(404)
          .render("main", { content: "error", user: req.session.user || null });
      }

      // Render a confirmation page with rental details
      res.render("main", {
        content: "deleteRentalConfirmation",
        rental: rental,
        user: req.session.user || null,
      });
    } catch (error) {
      console.error("Error fetching rental:", error);
      res
        .status(500)
        .render("main", { content: "error", user: req.session.user || null });
    }
  }
);

// POST Route for processing delete rental form submission ("/rentals/remove/:id")
router.post(
  "/remove/:id",
  checkAuthenticated,
  checkRole("Data Entry Clerk"),
  async (req, res) => {
    try {
      const rental = await Rental.findById(req.params.id);
      if (rental && rental.imageUrl) {
        // Extract the S3 key from the URL
        const fileKey = extractKeyFromUrl(rental.imageUrl);
        if (fileKey) {
          // Delete the file from S3
          await s3.deleteObject({ Bucket: process.env.MY_AWS_BUCKET_NAME, Key: fileKey }).promise();
        }
      }

      await Rental.deleteOne({ _id: req.params.id });
      res.redirect("/rentals/list");
    } catch (error) {
      console.error("Error removing rental:", error);
      res
        .status(500)
        .render("main", { content: "error", user: req.session.user || null });
    }
  }
);

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


function extractKeyFromUrl(url) {
  // Extract the S3 key from the file URL
  const matches = url.match(/\/uploads\/(.+)$/);
  return matches ? matches[1] : null;
}

module.exports = router;
