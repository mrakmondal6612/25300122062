const { updateData } = require("../functions/urldata");
const { ensurAuthenticated } = require("../middleware/auth");
const { limiter } = require("../middleware/rateLimit");
const { UrlData } = require("../models/paidUrl");
const { Url } = require("../models/url");
const customLogger = require("../middleware/customLogger");
// Redis removed, using in-memory counter
let inMemoryCounter = 1;

// On server start, set inMemoryCounter to the next available value
async function initializeCounter() {
  // Find the highest shortUrl in the database
  const allUrls = await Url.find({}).select({ shortUrl: 1 });
  let max = 0;
  allUrls.forEach((doc) => {
    try {
      const val = base62.decode(doc.shortUrl);
      if (typeof val === 'number' && val > max) max = val;
    } catch (e) {}
  });
  inMemoryCounter = max + 1;
  console.log('Short link counter initialized to', inMemoryCounter);
}

// Call this function on module load
initializeCounter();
const base62 = require("base-62.js");
const mongoose = require("mongoose");

const express = require("express");
const router = express.Router();
router.use(customLogger); // Use custom logging middleware for all routes

router.get("/:shortUrl", async (req, res) => {
  const shortUrl = req.params.shortUrl;
  const url = await Url.findOne({ shortUrl });
  if (!url) {
    return res.status(404).json({ error: "Short URL not found" });
  }
  // Check expiry
  if (new Date() > url.validTill) {
    return res.status(410).json({ error: "Link Expired" });
  }
  res.redirect(url.longUrl);
  const clientIp =
    req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  updateData(shortUrl, clientIp);
});

router.post("/api/url/free", limiter, async (req, res) => {
  const { longUrl, validity } = req.body;
  let i = 0, shortUrl;
  do {
    shortUrl = base62.encode(inMemoryCounter);
    const findUrl = await Url.findOne({ shortUrl });
    if (!findUrl) {
      i = -1;
    } else {
      inMemoryCounter++;
    }
  } while (i >= 0);

  // Set expiry
  let validMinutes = 30;
  if (typeof validity === 'number' && validity > 0) validMinutes = validity;
  const validTill = new Date(Date.now() + validMinutes * 60000);

  const cliUrl = process.env.SERVER_HOST.replace(/\/$/, '') + '/' + shortUrl;
  const newUrl = new Url({
    longUrl,
    shortUrl,
    validTill,
  });
  await newUrl.save();
  inMemoryCounter++;
  const shortUrlRes = {
    shortUrl: cliUrl,
    validTill,
  };
  res.status(201).json(shortUrlRes);
});

router.post("/api/url/paid", ensurAuthenticated, async (req, res) => {
  let shortUrl = "";
  const { longUrl, custom, email, validity } = req.body;

  // Validate custom shortcode if provided
  if (custom) {
    // Alphanumeric and length check (4-16 chars)
    if (!/^[a-zA-Z0-9]{4,16}$/.test(custom)) {
      return res.status(400).json({ error: "Custom shortcode must be alphanumeric and 4-16 chars" });
    }
    const findCustom = await Url.findOne({ shortUrl: custom });
    if (findCustom) {
      return res.status(409).json({ error: "Shortcode not available" });
    }
    shortUrl = custom;
  } else {
    shortUrl = base62.encode(inMemoryCounter);
    inMemoryCounter++;
  }

  // Set expiry
  let validMinutes = 30;
  if (typeof validity === 'number' && validity > 0) validMinutes = validity;
  const validTill = new Date(Date.now() + validMinutes * 60000);

  const cliUrl = process.env.SERVER_HOST.replace(/\/$/, '') + '/' + shortUrl;
  const newUrl = new Url({
    longUrl,
    shortUrl,
    validTill,
  });
  await newUrl.save();

  const shortUrlRes = {
    shortUrl: cliUrl,
    validTill,
  };

  res.status(201).json(shortUrlRes);

  //UrlData Storing
  const newUrlData = new UrlData({
    email,
    longUrl,
    shortUrl,
  });

  await newUrlData.save();
});

