const login = require("./routes/login");
const urls = require("./routes/urls");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config();
require("./startup/passport");

app.set("trust proxy", 1);

app.get("/", (req, res) => {
  res.redirect("/api/hello");
});

app.get("/api/hello", (req, res) => {
  res.send("Infinix is Alive!");
});
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
      // domain: process.env.NODE_ENV === "development" ? "localhost" : "ezylink",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_CONNECTION_STRING,
      ttl: 7 * 24 * 60 * 60 * 1000,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// require("./startup/db")();
app.use("/auth", login);
app.use("/", urls);

const PORT = process.env.PORT || 3001;
mongoose
  .connect(process.env.MONGO_CONNECTION_STRING)
  .then(() => {
    console.log("Connected to Database...");
    app.listen(PORT, () => {
      console.log(`Server connected on ${PORT}...`);
      console.log('CORS enabled for http://localhost:5173 and http://127.0.0.1:5173');
    });
  })
  .catch((err) => console.log(err));
