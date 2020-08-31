// ==========================
//          SETUP
// ==========================
// require packages
require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const expressSession = require("express-session");
const methodOverride = require("method-override");
const flash = require("connect-flash");
app.locals.moment = require('moment');

// require routes
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const indexRoutes = require("./routes/index");

// require models
const User = require("./models/user");

// require mongoose and connect to db
const mongoose = require("mongoose");
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost:27017/yelp_camp')
	.then(() => console.log('Connected to DB!'))
	.catch(error => console.log(error.message));

// require the seeding and seed the data base
// const seedDB = require("./seeds");
// seedDB();

// tell app to use connect-flash
app.use(flash());

// passport configuration
app.use(expressSession({
	secret: "yelpCamp",
	resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// tell app to use method override to enable us to make PUT requests
app.use(methodOverride("_method"));

// tell express to use body parser
app.use(bodyParser.urlencoded({extended: true}));

// make express process views as ejs files by default
app.set("view engine", "ejs");

// tell express to serve the public directory
app.use(express.static("./public"));

// middleware to make user information available to all routes
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

// tell app.js to use these route files which need to be declared
// at the bottom of app.js just before the listen method
// we can add a prefix to any route file which will be added to all the routes in that file
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

// set a port for the server to start on
let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Yelp Camp app started on port 3000");
});