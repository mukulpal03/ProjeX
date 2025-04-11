import { body } from "express-validator";

const taskValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 4 })
      .withMessage("title should be atlease 4 characters")
      .isLength({ max: 50 })
      .withMessage("title cannot exceed 50 characters"),
    body("assignedTo").notEmpty().withMessage("Please selecet the member"),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),
  ];
};

const subTaskValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 4 })
      .withMessage("title should be atlease 4 characters")
      .isLength({ max: 50 })
      .withMessage("title cannot exceed 50 characters"),
  ];
};

export { taskValidator, subTaskValidator };
