const express = require('express');

const AuthRouter = express.Router();
AuthRouter.get('/register', async (req, res) => {
  try {
    res.send('ok');
  } catch (e) {
    console.log(e);
  }
});
module.exports = AuthRouter;
