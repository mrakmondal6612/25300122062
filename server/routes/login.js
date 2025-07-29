require("dotenv").config();
const passport = require("passport");
const router = require("express").Router();

router.get(
  "/api/login",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: true,
  })
);

// /users/me
router.get("/api/login/success", (req, res) => {
  // Debug: log session and cookies
  console.log("[LOGIN SUCCESS] req.sessionID:", req.sessionID);
  console.log("[LOGIN SUCCESS] req.session:", req.session);
  console.log("[LOGIN SUCCESS] req.user:", req.user);
  console.log("[LOGIN SUCCESS] req.cookies:", req.cookies);
  res.status(200).json({
    success: true,
    message: "Log in successfully",
    user: req.user,
  });
});

router.get("/api/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Login failed",
  });
});

router.get("/api/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect(process.env.CLIENT_HOME);
  });
});


// Add callback route to match Google OAuth callbackURL
router.get(
  "/api/login/callback",
  passport.authenticate("google", {
    session: true,
    successRedirect: process.env.CLIENT_DASHBOARDHBOARD,
    failureRedirect: "/api/login",
  })
);

// Keep the old /callback route for backward compatibility (optional)
router.get(
  "/callback",
  passport.authenticate("google", {
    session: true,
    successRedirect: process.env.CLIENT_DASHBOARDHBOARD,
    failureRedirect: "/api/login",
  })
);

module.exports = router;
