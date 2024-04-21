require('dotenv').config();
const jwt = require('jsonwebtoken');
async function authMiddleware(req, res, next) {
  try {
    let jwtSecret = process.env.JWTSECRET;
    const cookie = req.cookies;
    if (!cookie) throw new Error('No cookie');
    const token = cookie.token;
    if (!token) throw new Error('No token');
    let decodedJson = await jwt.verify(token, jwtSecret);
    let { id, email } = decodedJson;
    req.email = email;
    req.userId = id;
    next();
  } catch (e) {
    console.log({ error: e });
  }
}
module.exports = authMiddleware;
