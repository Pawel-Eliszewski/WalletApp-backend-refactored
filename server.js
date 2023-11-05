const app = require("./app");
const mongoose = require("mongoose");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const DB = process.env.DB_HOST;

const connection = mongoose.connect(DB, {
  dbName: "db-wallet-app",
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connection
  .then(() => {
    app.listen(PORT, async () => {
      console.log(
        `Server running. Database connection successful. Use API on port: ${PORT}`
      );
    });
  })
  .catch((err) => {
    console.error(`Server not running. Error message: ${err.message}`);
    process.exit(1);
  });
