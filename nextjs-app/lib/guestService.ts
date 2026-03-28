import slugify from "slugify";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { dbQuery } from "@/lib/db";

export type InvitationType = "individual" | "pareja" | "cupos";
export type RsvpType = "pending" | "confirmed" | "declined";

interface GuestRow extends RowDataPacket {
  full_name: string;
  slug: string;
  invitation_type: InvitationType;
  partner_name: string | null;
  seats: number;
  rsvp: RsvpType;
  attendees: number;
  responded_at: string | null;
}

export interface Guest {
  fullName: string;
  slug: string;
  invitationType: InvitationType;
  partnerName: string;
  seats: number;
  rsvp: RsvpType;
  attendees: number;
  respondedAt: string | null;
}

export interface SaveRsvpResult {
  guest?: Guest;
  error?: string;
  status: number;
}

export interface GuestPayload {
  fullName: string;
  invitationType?: InvitationType;
  partnerName?: string;
  seats?: number;
}

interface NormalizedInvitationData {
  fullName: string;
  invitationType: InvitationType;
  partnerName: string | null;
  seats: number;
}

export interface GuestMutationResult {
  guest?: Guest;
  error?: string;
  status: number;
}

function mapGuest(row?: GuestRow): Guest | null {
  if (!row) {
    return null;
  }

  return {
    fullName: row.full_name,
    slug: row.slug,
    invitationType: row.invitation_type,
    partnerName: row.partner_name || "",
    seats: Number(row.seats || 1),
    rsvp: row.rsvp,
    attendees: Number(row.attendees || 0),
    respondedAt: row.responded_at,
  };
}

export function normalizeSlugInput(rawSlug: string) {
  try {
    return decodeURIComponent(String(rawSlug || "")).trim().toLowerCase();
  } catch {
    return String(rawSlug || "").trim().toLowerCase();
  }
}

export async function getGuestBySlug(rawSlug: string): Promise<Guest | null> {
  const slug = normalizeSlugInput(rawSlug);
  const [rows] = (await dbQuery("SELECT * FROM guests WHERE slug = ? LIMIT 1", [slug])) as [GuestRow[], unknown];
  return mapGuest(rows[0]);
}

export async function listGuests(): Promise<Guest[]> {
  const [rows] = (await dbQuery("SELECT * FROM guests ORDER BY created_at DESC")) as [GuestRow[], unknown];
  return rows.map((row) => mapGuest(row)).filter((guest): guest is Guest => Boolean(guest));
}

export async function saveRsvp(slug: string, response: "confirmed" | "declined", attendees: number): Promise<SaveRsvpResult> {
  const guest = await getGuestBySlug(slug);
  if (!guest) {
    return { status: 404, error: "Invitado no encontrado." };
  }

  const nextRsvp = response === "confirmed" ? "confirmed" : "declined";
  let safeAttendees = 0;

  if (nextRsvp === "confirmed") {
    const requestedAttendees = Number(attendees);
    if (!Number.isInteger(requestedAttendees) || requestedAttendees < 1 || requestedAttendees > guest.seats) {
      return { status: 400, error: `Debes indicar asistentes entre 1 y ${guest.seats}.` };
    }
    safeAttendees = requestedAttendees;
  }

  await dbQuery(
    "UPDATE guests SET rsvp = ?, attendees = ?, responded_at = NOW() WHERE slug = ?",
    [nextRsvp, safeAttendees, guest.slug]
  );

  const updatedGuest = await getGuestBySlug(guest.slug);
  if (!updatedGuest) {
    return { status: 500, error: "No fue posible actualizar el invitado." };
  }

  return { status: 200, guest: updatedGuest };
}

async function slugExists(slug: string) {
  const [rows] = (await dbQuery("SELECT 1 FROM guests WHERE slug = ? LIMIT 1", [slug])) as [RowDataPacket[], unknown];
  return rows.length > 0;
}

