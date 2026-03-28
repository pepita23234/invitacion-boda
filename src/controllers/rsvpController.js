const guestService = require("../services/guestService");

async function saveRsvp(req, res, next) {
  try {
    const { slug, response, attendees } = req.body;

    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ message: "El slug del invitado es obligatorio." });
    }

    if (!["confirmed", "declined"].includes(response)) {
      return res.status(400).json({
        message: "La respuesta RSVP debe ser confirmed o declined.",
      });
    }

    const updatedGuest = await guestService.saveRsvp(slug, response, attendees);

    if (updatedGuest && updatedGuest.error) {
      return res.status(400).json({ message: updatedGuest.error });
    }

    if (!updatedGuest) {
      return res.status(404).json({ message: "Invitado no encontrado." });
    }

    return res.json({
      message:
        response === "confirmed"
          ? "Gracias por confirmar tu asistencia."
          : "Gracias por avisarnos. Te extrañaremos.",
      guest: {
        fullName: updatedGuest.fullName,
        slug: updatedGuest.slug,
        invitationType: updatedGuest.invitationType,
        partnerName: updatedGuest.partnerName,
        seats: updatedGuest.seats,
        rsvp: updatedGuest.rsvp,
        attendees: updatedGuest.attendees,
        respondedAt: updatedGuest.respondedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { saveRsvp };
