const jwt = require("jsonwebtoken");
const Register = require("../models/register");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwtToken;
    const decoded = await jwt.verify(token, process.env.SECRET_KEY_TOKEN);

    const user = await Register.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    res.status(404).send({ error: "Please authenticate" });
  }
};

module.exports = auth;
