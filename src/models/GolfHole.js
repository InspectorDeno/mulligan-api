// Model for User
import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    club: { type: String, required: true, index: true },
    number: { type: Number, required: true, unique: true },
    index: { type: Number, required: true },
    par: { type: Number, required: true }
    // Consider adding like.. length
  },
  { timestamps: true }
);

schema.methods.addHole = function addHole(club, number, index, par) {
  this.club = club;
  this.number = number;
  this.index = index;
  this.par = par;
};

export default mongoose.model("GolfHole", schema);
