// Model for User
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import uniqueValidator from "mongoose-unique-validator";

// TODO: add uniqueness and email validations to email
const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
      unique: true
    },
    passwordHash: { type: String, required: true },
    hcp: {type: Float32Array, required: false},
    confirmed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

schema.methods.isValidPassword = function isValidPassword(password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

// Method for encrypting pasword
schema.methods.setPassword = function setPassword(password) {
  this.passwordHash = bcrypt.hashSync(password, 10);
};

// Function that will create object that we want to pass down to our client.
// We don't want to pass down the whole record (password hash etc)
schema.methods.toAuthJSON = function toAuthJSON() {
  return {
    email: this.email,
    confirmed: this.confirmed,
    token: this.generateJWT()
  };
};

schema.methods.setHCP = function setHCP(hcp) {
  this.hcp = hcp;
}

// Generates the JSON web token with secretkey for encryption
schema.methods.generateJWT = function generateJWT() {
  return jwt.sign(
    {
      email: this.email
    },
    process.env.JWT_SECRET
  );
};

schema.plugin(uniqueValidator, {
  message: "There is already an account with this email"
});

export default mongoose.model("User", schema);
