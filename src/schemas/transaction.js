import mongoose from "mongoose";
const { Schema } = mongoose;

const TransactionSchema = new Schema({
  type: {
    type: String,
    required: [true, "Type is required"],
  },
  category: {
    type: Number,
    required: [true, "Category is required"],
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
  },
  date: {
    type: String,
    required: [true, "Date is required"],
  },
  comment: {
    type: String,
    default: null,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: [true, "UserId is required"],
  },
});

const Transaction = mongoose.model("transactions", TransactionSchema);
export default Transaction;
