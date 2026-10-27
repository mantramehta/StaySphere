if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const { MongoStore, createWebCryptoAdapter } = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const ApiError = require("./utils/ApiError.js");

const apiAuthRouter = require("./routes/api/auth.js");
const apiListingRouter = require("./routes/api/listings.js");

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const dbUrl = process.env.ATLASDB_URL;

if (!dbUrl || !process.env.SECRET) {
  throw new Error("ATLASDB_URL and SECRET must be configured.");
}

if (isProduction) {
  app.set("trust proxy", 1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  cryptoAdapter: createWebCryptoAdapter({
    secret: process.env.SECRET,
  }),
  touchAfter: 24 * 3600,
});

store.on("error", (error) => {
  console.error("Mongo session store error:", error.message);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
  },
};

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use("/api/auth", apiAuthRouter);
app.use("/api/listings", apiListingRouter);

app.use("/api/{*splat}", (req, res, next) => {
  next(new ApiError(404, "NOT_FOUND", "The requested API route was not found."));
});

const clientPath = path.join(__dirname, "client", "dist");

if (isProduction) {
  app.use(express.static(clientPath));
  app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

app.use((req, res, next) => {
  next(new ApiError(404, "NOT_FOUND", "The requested resource was not found."));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isServerError = statusCode >= 500;

  if (isServerError) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      code: isServerError ? "INTERNAL_SERVER_ERROR" : err.code || "API_ERROR",
      message: isServerError ? "Something went wrong." : err.message,
    },
  });
});

const port = process.env.PORT || 8080;

async function startServer() {
  await mongoose.connect(dbUrl);
  console.log("Connected to DB");

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exitCode = 1;
});
