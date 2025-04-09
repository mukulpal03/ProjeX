import { body } from "express-validator";

const userRegistrationValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3 })
      .withMessage("Username should be atleast 3 char")
      .isLength({ max: 13 })
      .withMessage("Username cannot exceed 13 char"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password should be atleast 6 characters")
      .isLength({ max: 20 })
      .withMessage("Password cannot exceed 20 Characters"),
    body("fullname").trim().notEmpty().withMessage("fullname is required"),
  ];
};

const userLoginValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password should be atleast 6 characters")
      .isLength({ max: 20 })
      .withMessage("Password cannot exceed 20 Characters"),
  ];
};

const forgotPassValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

const resetPassValidator = () => {
  return [
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password should be atleast 6 characters")
      .isLength({ max: 20 })
      .withMessage("Password cannot exceed 20 Characters"),
  ];
};

export { userRegistrationValidator, userLoginValidator, forgotPassValidator, resetPassValidator };
