const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const UserModel = require('./Models/User');
const AuthRouter = require('./Routers/AuthRouter');
dotenv.config();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const jwtSecret = process.env.JwtSecret;
const bcryptsalt = bcrypt.genSaltSync(10);

async function startup() {
  try {
    await mongoose.connect(process.env.MONGOURL);
    const app = express();
    app.use(
      cors({
        credentials: true,
        origin: process.env.ClientUrl,
      })
    );
    app.use(express.json());
    app.use(cookieParser());
    app.use('/auth', AuthRouter);
    const server = app.listen(
      process.env.PORT,
      console.log(`listening on ${process.env.PORT}`)
    );
  } catch (e) {
    console.log('error starting up the server: ' + e);
  }
}
startup();
