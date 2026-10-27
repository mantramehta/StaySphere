const express = require("express");
const authController = require("../../controllers/api/auth.js");
const ApiError = require("../../utils/ApiError.js");
const wrapAsync = require("../../utils/wrapAsync.js");
const { apiRegisterSchema, apiLoginSchema } = require("../../schema.js");

const router = express.Router();

function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      return next(new ApiError(400, "VALIDATION_ERROR", message));
    }

    req.body = value;
    next();
  };
}

router.get("/me", authController.me);
router.post(
  "/register",
  validateBody(apiRegisterSchema),
  wrapAsync(authController.register),
);
router.post("/login", validateBody(apiLoginSchema), authController.login);
router.post("/logout", authController.logout);

module.exports = router;
