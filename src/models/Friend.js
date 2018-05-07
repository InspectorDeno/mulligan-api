import mongoose from "mongoose";
import findByWhatever from "mongoose-find-by-whatever";

const schema = new mongoose.Schema(
  {
    requesting: {
      type: String,
      required: true
    },
    requested: {
      type: String,
      required: true
    }
  }
);

schema.methods.addFriend = function addFriend(requesting, requested) {
  this.requesting = requesting.email;
  this.requested = requested.email;
};

schema.methods.setAccept = function setAccept() {
  this.accepted = true;
};

schema.plugin(findByWhatever, [
  { requesting: '*' },
  { requested: '*' }
]);

export default mongoose.model("Friend", schema);
