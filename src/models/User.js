// Model for User
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import uniqueValidator from "mongoose-unique-validator";
import findByWhatever from "mongoose-find-by-whatever";

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
    unique: true
  },
  username: {
    type: String,
    required: false,
    lowercase: true,
    unique: true
  },
  gender: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  hcp: {
    value: {
      type: Number,
      required: true,
      default: "36.0"
    },
    sethcp: {
      type: Boolean,
      default: false
    }
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  confirmationToken: {
    type: String,
    default: ""
  },
  friends: [
    {
      email: { type: String }
    }
  ],
  scorecards: [
    {
      date: { type: String, required: true },
      players: [
        {
          playerName: { type: String, required: true },
          playerHcp: { type: Number, required: true },
          playerGender: { type: String, required: true },
          playerTee: { type: String, required: true }
        }
      ],
      golfclub: { type: String, required: true },
      golfholes: [
        {
          number: { type: Number, required: true },
          index: { type: Number, required: true },
          par: { type: Number, required: true }
        }
      ],
      scores: [{}],
      stats: [],
      weather: {}
    }
  ]
});

schema.methods.isValidPassword = function isValidPassword(password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

// Method for generating a confirmation token
schema.methods.setConfirmationToken = function setConfirmationToken() {
  this.confirmationToken = this.generateJWT();
};

schema.methods.generateConfirmationUrl = function generateConfirmationUrl() {
  return `${process.env.HOST}/confirmation/${this.confirmationToken}`;
};

// Method for encrypting pasword
schema.methods.setPassword = function setPassword(password) {
  this.passwordHash = bcrypt.hashSync(password, 10);
};

schema.methods.changeUsername = function changeUsername(username) {
  this.username = username;
};

// Function that will create object that we want to pass down to our client.
// We don't want to pass down the whole record (password hash etc)
schema.methods.toAuthJSON = function toAuthJSON() {
  return {
    email: this.email,
    username: this.username,
    gender: this.gender,
    hcp: this.hcp,
    confirmed: this.confirmed,
    token: this.generateJWT()
  };
};

schema.methods.toGeneric = function toGeneric() {
  return {
    username: this.username,
    gender: this.gender,
    hcp: this.hcp.value
  };
};

// This generates the link to attach in the email
schema.methods.generateResetPasswordLink = function generateResetPasswordLink() {
  return `${
    process.env.HOST
    }/reset_password/${this.generateResetPasswordToken()}`;
};

// Not so secure method to generate a reset password token that lasts for like, an hour
schema.methods.generateResetPasswordToken = function generateResetPasswordToken() {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h"
    }
  );
};

schema.methods.setHCP = function setHCP(hcp) {
  this.hcp.value = hcp;
  this.hcp.sethcp = true;
};

// Generates the JSON web token with secretkey for encryption
schema.methods.generateJWT = function generateJWT() {
  return jwt.sign(
    {
      email: this.email,
      username: this.username,
      gender: this.gender,
      hcp: this.hcp,
      confirmed: this.confirmed
    },
    process.env.JWT_SECRET
  );
};

schema.methods.addFriend = function addFriend(friend) {
  const theFriend = { email: friend.email };
  this.friends.push(theFriend);
};

schema.methods.addScorecard = function addScorecard(data, weatherdata) {
  const theScorecard = {
    date: data.golfdate,
    players: data.golfplayers,
    golfclub: data.golfclub,
    golfholes: data.golfholes,
    scores: data.golfscores,
    stats: data.golfstats,
    weather: weatherdata.currently
  };
  this.scorecards.push(theScorecard);
};

schema.plugin(uniqueValidator, {
  message: "Already taken"
});
schema.plugin(findByWhatever, [
  {
    email: /@/
  },
  {
    username: "*"
  }
]);

export default mongoose.model("User", schema);
