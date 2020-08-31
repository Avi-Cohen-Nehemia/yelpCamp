// require express and savee express.Router to a variable
const express = require("express");
const router = express.Router({ mergeParams: true });

// import relevant models
const Campground = require("../models/campground");
const Review = require("../models/review");

// require the middleware index.js file
const middleware = require("../middleware");

// function to calculate the reviews average of a specific campground
const calculateAverage = (reviews) => {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

// ==========================
//     REVIEWS ROUTES
// ==========================
// INDEX - route to show all reviews related to a specific campground
router.get("/", (req, res) => {
    Campground.findById(req.params.id).populate({
        path: "reviews",
        options: {sort: {createdAt: -1}} // sorting the populated reviews array to show the latest first
    }).exec((err, campground) => {
        if (err || !campground) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/index", {campground: campground});
    });
});

// NEW route - render the submit review form for a specific campground
// middleware.hasAlreadyReviewd checks if a user already reviewed the campground, only one review per user is allowed
router.get("/new", middleware.isLoggedIn, middleware.hasAlreadyReviewd, (req, res) => {
	// find the campground by id
	Campground.findById(req.params.id, (error, foundCampground) => {
		if(error) {
			console.log(error);
		} else {
			res.render("reviews/new", { campground: foundCampground });
		}
	});
});

// CREATE route - add a new review to a specific campground
router.post("/", middleware.isLoggedIn, middleware.hasAlreadyReviewd, (req, res) => {
	// find the campground by id
	Campground.findById(req.params.id).populate("reviews").exec((error, foundCampground) => {
		if(error) {
			req.flash("error", "Something went wrong");
			return res.redirect("back");
		} else {
			// create and add the review to the DB using the data from the form
			Review.create(req.body.review, (error, newReview) => {
				if (error) {
					req.flash("error", err.message);
                	return res.redirect("back");
				} else {
                    // take the current user's details and reviewed campground and save them to the review
                    newReview.author.id = req.user._id;
					newReview.author.username = req.user.username;
					newReview.campground = foundCampground;
                    newReview.save();
					// add the new review to the campground
					foundCampground.reviews.push(newReview);
					// calculate the new average review for the campground
					foundCampground.rating = calculateAverage(foundCampground.reviews);
					foundCampground.save();
					req.flash("success", "Your review has been added successfully.");
					return res.redirect(`/campgrounds/${foundCampground._id}`);
				}
			});
		}
	});
});

// EDIT route - will render the edit page for a specific review
router.get("/:review_id/edit", middleware.isTheReviewOwner, (req, res) => {
	Campground.findById(req.params.id, (error, foundCampground) => {
		if (error || !foundCampground) {
			req.flash("error", "Campground not found");
			return res.redirect("/campgrounds");
		}
		Review.findById(req.params.review_id, (error, foundReview) => {
			if (error || !foundReview) {
				req.flash("error", "Review not found");
				return res.redirect("/campgrounds");
			} else {
				res.render("reviews/edit", { campground: foundCampground, review: foundReview });
			}
		});
	});
});

// UPDATE route - will update the review's details when submitting the edit form
router.put("/:review_id", middleware.isTheReviewOwner, (req, res) => {
	Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, (error, updatedReview) => {
        if (error) {
            req.flash("error", error.message);
            return res.redirect("back");
        }
        Campground.findById(req.params.id).populate("reviews").exec((error, foundCampground) => {
            if (error) {
                req.flash("error", error.message);
                return res.redirect("back");
            }
            // recalculate foundCampground average
            foundCampground.rating = calculateAverage(foundCampground.reviews);
            //save changes
            foundCampground.save();
            req.flash("success", "Your review has been edited successfully.");
            res.redirect(`/campgrounds/${foundCampground._id}`);
        });
    });
});

// DESTROY route - will delete a specific review
router.delete("/:review_id", middleware.isTheReviewOwner, (req, res) => {
	Review.findByIdAndRemove(req.params.review_id, (error) => {
        if (error) {
            req.flash("error", error.message);
            return res.redirect("back");
        }
        Campground.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec((error, foundCampground) => {
            if (error) {
                req.flash("error", error.message);
                return res.redirect("back");
            }
            // recalculate the foundCampground reviews average
            foundCampground.rating = calculateAverage(foundCampground.reviews);
            //save changes
            foundCampground.save();
            req.flash("success", "Your review was deleted successfully.");
            res.redirect("/campgrounds/" + req.params.id);
        });
    });
});

// export the routes to use them in app.js
module.exports = router;