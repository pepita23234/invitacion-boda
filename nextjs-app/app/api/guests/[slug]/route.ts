import { NextRequest, NextResponse } from "next/server";
import { getGuestBySlug } from "@/lib/guestService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const guest = await getGuestBySlug(slug);
    if (!guest) {
      return NextResponse.json(
        { message: "Guest not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(guest, { status: 200 });
  } catch (error) {
    console.error("Guest fetch error:", error);
    return NextResponse.json(
      { message: "Error fetching guest data" },
      { status: 500 }
    );
  }
}
