import express from "express";
import { json, urlencoded } from "express";
import cors from "cors";
import createError from "http-errors";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { serve, setup } from "swagger-ui-express";
import usersRouter from "./src/routes/user.js";
import transactionsRouter from "./src/routes/transaction.js";
import swaggerSpec from "./src/config/swagger.js";
import "./src/config/passport.js";

const app = express();
const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/user", usersRouter);
app.use("/transaction", transactionsRouter);
app.use("/api-docs", serve, setup(swaggerSpec));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(500).json({ message: err.message });
});

export default app;
