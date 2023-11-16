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
require("dotenv").config();
const bodyParser = require("body-parser");
const formData = require("form-data");
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const generalController = require("./controllers/generalController");
const rentalController = require("./controllers/rentalsController");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const apiKey = process.env.MAILGUN_API_KEY;
const domain = process.env.MAILGUN_DOMAIN;
const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY});

// Set EJS as the view engine
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// Define routes using the general and rentals controllers
app.use('/', generalController);
app.use('/rentals', rentalController);

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

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
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Call this function after the http server starts listening for requests.
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
app.listen(HTTP_PORT, onHttpStart);