async function nameExists(fullName: string) {
  const [rows] = (await dbQuery("SELECT 1 FROM guests WHERE full_name = ? LIMIT 1", [fullName])) as [RowDataPacket[], unknown];
  return rows.length > 0;
}

async function nameExistsExceptSlug(fullName: string, slug: string) {
  const [rows] = (await dbQuery("SELECT 1 FROM guests WHERE full_name = ? AND slug <> ? LIMIT 1", [fullName, slug])) as [RowDataPacket[], unknown];
  return rows.length > 0;
}

async function buildUniqueSlug(fullName: string) {
  const baseSlug = toGuestSlug(fullName);
  let candidate = baseSlug;
  let counter = 1;

  while (await slugExists(candidate)) {
    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }

  return candidate;
}

function buildInvitationData(payload: GuestPayload): NormalizedInvitationData | { error: string } {
  const fullName = String(payload.fullName || "").trim();
  const invitationType = String(payload.invitationType || "individual").trim().toLowerCase() as InvitationType;
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

export async function createGuest(payload: GuestPayload): Promise<GuestMutationResult> {
  const invitationData = buildInvitationData(payload);
  if ("error" in invitationData) {
    return { status: 400, error: invitationData.error };
  }

  if (await nameExists(invitationData.fullName)) {
    return { status: 409, error: "Ya existe un invitado con ese nombre." };
  }

  const slug = await buildUniqueSlug(invitationData.fullName);
  await dbQuery(
    `INSERT INTO guests
      (full_name, slug, invitation_type, partner_name, seats, rsvp, attendees, responded_at)
      VALUES (?, ?, ?, ?, ?, 'pending', 0, NULL)`,
    [invitationData.fullName, slug, invitationData.invitationType, invitationData.partnerName, invitationData.seats]
  );

  const guest = await getGuestBySlug(slug);
  if (!guest) {
    return { status: 500, error: "No fue posible crear el invitado." };
  }

  return { status: 201, guest };
}

export async function updateGuest(rawSlug: string, payload: GuestPayload): Promise<GuestMutationResult> {
  const slug = normalizeSlugInput(rawSlug);
  const existingGuest = await getGuestBySlug(slug);
  if (!existingGuest) {
    return { status: 404, error: "Invitado no encontrado." };
  }

  const invitationData = buildInvitationData(payload);
  if ("error" in invitationData) {
    return { status: 400, error: invitationData.error };
  }

  if (await nameExistsExceptSlug(invitationData.fullName, slug)) {
    return { status: 409, error: "Ya existe otro invitado con ese nombre." };
  }

  const nextAttendees = Math.min(existingGuest.attendees || 0, invitationData.seats);
  const nextRsvp = existingGuest.rsvp === "confirmed" && nextAttendees < 1 ? "pending" : existingGuest.rsvp;
  const nextRespondedAt = nextRsvp === "pending" ? null : existingGuest.respondedAt;

  await dbQuery(
    `UPDATE guests
      SET full_name = ?, invitation_type = ?, partner_name = ?, seats = ?, attendees = ?, rsvp = ?, responded_at = ?, updated_at = NOW()
      WHERE slug = ?`,
    [
      invitationData.fullName,
      invitationData.invitationType,
      invitationData.partnerName,
      invitationData.seats,
      nextAttendees,
      nextRsvp,
      nextRespondedAt,
      slug,
    ]
  );

  const guest = await getGuestBySlug(slug);
  if (!guest) {
    return { status: 500, error: "No fue posible actualizar el invitado." };
  }

  return { status: 200, guest };
}

export async function deleteGuest(rawSlug: string) {
  const slug = normalizeSlugInput(rawSlug);
  const [result] = (await dbQuery("DELETE FROM guests WHERE slug = ?", [slug])) as [ResultSetHeader, unknown];
  return result.affectedRows > 0;
}

export function toGuestSlug(fullName: string) {
  return slugify(fullName, {
    lower: true,
    strict: true,
    trim: true,
    locale: "es",
  });
}
