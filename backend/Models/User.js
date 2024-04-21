const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: 'Email address is required',
    },
    phone: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 15,
    },
    passwordHash: {
      type: String,
      required: true,
      minLength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minLength: 3,
      maxLength: 30,
    },
    emailConfirmationToken: {
      type: Number,
      required: true,
      unique: true,
    },
    emailConfirmationTokenTimeToDie: {
      type: Date,
      default: () => Date.now() + 3600 * 1000, // Adds 1 hour to the current time
    },
    emailConfirmationTokenTimeIssued: {
      type: Date,
      default: () => Date.now(),
    },
    emailConfirmationFlag: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = new mongoose.model('User', UserSchema);

module.exports = { UserModel };
