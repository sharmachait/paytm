const express = require('express');
const { UserModel } = require('../Models/User');
const AuthRouter = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const zod = require('zod');
const PublishMessage = require('../Utils/MessageBus');
const AccountModel = require('../Models/Balance');

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

const userZodSchema = zod.object({
  email: zod
    .string()
    .trim()
    .toLowerCase()
    .email('Not a valid Email')
    .min(5, 'Email should have atleast 5 characters'),
  phone: zod.string().min(10).max(15),
  passwordHash: zod.string().min(6),
  name: zod
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Name too small')
    .max(30, 'Name too long'),
  emailConfirmationToken: zod.number().min(100000),
  emailConfirmationFlag: zod.boolean(),
});

const loginZodSchema = zod.object({
  email: zod
    .string()
    .trim()
    .toLowerCase()
    .email('Not a valid Email')
    .min(5, 'Email should have atleast 5 characters'),
  passwordHash: zod.string().min(6),
});

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
    };

    let parsedResult = userZodSchema.safeParse(UserObject);

    PublishMessage({ email: 'chait8126@gmail.com', confirmationToken });

    if (parsedResult.success) {
      const UserDoc = await UserModel.create(UserObject);

      await AccountModel.create({
        userId: UserDoc._id,
        balance: 1 + Math.random() * 10000,
      });

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

AuthRouter.post('/verify', async (req, res) => {
  try {
    const { email, token } = req.body;
    const userDoc = await UserModel.findOne({ email: email });
    if (userDoc.emailConfirmationToken !== parseInt(token)) {
      return res.status(400).send('wrong token');
    }
    if (userDoc.emailConfirmationTokenTimeToDie < Date.now()) {
      return res.status(400).send('expired token');
    }
    await UserModel.updateOne(
      { email: email },
      { emailConfirmationFlag: true }
    );
    res.status(201).send('verified');
  } catch (e) {
    console.log(e);
    res.status(400).json({ e });
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

    const userDoc = await UserModel.findOne({ email: email });

    if (!userDoc.emailConfirmationFlag) {
      res.status(401).json({ msg: 'Account not verified' });
    } else if (!bcrypt.compareSync(password, userDoc.passwordHash)) {
      res.status(401).json({ msg: 'Incorrect credentials' });
    } else {
      let token = jwt.sign({ id: userDoc._id, email }, jwtSecret);
      res
        .cookie('token', token, { sameSite: 'none', secure: true })
        .status(201)
        .json({ id: userDoc._id, email });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
  }
});

module.exports = AuthRouter;
