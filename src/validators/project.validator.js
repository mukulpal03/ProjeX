import { body } from "express-validator";

const addMemberValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("role").toLowerCase().trim(),
  ];
};

const createProjectValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 3 })
      .withMessage("Name should be atlease 3 characters")
      .isLength({ max: 30 })
      .withMessage("Name cannot exceed 30 characters"),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description must be less than 500 characters")
      .trim(),
  ];
};

export { addMemberValidator, createProjectValidator };
