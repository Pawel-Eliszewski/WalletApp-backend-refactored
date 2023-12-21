import Transaction from "../schemas/transaction.js";
import mongoose from "mongoose";

const addTransaction = async (type, category, amount, date, comment, owner) => {
  return Transaction.create({ type, category, amount, date, comment, owner });
};

const getTransactionById = async (transactionId) => {
  return Transaction.findOne({ _id: transactionId });
};

const deleteTransaction = async (transactionId) => {
  const transaction = await getTransactionById(transactionId);
  if (!transaction) {
    throw new Error("Transaction does not exist");
  }
  await Transaction.findOneAndDelete({ _id: transactionId });
};

const updateTransaction = async (
  transactionId,
  type,
  category,
  amount,
  date,
  comment,
  owner
) => {
  return Transaction.findOneAndReplace(
    { _id: transactionId },
    { type, category, amount, date, comment, owner }
  );
};

const getUserTransactions = async (userId) => {
  const userIdToObjectId = new mongoose.Types.ObjectId(userId);
  return Transaction.find({ owner: userIdToObjectId });
};

export {
  addTransaction,
  getTransactionById,
  getUserTransactions,
  updateTransaction,
  deleteTransaction,
};
