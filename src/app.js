require("dotenv").config();
const express = require("express");
require("../db/mongoose");
const hbs = require("hbs");
const path = require("path");
const PORT = process.env.PORT || 5000;
const Register = require("../models/register");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const cookieParser = require("cookie-parser");

const app = express();

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../views"));
hbs.registerPartials(path.join(__dirname, "../views/partials"));

app.use(express.static(path.join(__dirname, "../public")));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/secret", auth, (req, res) => {
  res.render("secret");
});

app.post("/register", async (req, res) => {
  if (req.body.password !== req.body.confirmpassword) {
    return res.status(400).send({ error: "password not matched" });
  }

  try {
    const createRegister = new Register(req.body);

    const token = await createRegister.generateAuthToken();

    res.cookie("jwtToken", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 900000),
    });

    const saveRegister = await createRegister.save();

    res.status(201).render("index");
  } catch (err) {
    res.status(400).send({ error: `something goes wrong ${err}` });
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const registeredUser = await Register.findOne({ email });

    if (!registeredUser) {
      return res.status(404).send({ message: "user not found!" });
    }

    const check = await bcrypt.compare(password, registeredUser.password);

    if (!check) {
      return res.status(400).send({ error: "invalid credentials" });
    }

    const token = await registeredUser.generateAuthToken();

    res.cookie("jwtToken", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 900000),
    });

    res.render("index");
  } catch (err) {
    res.status(400).send({ error: "user not found!" });
  }
});

app.get("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    res.clearCookie("jwtToken");
    // console.log("logout success");

    await req.user.save();
    res.render("login");
  } catch (error) {
    res.status(500).send({ error });
  }
});

app.get("/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens = [];

    res.clearCookie("jwtToken");
    // console.log("logout success");

    await req.user.save();
    res.render("login");
  } catch (error) {
    res.status(500).send({ error });
  }
});

app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
});
