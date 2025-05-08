import { body } from "express-validator";

const noteValidator = () => {
  return [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Content is required")
      .isLength({ min: 4 })
      .withMessage("Content should be atlease 4 characters")
      .isLength({ max: 50 })
      .withMessage("Content cannot exceed 50 characters"),
  ];
};

export { noteValidator };
