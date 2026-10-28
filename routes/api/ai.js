const express = require("express");
const { rateLimit } = require("express-rate-limit");
const wrapAsync = require("../../utils/wrapAsync.js");
const aiController = require("../../controllers/api/ai.js");
const { validateApiBody } = require("../../middleware.js");
const { aiRecommendationRequestSchema } = require("../../schema.js");
const ApiError = require("../../utils/ApiError.js");

const ONE_MINUTE = 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

function limitTo(limit, windowMs, options = {}) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res, next) => {
      next(
        new ApiError(
          429,
          "RATE_LIMITED",
          "AI search is busy right now. Please wait a minute and try again.",
        ),
      );
    },
    ...options,
  });
}

// Gemini's free-tier quota is shared by every visitor, so besides a
// per-visitor limit there is an app-wide limit kept below that quota.
const sharedKey = { keyGenerator: () => "all-visitors" };
const perVisitorLimit = limitTo(5, ONE_MINUTE);
const appMinuteLimit = limitTo(12, ONE_MINUTE, sharedKey);
const appDailyLimit = limitTo(400, ONE_DAY, sharedKey);

const router = express.Router();

router.post(
  "/recommendations",
  perVisitorLimit,
  validateApiBody(aiRecommendationRequestSchema),
  appMinuteLimit,
  appDailyLimit,
  wrapAsync(aiController.recommend),
);

module.exports = router;
