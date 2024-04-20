const express = require('express');
const { UserModel, userZodSchema, loginZodSchema } = require('../Models/User');
const AuthRouter = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const zod = require('zod');
const PublishMessage = require('../Utils/MessageBus');

const jwtSecret = process.env.JwtSecret;
const bcryptsalt = bcrypt.genSaltSync(10);

async function ConfirmationTokenGenerator() {
  let randomNumber = Math.floor(Math.random() * 900000) + 100000;
  console.log({ randomNumber });
  const recreate = await UserModel.findOne({
    emailConfirmationToken: randomNumber,
  });
  if (recreate) {
    randomNumber = await ConfirmationTokenGenerator();
  }
  return randomNumber;
}

AuthRouter.post('/register', async (req, res) => {
  try {
    const { email, phone, name, password } = req.body;

    const passwordHash = bcrypt.hashSync(password, bcryptsalt);

    let confirmationToken = await ConfirmationTokenGenerator();

    const UserObject = {
      name: name,
      phone: phone,
      passwordHash: passwordHash,
      email: email,
      emailConfirmationToken: confirmationToken,
      emailConfirmationFlag: true,

      // name: 'name',
      // phone: '123456789076',
      // passwordHash: 'passwordHash',
      // email: 'chait8126@gmail.com',
      // emailConfirmationToken: confirmationToken,
      // emailConfirmationFlag: true,
    };
    let parsedResult = userZodSchema.safeParse(UserObject);

    PublishMessage({ email: 'chait8126@gmail.com', confirmationToken });

    if (parsedResult.success) {
      const UserDoc = await UserModel.create(UserObject);
      let token = jwt.sign(
        { id: UserDoc._id, email: 'chait8126@gmail.com' },
        jwtSecret
      );
      res.status(201).cookie('token', token).send('User Registered');
    } else {
      console.log(parsedResult.error);
      throw new Error('invalid input');
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
  }
});

AuthRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const passwordHash = bcrypt.hashSync(password, bcryptsalt);

    const loginObject = {
      passwordHash: passwordHash,
      email: email,
    };

    let { success } = loginZodSchema.safeParse(loginObject);

    if (!success) {
      res.status(402).send('invalid input');
      return;
    }

    const userDoc = UserModel.findOne({ email });

    if (!userDoc.emailConfirmationFlag) {
      res.status(401).json({ msg: 'Account not verified' });
    } else if (passwordHash !== userDoc.password) {
      res.status(401).json({ msg: 'Incorrect credentials' });
    } else {
      let token = jwt.sign({ id: userDoc._id, email }, jwtSecret);
      res
        .cookie('token', token, { sameSite: 'none', secure: true })
        .status(201)
        .json({ id: UserDoc._id, username });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
  }
});

module.exports = AuthRouter;
