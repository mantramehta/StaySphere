const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

// Add authentication functionality to the schema
userSchema.plugin(passportLocalMongoose);

// Create the User model and export it
module.exports  = mongoose.model("User", userSchema);
