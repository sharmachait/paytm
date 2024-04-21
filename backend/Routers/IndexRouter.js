const express = require('express');
const AuthRouter = require('./AuthRouter');
const UserRouter = require('./UserRouter');
const AccountRouter = require('./AccountRouter.js');
const IndexRouter = express.Router();

//api/v1/auth
IndexRouter.use('/auth', AuthRouter);

//api/v1/user
IndexRouter.use('/user', UserRouter);

//api/v1/account
IndexRouter.use('/account', AccountRouter);

module.exports = IndexRouter;
