const mongoose = require("mongoose");
// import passport-local-mongoose for authentication
const passportLocalMongoose = require("passport-local-mongoose");

// schema setup
const UserSchema = new mongoose.Schema({
	username: String,
	password: String,
});

// connect passport-local-mongoose to our user schema
// which will give it additional methods we can apply to it
UserSchema.plugin(passportLocalMongoose);

// define and export new object using the schema created above
module.exports =  mongoose.model("User", UserSchema);