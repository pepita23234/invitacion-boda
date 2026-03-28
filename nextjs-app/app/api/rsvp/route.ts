import { NextRequest, NextResponse } from "next/server";
import { saveRsvp } from "@/lib/guestService";

interface RsvpPayload {
  slug: string;
  response: "confirmed" | "declined";
  attendees: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: RsvpPayload = await request.json();

    if (!body.slug || !["confirmed", "declined"].includes(body.response)) {
      return NextResponse.json(
        { message: "Datos inválidos." },
        { status: 400 }
      );
    }

    const result = await saveRsvp(body.slug, body.response, Number(body.attendees || 0));
    if (result.error) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }

    return NextResponse.json(
      {
        message:
          body.response === "confirmed"
            ? "Gracias por confirmar tu asistencia."
            : "Gracias por avisarnos. Te extrañaremos.",
        guest: result.guest,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json(
      { message: "Error procesando tu respuesta." },
      { status: 500 }
    );
  }
}
