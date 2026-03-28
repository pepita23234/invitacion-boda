const express = require("express");
const path = require("path");
const guestController = require("../controllers/guestController");

const router = express.Router();

router.get("/", (req, res) => {
  res.redirect("/admin");
});

router.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "public", "admin.html"));
});

router.get("/invitacion/:slug", guestController.renderInvitation);

module.exports = router;
