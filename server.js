const path = require("path");
const rentalsDb = require("./models/rentals-db");
const express = require("express");
// const session = require("express-session");
const clientSessions = require("client-sessions");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const generalController = require("./controllers/generalController");
const rentalController = require("./controllers/rentalsController");
const loadDataController = require("./controllers/loadDataController");

const app = express();
// app.use(
//   session({
//     secret: process.env.EXPRESS_SESSION_SECRET_KEY,
//     resave: false,
//     saveUninitialized: true,
//   })
// );
app.use(clientSessions({
  cookieName: 'session', // cookie name,
  secret: process.env.CLIENT_SESSION_SECRET_KEY, // long random string
  duration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  activeDuration: 1000 * 60 * 5 // extend the session active duration by 5 minutes
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set EJS as the view engine
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// Define routes using the controllers
app.use("/", generalController);
app.use("/rentals", rentalController);
app.use('/load-data/rentals', loadDataController);

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

// connect to db using mongoose
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => {
    console.log("Connected to MongoDB");
    // Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
    // because sometimes port 80 is in use by other applications on the machine
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });
