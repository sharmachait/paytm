const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  balance: {
    type: Number,
    required: true,
  },
});

const AccountModel = new mongoose.model('Account', AccountSchema);

module.exports = AccountModel;
