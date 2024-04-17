const mongoose = require('mongoose');
let validateEmail = function (email) {
  let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: 'Email address is required',
      validate: [validateEmail, 'Please fill a valid email address'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address',
      ],
    },
    phone: String,
    password: String,
    name: String,
    emailConfirmationToken: {
      type: String,
      required: true,
      unique: true,
    },
    emailConfirmedFlag: {
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
