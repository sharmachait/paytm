const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const IndexRouter = require('./Routers/IndexRouter');
const cors = require('cors');
const cookieParser = require('cookie-parser');

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
    app.use('/api/v1', IndexRouter);
    const server = app.listen(
      process.env.PORT,
      console.log(`listening on ${process.env.PORT}`)
    );
  } catch (e) {
    console.log('error starting up the server: ' + e);
  }
}
startup();
