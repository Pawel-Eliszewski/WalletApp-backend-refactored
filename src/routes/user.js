import { Router } from "express";
import jwt from "jsonwebtoken";
import auth from "../middlewares/auth.js";
import { nanoid } from "nanoid";
import {
  findUserByEmail,
  findUserById,
  findUserByVerificationToken,
  registerUser,
  updateUser,
  authenticateUser,
  setToken,
} from "../controllers/user.js";
import { getUserTransactions } from "../controllers/transaction.js";
import {
  userLoginSchema,
  userRegisterSchema,
} from "../utils/validationSchemas.js";
import sendVerificationEmail from "../utils/sendVerificationEmail.js";
import "dotenv/config";

const router = Router();
const secret = process.env.SECRET_KEY;

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 4
 *               firstname:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 10
 *     responses:
 *       '201':
 *         description: User registered successfully
 *       '400':
 *         description: Bad Request, validation error or email in use
 */

router.post("/register", async (req, res, next) => {
  try {
    const { error, value } = userRegisterSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        status: "Conflict",
        message: "Validation error",
        details: error.details,
      });
      return;
    }
    const { email, password, firstname } = value;
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({
        status: "Conflict",
        message: "Email in use",
      });
    } else {
      const verificationToken = nanoid();
      const user = await registerUser(
        email,
        password,
        firstname,
        verificationToken
      );
      sendVerificationEmail(email, firstname, verificationToken);
      res.status(201).json({
        status: "Success",
        data: user,
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/verify/:verificationToken", async (req, res, next) => {
  const { verificationToken } = req.params;
  const user = await findUserByVerificationToken(verificationToken);

  if (!user) {
    return res.status(404).json({
      status: "Bad request",
      message: "User not found",
    });
  }
  try {
    await updateUser(user.id, {
      verify: true,
      verificationToken: null,
    });
    return res.status(200).json({
      status: "Success",
      message: "Verification successful",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login to the application
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 4
 *     responses:
 *       '200':
 *         description: User logged in successfully
 *       '400':
 *         description: Bad Request, validation error or authentication failed
 */

router.post("/login", async (req, res, next) => {
  try {
    const { error, value } = userLoginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "Bad Request",
        message: "Validation error",
        details: error.details,
      });
    }
    const { email, password } = value;
    const user = await findUserByEmail(email);
    const userAuth = await authenticateUser(email, password);

    if (userAuth) {
      const payload = {
        id: user.id,
        firstname: user.firstname,
        verified: user.verified,
      };

      if (!user.verified) {
        return res.status(400).json({
          status: "Failure",
          message: "User not verified",
        });
      }

      //DemoUser
      const userIdAllowedWithoutToken = "650f2fb1143d76a0d93a0176";

      if (user.id !== userIdAllowedWithoutToken) {
        const token = jwt.sign(payload, secret, { expiresIn: "1h" });
        await setToken(user.email, token);

        return res.status(200).json({
          status: "Success",
          data: {
            ID: user._id,
            email: user.email,
            firstname: user.firstname,
            token: token,
          },
        });
      } else {
        return res.status(200).json({
          status: "Success",
          data: {
            ID: user._id,
            email: user.email,
            firstname: user.firstname,
            token: null,
          },
        });
      }
    } else {
      return res.status(400).json({
        status: "failure",
        message: "Wrong email or password",
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/**
 * @swagger
 * /user/current:
 *   get:
 *     summary: Current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User authenticated, showing email and balance
 */

router.get("/current", auth, async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json({
      status: "Success",
      data: user,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/**
 * @swagger
 * /user/logout:
 *   get:
 *     summary: Logout the authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User logged out successfully
 */

router.get("/logout", auth, async (req, res, next) => {
  const { email } = req.user;
  await setToken(email, null);
  res.status(200).json({
    status: "Success",
    data: {
      message: `Successfully logged out user: ${email}`,
    },
  });
});

/**
 * @swagger
 * /user/{userId}/transactions:
 *   get:
 *     summary: Get transactions for a user by user ID
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Transactions retrieved successfully
 *       '400':
 *         description: Bad Request, user has no transactions
 *       '404':
 *         description: User not found
 */

router.get("/:userId/transactions", auth, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({
        status: "Failure",
        message: "User not found",
      });
    } else {
      const transactions = await getUserTransactions(userId);
      if (!transactions) {
        res.status(400).json({
          status: "Failure",
          message: "User has no transactions in his history",
        });
      } else {
        res.status(200).json({
          status: "Success",
          data: transactions,
        });
      }
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

export default router;
