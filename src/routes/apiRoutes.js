const express = require("express");
const guestController = require("../controllers/guestController");
const rsvpController = require("../controllers/rsvpController");

const router = express.Router();

router.post("/api/invitados", guestController.createGuest);
router.get("/api/invitados", guestController.listGuests);
router.get("/api/invitados/:slug", guestController.getGuestBySlug);
router.put("/api/invitados/:slug", guestController.updateGuest);
router.delete("/api/invitados/:slug", guestController.deleteGuest);
router.post("/api/rsvp", rsvpController.saveRsvp);

module.exports = router;