router.post("/api/url/dashboard/data", ensurAuthenticated, async (req, res) => {
  const geoData = [["country", "click"]];
  const lineData = [];
  let total = 0;
  const { email } = req.body;
  const findData = await UrlData.find({ email }).select({
    totalClicked: 1,
    clickPerCountry: 1,
    weeklyClick: 1,
  });
  findData.map((rawData) => {
    const { totalClicked, weeklyClick, clickPerCountry } = rawData;
    total += totalClicked;
    clickPerCountry.map((data) => {
      const { country, click } = data;
      const ndata = [country, click];
      if (geoData.some(([icountry, _]) => icountry === country)) {
        const index = geoData.findIndex(
          ([icountry, _]) => icountry === country
        );
        if (index != -1) {
          geoData[index][1] += click;
        }
      } else {
        geoData.push(ndata);
      }
    });

    weeklyClick.map((data) => {
      const { date, click } = data;
      const ndata = { date, click };
      if (lineData.some((item) => item.date === date)) {
        const index = lineData.findIndex((item) => item.date === date);
        if (index != -1) {
          lineData[index].click += click;
        }
      } else {
        lineData.push(ndata);
      }
    });
  });

  //sorting dates in correc order
  lineData.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  const clickData = {
    total,
    geoData,
    lineData,
  };
  res.send(JSON.stringify(clickData));
});

router.post("/api/url/link/all", ensurAuthenticated, async (req, res) => {
  const { email } = req.body;
  const findData = await UrlData.find({ email }).select({
    createdOn: 1,
    shortUrl: 1,
    totalClicked: 1,
  });

  const allData = await Promise.all(
    findData.map(async (rawData) => {
      const { createdOn, shortUrl, totalClicked } = rawData;
      let isActive = false;
      const findUrl = await Url.findOne({ shortUrl });

      if (findUrl) {
        isActive = true;
      }

      return {
        isActive,
        createdOn,
        shortUrl,
        totalClicked,
      };
    })
  );
  res.send(JSON.stringify(allData));
});

router.post("/api/url/link/analytics", ensurAuthenticated, async (req, res) => {
  let isActive = false;
  const lineData = [];
  const geoData = [["country", "click"]];
  const { email, shortUrl } = req.body;
  const findData = await UrlData.findOne({ email, shortUrl }).select({
    createdOn: 1,
    shortUrl: 1,
    totalClicked: 1,
    longUrl: 1,
    weeklyClick: 1,
    clickPerCountry: 1,
  });

  if (!findData) {
    const noUrl = { error: "no url fount" };
    return res.send(JSON.stringify(noUrl));
  }

  const { createdOn, longUrl, totalClicked, weeklyClick, clickPerCountry } =
    findData;

  clickPerCountry.map((data) => {
    const { country, click } = data;
    const ndata = [country, click];
    if (geoData.some(([icountry, _]) => icountry === country)) {
      const index = geoData.findIndex(([icountry, _]) => icountry === country);
      if (index != -1) {
        geoData[index][1] += click;
      }
    } else {
      geoData.push(ndata);
    }
  });

  weeklyClick.map((data) => {
    const { date, click } = data;
    const ndata = { date, click };
    if (lineData.some((item) => item.date === date)) {
      const index = lineData.findIndex((item) => item.date === date);
      if (index != -1) {
        lineData[index].click += click;
      }
    } else {
      lineData.push(ndata);
    }
  });

  const findUrl = await Url.findOne({ shortUrl });

  if (findUrl) {
    isActive = true;
  }

  const linkAnalytics = {
    isActive,
    createdOn,
    longUrl,
    totalClicked,
    lineData,
    geoData,
  };

  res.send(JSON.stringify(linkAnalytics));
});

router.delete("api/url/delete", ensurAuthenticated, async (req, res) => {
  const { email, shortUrl } = req.body;
  await Url.findOneAndDelete({ shortUrl });
  await UrlData.findByIdAndDelete({ email, shortUrl });
  res.send(JSON.stringify({ message: "deleted" }));
});

module.exports = router;
