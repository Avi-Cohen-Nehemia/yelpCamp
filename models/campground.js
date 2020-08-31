const mongoose = require("mongoose");

// schema setup
const CampgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
    description: String,
    price: String,
    location: String,
    lat: Number,
    lng: Number,
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        username: String,
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
});

// define and export new object using the schema created above
module.exports =  mongoose.model("Campground", CampgroundSchema);