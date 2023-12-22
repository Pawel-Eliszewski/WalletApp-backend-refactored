import User from "../schemas/user.js";

const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

const findUserById = async (userId) => {
  return User.findOne({ _id: userId });
};

const findUserByVerificationToken = async (verificationToken) => {
  return User.findOne({ verificationToken });
};

const updateUser = async (userId, data) => {
  return User.findOneAndUpdate({ _id: userId }, data, {
    new: true,
  });
};

const registerUser = async (email, password, firstname, verificationToken) => {
  return User.create({ email, password, firstname, verificationToken });
};

const authenticateUser = async (email, password) => {
  return User.findOne({ email, password });
};

const setToken = async (email, token) => {
  return User.updateOne({ email }, { token });
};

export {
  findUserByEmail,
  findUserById,
  findUserByVerificationToken,
  registerUser,
  updateUser,
  authenticateUser,
  setToken,
};
