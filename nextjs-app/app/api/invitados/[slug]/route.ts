import { NextRequest, NextResponse } from "next/server";
import { deleteGuest, getGuestBySlug, updateGuest } from "@/lib/guestService";

function buildUrls(req: NextRequest, slug: string) {
  const origin = req.nextUrl.origin;
  const invitationUrl = `${origin}/invitacion/${slug}`;
  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(invitationUrl)}&size=220`;
  return { invitationUrl, qrUrl };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const guest = await getGuestBySlug(slug);

    if (!guest) {
      return NextResponse.json({ message: "Invitado no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ ...guest, ...buildUrls(req, guest.slug) }, { status: 200 });
  } catch (error) {
    console.error("Get guest error:", error);
    return NextResponse.json({ message: "No se pudo obtener el invitado." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const result = await updateGuest(slug, body);

    if (result.error || !result.guest) {
      return NextResponse.json({ message: result.error || "No fue posible actualizar." }, { status: result.status });
    }

    return NextResponse.json(
      {
        message: "Invitacion actualizada correctamente.",
        guest: { ...result.guest, ...buildUrls(req, result.guest.slug) },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update guest error:", error);
    return NextResponse.json({ message: "No fue posible actualizar el invitado." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const deleted = await deleteGuest(slug);

    if (!deleted) {
      return NextResponse.json({ message: "Invitado no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ message: "Invitado eliminado correctamente." }, { status: 200 });
  } catch (error) {
    console.error("Delete guest error:", error);
    return NextResponse.json({ message: "No fue posible eliminar el invitado." }, { status: 500 });
  }
}
