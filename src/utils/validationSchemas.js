import Joi from "joi";

export const userLoginSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  password: Joi.string()
    .regex(/[0-9a-zA-Z]*\d[0-9a-zA-Z]*/)
    .min(4)
    .trim()
    .required(),
});

export const userRegisterSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  password: Joi.string()
    .regex(/[0-9a-zA-Z]*\d[0-9a-zA-Z]*/)
    .min(4)
    .trim()
    .required(),
  firstname: Joi.string()
    .regex(/[a-zA-Z]*/)
    .min(2)
    .max(10)
    .trim()
    .required(),
});
