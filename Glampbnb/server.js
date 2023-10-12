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
const rentalsDb = require("./models/rentals-db");
const express = require("express");
const app = express();

// Set EJS as the view engine
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Route handler for the home page ("/")
app.get("/", (req, res) => {
    // Fetch the featured rentals from the rentals-db module
    const featuredRentals = rentalsDb.getFeaturedRentals();

    // Render the 'main.ejs' template and pass the featured rentals / features for home page
    res.render("main", { content: "home", featuredRentals });
});

// Route handler for the rentals page ("/rentals")
app.get("/rentals", (req, res) => {
    const allRentals = rentalsDb.getRentalsByCityAndProvince();

    // Render the 'main.ejs' template and pass rental data for the rentals page
    res.render("main", { content: "rentals", allRentals });

});

// Route handler for the registration page ("/sign-up")
app.get("/signup", (req, res) => {
    res.render("main", { content: "sign-up" });
});

// Route handler for the login page ("/log-in")
app.get("/login", (req, res) => {
    res.send("Log in to your account.");
});


// *** DO NOT MODIFY THE LINES BELOW ***

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send("Something broke!")
});

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
app.listen(HTTP_PORT, onHttpStart);