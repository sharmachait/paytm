const express = require('express');
const AuthRouter = require('./AuthRouter');
const IndexRouter = express.Router();

//api/v1/auth
IndexRouter.use('/auth', AuthRouter);

module.exports = IndexRouter;
