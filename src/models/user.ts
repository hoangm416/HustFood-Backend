import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  addressLine1: {
    type: String,
  },
  phone: {
    type: String,
  },
  idCard: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);
export default User;