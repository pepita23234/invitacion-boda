const { query } = require("../config/db");
const { toGuestSlug } = require("../utils/slug");

function mapGuest(row) {
  if (!row) {
    return null;
  }

  return {
    fullName: row.full_name,
    slug: row.slug,
    invitationType: row.invitation_type,
    partnerName: row.partner_name,
    seats: row.seats,
    rsvp: row.rsvp,
    attendees: row.attendees,
    respondedAt: row.responded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function slugExists(slug) {
  const [rows] = await query("SELECT 1 FROM guests WHERE slug = ? LIMIT 1", [slug]);
  return rows.length > 0;
}

async function nameExists(fullName) {
  const [rows] = await query("SELECT 1 FROM guests WHERE full_name = ? LIMIT 1", [fullName]);
  return rows.length > 0;
}

async function nameExistsExceptSlug(fullName, slug) {
  const [rows] = await query("SELECT 1 FROM guests WHERE full_name = ? AND slug <> ? LIMIT 1", [
    fullName,
    slug,
  ]);
  return rows.length > 0;
}

async function buildUniqueSlug(fullName) {
  const baseSlug = toGuestSlug(fullName);
  let candidate = baseSlug;
  let counter = 1;

  while (await slugExists(candidate)) {
    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }

  return candidate;
}

function buildInvitationData(payload) {
  const fullName = String(payload.fullName || "").trim();
  const invitationType = String(payload.invitationType || "individual").trim().toLowerCase();
  const partnerName = String(payload.partnerName || "").trim();
  const seatsRaw = Number(payload.seats);

  if (!fullName) {
    return { error: "El nombre completo es obligatorio." };
  }

  if (!["individual", "pareja", "cupos"].includes(invitationType)) {
    return { error: "Tipo de invitacion invalido." };
  }

  if (invitationType === "pareja") {
    if (!partnerName) {
      return { error: "Para invitacion de pareja debes ingresar el segundo nombre." };
    }

    return {
      fullName,
      invitationType,
      partnerName,
      seats: 2,
    };
  }

  if (invitationType === "cupos") {
    if (!Number.isInteger(seatsRaw) || seatsRaw < 1 || seatsRaw > 20) {
      return { error: "Los cupos deben ser un numero entero entre 1 y 20." };
    }

    return {
      fullName,
      invitationType,
      partnerName: null,
      seats: seatsRaw,
    };
  }

  return {
    fullName,
    invitationType,
    partnerName: null,
    seats: 1,
  };
}

async function getGuestBySlug(slug) {
  const [rows] = await query("SELECT * FROM guests WHERE slug = ? LIMIT 1", [slug]);
  return mapGuest(rows[0]);
}

async function createGuest(payload) {
  const invitationData = buildInvitationData(payload);

  if (invitationData.error) {
    return { error: invitationData.error };
  }

  const { fullName, invitationType, partnerName, seats } = invitationData;

  if (await nameExists(fullName)) {
    return { error: "Ya existe un invitado con ese nombre." };
  }

  const slug = await buildUniqueSlug(fullName);

  await query(
    `INSERT INTO guests
      (full_name, slug, invitation_type, partner_name, seats, rsvp, attendees, responded_at)
      VALUES (?, ?, ?, ?, ?, 'pending', 0, NULL)`,
    [fullName, slug, invitationType, partnerName, seats]
  );

  const guest = await getGuestBySlug(slug);
  return { guest };
}

async function listGuests() {
  const [rows] = await query("SELECT * FROM guests ORDER BY created_at DESC");
  return rows.map(mapGuest);
}

async function saveRsvp(slug, response, attendees) {
  const nextRsvp = response === "confirmed" ? "confirmed" : "declined";
  const guest = await getGuestBySlug(slug);

  if (!guest) {
    return null;
  }

  const maxSeats = guest.seats || 1;
  let safeAttendees = 0;

  if (nextRsvp === "confirmed") {
    const requestedAttendees = Number(attendees);
    if (!Number.isInteger(requestedAttendees) || requestedAttendees < 1 || requestedAttendees > maxSeats) {
      return { error: `Debes indicar asistentes entre 1 y ${maxSeats}.` };
    }
    safeAttendees = requestedAttendees;
  }

  await query(
    "UPDATE guests SET rsvp = ?, attendees = ?, responded_at = NOW() WHERE slug = ?",
    [nextRsvp, safeAttendees, slug]
  );

  return getGuestBySlug(slug);
}

async function updateGuest(slug, payload) {
  const existingGuest = await getGuestBySlug(slug);
  if (!existingGuest) {
    return null;
  }

  const invitationData = buildInvitationData({
    fullName: payload.fullName,
    invitationType: payload.invitationType,
    partnerName: payload.partnerName,
    seats: payload.seats,
  });

  if (invitationData.error) {
    return { error: invitationData.error };
  }

  const { fullName, invitationType, partnerName, seats } = invitationData;

  if (await nameExistsExceptSlug(fullName, slug)) {
    return { error: "Ya existe otro invitado con ese nombre." };
  }

  const nextAttendees = Math.min(existingGuest.attendees || 0, seats);
  const nextRsvp = existingGuest.rsvp === "confirmed" && nextAttendees < 1 ? "pending" : existingGuest.rsvp;
  const nextRespondedAt = nextRsvp === "pending" ? null : existingGuest.respondedAt;

  await query(
    `UPDATE guests
      SET full_name = ?, invitation_type = ?, partner_name = ?, seats = ?, attendees = ?, rsvp = ?, responded_at = ?, updated_at = NOW()
      WHERE slug = ?`,
    [fullName, invitationType, partnerName, seats, nextAttendees, nextRsvp, nextRespondedAt, slug]
  );

  return getGuestBySlug(slug);
}

async function deleteGuest(slug) {
  const [result] = await query("DELETE FROM guests WHERE slug = ?", [slug]);
  return result.affectedRows > 0;
}

module.exports = {
  createGuest,
  getGuestBySlug,
  listGuests,
  saveRsvp,
  updateGuest,
  deleteGuest,
};
