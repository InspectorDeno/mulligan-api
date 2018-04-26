import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    requesting: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    requested: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    accepted: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  { timestamp: true }
);

schema.methods.addFriend = function addFriend(requesting, requested) {
  this.requesting = requesting;
  this.requested = requested;
};
