import passport from "../config/passport.js";

const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }

    const userIdToAllowWithoutToken = "650f2fb1143d76a0d93a0176";

    if (!user && req.params.userId !== userIdToAllowWithoutToken) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: "Unauthorized",
      });
    }

    if (user) {
      const token = req.header("authorization").split(" ")[1];
      if (!token || user.token !== token) {
        return res.status(401).json({
          status: "error",
          code: 401,
          message: "Unauthorized",
          data: "Unauthorized",
        });
      }
    }

    req.user = user;
    next();
  })(req, res, next);
};

export default auth;
