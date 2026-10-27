const passport = require("passport");
const User = require("../../models/user.js");
const ApiError = require("../../utils/ApiError.js");

function safeUser(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
  };
}

module.exports.me = (req, res) => {
  const authenticated = req.isAuthenticated();

  res.status(200).json({
    data: {
      authenticated,
      user: authenticated ? safeUser(req.user) : null,
    },
  });
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const registeredUser = await User.register(
      new User({ username, email }),
      password,
    );

    req.login(registeredUser, (loginError) => {
      if (loginError) return next(loginError);

      res.status(201).json({
        data: {
          authenticated: true,
          user: safeUser(registeredUser),
        },
      });
    });
  } catch (error) {
    if (error.name === "UserExistsError") {
      return next(
        new ApiError(409, "USERNAME_TAKEN", "That username is already in use."),
      );
    }

    next(error);
  }
};

module.exports.login = (req, res, next) => {
  passport.authenticate("local", (error, user) => {
    if (error) return next(error);

    if (!user) {
      return next(
        new ApiError(401, "INVALID_CREDENTIALS", "Username or password is incorrect."),
      );
    }

    req.login(user, (loginError) => {
      if (loginError) return next(loginError);

      res.status(200).json({
        data: {
          authenticated: true,
          user: safeUser(user),
        },
      });
    });
  })(req, res, next);
};

module.exports.logout = (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error);

    res.status(200).json({
      data: {
        authenticated: false,
        user: null,
      },
    });
  });
};
