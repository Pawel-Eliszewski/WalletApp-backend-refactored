import User from "../schemas/user.js";

const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

const findUserById = async (userId) => {
  return User.findOne({ _id: userId });
};

const registerUser = async (email, password, firstname) => {
  return User.create({ email, password, firstname });
};

const authenticateUser = async (email, password) => {
  return User.findOne({ email, password });
};

const setToken = async (email, token) => {
  return User.updateOne({ email }, { token });
};

export {
  findUserByEmail,
  registerUser,
  authenticateUser,
  setToken,
  findUserById,
};
