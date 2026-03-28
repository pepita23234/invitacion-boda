import { NextRequest, NextResponse } from "next/server";
import { createGuest, listGuests } from "@/lib/guestService";

function buildUrls(req: NextRequest, slug: string) {
  const origin = req.nextUrl.origin;
  const invitationUrl = `${origin}/invitacion/${slug}`;
  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(invitationUrl)}&size=220`;
  return { invitationUrl, qrUrl };
}

export async function GET(req: NextRequest) {
  try {
    const guests = await listGuests();
    const payload = guests.map((guest) => ({
      ...guest,
      ...buildUrls(req, guest.slug),
    }));

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("List guests error:", error);
    return NextResponse.json({ message: "No se pudieron cargar invitados." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createGuest(body);

    if (result.error || !result.guest) {
      return NextResponse.json({ message: result.error || "No fue posible crear el invitado." }, { status: result.status });
    }

    const links = buildUrls(req, result.guest.slug);

    return NextResponse.json(
      {
        message: "Invitado creado correctamente.",
        guest: result.guest,
        invitationUrl: links.invitationUrl,
        qrUrl: links.qrUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create guest error:", error);
    return NextResponse.json({ message: "No fue posible crear el invitado." }, { status: 500 });
  }
}
