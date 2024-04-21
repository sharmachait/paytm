const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const AccountModel = require('../Models/Balance');
const mongoose = require('mongoose');
AccountRouter = express.Router();

AccountRouter.get('/balance', authMiddleware, async (req, res) => {
  try {
    const accountDoc = AccountModel.findOne({ userId: req.userId });
    res.status(200).json({ balance: accountDoc.balance });
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal server error');
  }
});

AccountRouter.post('/transfer', authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { to, amount } = req.body;
  try {
    const senderAccount = await AccountModel.findOne({
      userId: req.userId,
    }).session(session); //this makes it so that if anyone else updates the entry we read this transaction will fail

    if (!senderAccount || senderAccount.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: 'Insufficient balance',
      });
    }

    const receiverAccount = await AccountModel.findOne({ userId: to }).session(
      session
    );
    if (!receiverAccount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: 'Invalid Account',
      });
    }

    const updateAmountSender = { balance: senderAccount.balance - amount };
    const updateAmountReceiver = {
      balance: receiverAccount.balance + amount,
    };

    await AccountModel.updateOne(
      { userId: senderAccount._id },
      updateAmountSender
    ).session(session);

    await AccountModel.updateOne(
      { userId: receiverAccount._id },
      updateAmountReceiver
    ).session(session);

    // Commit the transaction
    await session.commitTransaction();

    res.json({
      message: 'Transfer successful',
    });
  } catch (e) {
    console.log(e);
    await session.abortTransaction();
    res.status(500).send('Internal server error');
  }
});

// AccountRouter.post("/transfer", authMiddleware, async (req, res) => {
//     const session = await mongoose.startSession();
//
//     session.startTransaction();
//     const { amount, to } = req.body;
//
//     // Fetch the accounts within the transaction
//     const account = await Account.findOne({ userId: req.userId }).session(session);
//
//     if (!account || account.balance < amount) {
//         await session.abortTransaction();
//         return res.status(400).json({
//             message: "Insufficient balance"
//         });
//     }
//
//     const toAccount = await Account.findOne({ userId: to }).session(session);
//
//     if (!toAccount) {
//         await session.abortTransaction();
//         return res.status(400).json({
//             message: "Invalid account"
//         });
//     }
//
//     // Perform the transfer
//     await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
//     await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);
//
//     // Commit the transaction
//     await session.commitTransaction();
//     res.json({
//         message: "Transfer successful"
//     });
// });

module.exports = AccountRouter;
