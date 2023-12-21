import { Router } from "express";
const router = Router();
import "dotenv/config";
import auth from "../middlewares/auth.js";
import {
  addTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transaction.js";
import { findUserById } from "../controllers/user.js";

/**
 * @swagger
 * /transaction:
 *   post:
 *      summary: Post a new transaction for user
 *      tags: [Transactions]
 *      parameters:
 *          - in: query
 *            name: type
 *            schema:
 *              type: string
 *            required: true
 *            description: Type of transaction. Two possible variants, income or expense.
 *          - in: query
 *            name: category
 *            schema:
 *              type: string
 *            required: true
 *            description: Category of transaction, selectable from multiple choices.
 *          - in: query
 *            name: amount
 *            schema:
 *              type: number
 *            required: true
 *            description: Value needed to calculate user's balance and keep track of transaction's amounts
 *          - in: query
 *            name: date
 *            schema:
 *              type: date
 *            required: true
 *            description: Date of transaction
 *          - in: query
 *            name: comment
 *            schema:
 *              type: string
 *            required: true
 *            description: Comment for transaction
 *          - in: query
 *            name: owner
 *            schema:
 *              type: object
 *            required: true
 *            description: Object value needed to set owner of the promotion
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          '200':
 *            description: Transaction added successfully
 *          '400':
 *            description: Failure while adding transaction.
 */

router.post("/", auth, async (req, res, next) => {
  try {
    const { type, category, amount, date, comment, owner } = req.body;
    const createdTransaction = await addTransaction(
      type,
      category,
      amount,
      date,
      comment,
      owner
    );
    if (type === "income" || type === "expense") {
      res.json({
        status: "Success",
        code: 200,
        data: {
          _id: createdTransaction._id,
          type: createdTransaction.type,
          category: createdTransaction.category,
          amount: createdTransaction.amount,
          date: createdTransaction.date,
          comment: createdTransaction.comment,
          owner: createdTransaction.owner,
        },
      });
    } else {
      res.json({
        status: "Failure",
        code: 400,
        message: "Wrong transaction type",
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /:transactionId:
 *   delete:
 *      summary: Delete transaction
 *      tags: [Transactions]
 *      parameters:
 *          - in: query
 *            name: transactionId
 *            schema:
 *              type: object
 *            required: true
 *            description: Transaction unique ID
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          '200':
 *            description: Transaction removed successfully
 *          '404':
 *            description: Transaction does not exist
 */

router.delete("/:transactionId", auth, async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const transaction = await getTransactionById(transactionId);
    if (transaction) {
      await deleteTransaction(transactionId);
      const user = await findUserById(transaction.owner);
      res.json({
        status: "OK",
        code: 200,
        data: { _id: transactionId },
        message: "Transaction deleted",
      });
    } else {
      res.json({
        status: "Failure",
        code: 404,
        message: "Transaction not found",
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /category/:transactionId:
 *   get:
 *      summary: Get transaction data
 *      tags: [Transactions]
 *      parameters:
 *          - in: query
 *            name: transactionId
 *            schema:
 *              type: object
 *            required: true
 *            description: Transaction unique ID
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          '200':
 *            description: Transaction found successfully
 *          '400':
 *            description: Transaction does not exist
 */

router.get("/category/:transactionId", auth, async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const transaction = await getTransactionById(transactionId);
    if (transaction) {
      res.json({
        status: "Success",
        code: 200,
        data: transaction,
      });
    } else {
      res.json({
        status: "Not found",
        code: 404,
        message: "Given transaction does not exist",
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /transaction:
 *   patch:
 *      summary: Update transaction
 *      tags: [Transactions]
 *      parameters:
 *          - in: query
 *            name: transactionId
 *            schema:
 *              type: object
 *            required: true
 *            description: Unique transaction ID
 *          - in: query
 *            name: type
 *            schema:
 *              type: string
 *            required: true
 *            description: Type of transaction. Two possible variants, income or expense.
 *          - in: query
 *            name: category
 *            schema:
 *              type: string
 *            required: true
 *            description: Category of transaction, selectable from multiple choices.
 *          - in: query
 *            name: amount
 *            schema:
 *              type: number
 *            required: true
 *            description: Value needed to calculate user's balance and keep track of transaction's amounts
 *          - in: query
 *            name: date
 *            schema:
 *              type: date
 *            required: true
 *            description: Date of transaction
 *          - in: query
 *            name: comment
 *            schema:
 *              type: string
 *            required: true
 *            description: Comment for transaction
 *          - in: query
 *            name: owner
 *            schema:
 *              type: object
 *            required: true
 *            description: Object value needed to set owner of the promotion
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          '200':
 *            description: Transaction updated successfully
 *          '400':
 *            description: Transaction not found or not updated.
 */

router.patch("/:transactionId", auth, async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const { type, category, amount, date, comment, owner } = req.body;
    const updateResult = await updateTransaction(
      transactionId,
      type,
      category,
      amount,
      date,
      comment,
      owner
    );
    if (updateResult !== null) {
      const transaction = await getTransactionById(transactionId);
      const user = await findUserById(owner);
      res.json({
        status: "Success",
        code: 200,
        message: "Transaction updated successfully",
        data: transaction,
      });
    } else {
      res.json({
        status: "Failure",
        code: 400,
        message: "Transaction not found or not updated",
      });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
