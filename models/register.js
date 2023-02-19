const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerSchema = new mongoose.Schema({
  fname: {
    type: String,
    require: true,
  },
  lname: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
    validate(val) {
      if (!validator.isEmail(val)) {
        throw new Error("Invalid email");
      }
    },
  },
  gender: {
    type: String,
    require: true,
    default: "male",
  },
  age: {
    type: Number,
    require: true,
    validate(val) {
      if (val < 0 || val > 150) {
        throw new Error("Invalid age");
      }
    },
  },
  phone: {
    type: String,
    require: true,
    unique: true,
    validate(val) {
      if (val.length != 10) {
        throw new Error("Invalid phone number");
      }
    },
  },
  password: {
    type: String,
    require: true,
    minlength: 4,
  },
  confirmpassword: {
    type: String,
    require: true,
    minlength: 4,
  },
  tokens: [
    {
      token: {
        type: String,
        require: true,
      },
    },
  ],
});

//token generate method
registerSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY_TOKEN);
    this.tokens = await this.tokens.concat({ token });
    await this.save();
    return token;
  } catch (err) {
    res.status(400).send({ error: "unable to generate token" });
  }
};

//Hash password
registerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
    this.confirmpassword = undefined; // this field not save in database
  }

  next();
});

const Register = new mongoose.model("Register", registerSchema);

module.exports = Register;
