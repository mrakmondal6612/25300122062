const mongoose = require("mongoose");

const UrlShema = new mongoose.Schema({
  longUrl: { type: String, required: true },
  shortUrl: String,
  createdOn: { type: Date, default: Date.now },
  validTill: { type: Date, required: true }, // Expiry time
});

// UrlShema.index({ createdOn: 1 }, { expireAfterSeconds: 5 });

const Url = mongoose.model("Url", UrlShema);

exports.Url = Url;
