const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const zod = require('zod');
const { UserModel } = require('../Models/User');
const UserRouter = express.Router();

const userUpdateZodSchema = zod
  .object({
    email: zod
      .string()
      .trim()
      .toLowerCase()
      .email('Not a valid Email')
      .min(5, 'Email should have atleast 5 characters')
      .optional(),
    phone: zod.string().min(10).max(15).optional(),
    password: zod
      .string()
      .min(8)
      .max(32)
      .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
        message: 'weak password',
      })
      .optional(),
    confirmPassword: zod.string().min(6).optional(),
    name: zod
      .string()
      .trim()
      .toLowerCase()
      .min(3, 'Name too small')
      .max(30, 'Name too long')
      .optional(),
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: 'Passwords dont match',
    path: ['confirmPassword'],
  });

UserRouter.patch('/update/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;

    const { success } = userUpdateZodSchema.safeParse(req.body);

    if (!success) {
      throw new Error('invalid input');
    }

    const updateCount = await UserModel.updateOne({ _id: id }, req.body);

    res.json({ message: 'updated' });
  } catch (e) {
    console.log(e);
    res.status(411).send('error');
  }
});
//getByFilter/?filter="something"
UserRouter.get('/getByFilter', authMiddleware, async (req, res) => {
  try {
    const filter = req.query.filter || '';

    const usersDoc = await UserModel.find({}).where('name').regex(filter);

    let users = [];

    for (let userDoc of usersDoc) {
      users.push({
        name: userDoc.name,
        email: userDoc.email,
        phone: userDoc.phone,
        _id: userDoc._id,
      });
    }

    res.status(200).json(users);
  } catch (e) {
    console.log(e);
    res.status(404).send('NotFound');
  }
});

module.exports = UserRouter;
