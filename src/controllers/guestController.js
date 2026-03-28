const guestService = require("../services/guestService");
const { invitationPage } = require("../views/invitationTemplate");

function normalizeSlugInput(rawSlug) {
  try {
    return decodeURIComponent(String(rawSlug || "")).trim().toLowerCase();
  } catch (error) {
    return String(rawSlug || "").trim().toLowerCase();
  }
}

async function createGuest(req, res, next) {
  try {
    const { fullName, invitationType, partnerName, seats } = req.body;

    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return res.status(400).json({ message: "El nombre completo es obligatorio." });
    }

    const result = await guestService.createGuest({
      fullName,
      invitationType,
      partnerName,
      seats,
    });

    if (result.error) {
      const statusCode = result.error.includes("Ya existe") ? 409 : 400;
      return res.status(statusCode).json({ message: result.error });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return res.status(201).json({
      message: "Invitado creado correctamente.",
      guest: {
        fullName: result.guest.fullName,
        slug: result.guest.slug,
        invitationType: result.guest.invitationType,
        partnerName: result.guest.partnerName,
        seats: result.guest.seats,
        rsvp: result.guest.rsvp,
        attendees: result.guest.attendees,
      },
      invitationUrl: `${baseUrl}/invitacion/${result.guest.slug}`,
      qrUrl: `https://quickchart.io/qr?text=${encodeURIComponent(`${baseUrl}/invitacion/${result.guest.slug}`)}&size=220`,
    });
  } catch (error) {
    next(error);
  }
}

async function getGuestBySlug(req, res, next) {
  try {
    const slug = normalizeSlugInput(req.params.slug);
    const guest = await guestService.getGuestBySlug(slug);

    if (!guest) {
      return res.status(404).json({ message: "Invitado no encontrado." });
    }

    return res.json({
      fullName: guest.fullName,
      slug: guest.slug,
      invitationType: guest.invitationType,
      partnerName: guest.partnerName,
      seats: guest.seats,
      rsvp: guest.rsvp,
      attendees: guest.attendees,
      respondedAt: guest.respondedAt,
    });
  } catch (error) {
    next(error);
  }
}

async function listGuests(req, res, next) {
  try {
    const guests = await guestService.listGuests();
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const mapped = guests.map((guest) => ({
      fullName: guest.fullName,
      slug: guest.slug,
      invitationType: guest.invitationType,
      partnerName: guest.partnerName,
      seats: guest.seats,
      rsvp: guest.rsvp,
      attendees: guest.attendees,
      invitationUrl: `${baseUrl}/invitacion/${guest.slug}`,
      qrUrl: `https://quickchart.io/qr?text=${encodeURIComponent(`${baseUrl}/invitacion/${guest.slug}`)}&size=220`,
    }));

    return res.json(mapped);
  } catch (error) {
    next(error);
  }
}

async function renderInvitation(req, res, next) {
  try {
    const slug = normalizeSlugInput(req.params.slug);
    const guest = await guestService.getGuestBySlug(slug);

    if (!guest) {
      return res.status(404).send("Invitacion no encontrada para este enlace.");
    }

    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    return res.send(
      invitationPage({
        fullName: guest.fullName,
        slug: guest.slug,
        invitationType: guest.invitationType,
        partnerName: guest.partnerName,
        seats: guest.seats,
        rsvp: guest.rsvp,
        attendees: guest.attendees,
        eventDateISO: process.env.EVENT_DATE_ISO || "2026-07-18T14:00:00",
        ownerWhatsapp: process.env.OWNER_WHATSAPP || "",
      })
    );
  } catch (error) {
    next(error);
  }
}

async function updateGuest(req, res, next) {
  try {
    const { slug } = req.params;
    const { fullName, invitationType, partnerName, seats } = req.body;

    const updated = await guestService.updateGuest(slug, {
      fullName,
      invitationType,
      partnerName,
      seats,
    });

    if (!updated) {
      return res.status(404).json({ message: "Invitado no encontrado." });
    }

    if (updated.error) {
      const statusCode = updated.error.includes("otro invitado") ? 409 : 400;
      return res.status(statusCode).json({ message: updated.error });
    }

    return res.json({
      message: "Invitacion actualizada correctamente.",
      guest: {
        fullName: updated.fullName,
        slug: updated.slug,
        invitationType: updated.invitationType,
        partnerName: updated.partnerName,
        seats: updated.seats,
        rsvp: updated.rsvp,
        attendees: updated.attendees,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteGuest(req, res, next) {
  try {
    const { slug } = req.params;
    const deleted = await guestService.deleteGuest(slug);

    if (!deleted) {
      return res.status(404).json({ message: "Invitado no encontrado." });
    }

    return res.json({ message: "Invitado eliminado correctamente." });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createGuest,
  getGuestBySlug,
  listGuests,
  renderInvitation,
  updateGuest,
  deleteGuest,
};
