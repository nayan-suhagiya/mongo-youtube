const mongoose = require("mongoose");

mongoose.set({ strictQuery: true });
mongoose
  .connect(process.env.MONGO_CONNECTION_URL)
  .then((res) => {
    console.log("connection success!");
  })
  .catch((err) => {
    console.log("unable to connect!");
  });
