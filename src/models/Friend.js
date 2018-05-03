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
  this.requesting = requesting._id;
  this.requested = requested._id;
};

schema.methods.setAccept = function setAccept() {
  this.accepted = true;
};

export default mongoose.model("Friend", schema);
