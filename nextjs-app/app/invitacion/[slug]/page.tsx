import { notFound } from "next/navigation";
import { Metadata } from "next";
import { InvitationHero } from "@/components/InvitationHero";
import { Gallery } from "@/components/Gallery";
import { InvitationEntryGate } from "@/components/InvitationEntryGate";
import { RsvpForm } from "@/components/RsvpForm";
import { getGuestBySlug, type Guest } from "@/lib/guestService";
import styles from "./page.module.css";

interface InvitationPageProps {
  params: Promise<{ slug: string }>;
}

async function getGuest(slug: string): Promise<Guest | null> {
  return getGuestBySlug(slug);
}

// Generate metadata for each invitation
export async function generateMetadata(
  { params }: InvitationPageProps
): Promise<Metadata> {
  const { slug } = await params;
  const guest = await getGuest(slug);

  if (!guest) {
    return {
      title: "Invitación no encontrada",
    };
  }

  return {
    title: `Invitación de Boda | ${guest.fullName}`,
    description: "Te invitamos a celebrar nuestro matrimonio.",
    openGraph: {
      title: `Invitación de Boda | ${guest.fullName}`,
      description: "Te invitamos a celebrar nuestro matrimonio.",
      type: "website",
      images: [
        {
          url: "/og-cover.jpg",
          width: 1280,
          height: 720,
          alt: "Invitación de Boda Johan & Mayra",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Invitación de Boda | ${guest.fullName}`,
      description: "Te invitamos a celebrar nuestro matrimonio.",
      images: ["/og-cover.jpg"],
    },
  };
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { slug } = await params;
  const guest = await getGuest(slug);

  if (!guest) {
    notFound();
  }

  const invitedNames =
    guest.invitationType === "pareja" && guest.partnerName
      ? `${guest.fullName} y ${guest.partnerName}`
      : guest.fullName;

  const seatsDescription =
    guest.invitationType === "pareja"
      ? "Esta invitación está reservada para 2 personas."
      : guest.invitationType === "cupos"
        ? `Esta invitación incluye ${guest.seats} cupos especiales.`
        : "Esta invitación es personal e intransferible.";

  const eventDateIso = process.env.EVENT_DATE_ISO || "2026-07-18T16:00:00";

  return (
    <InvitationEntryGate>
      <div className={styles.container}>
        <style>{`
          :root {
            --green-deep: #2D4A3E;
            --green-mid: #4E7260;
            --green-light: #7FA280;
            --cream: #FDFAF4;
            --sand: #F0E8D8;
            --gold: #C5A060;
            --gold-light: #D4B87A;
            --coral: #C07060;
            --ink: #24201C;
            --ink-soft: #4A4039;
            /* Legacy aliases */
            --olive: #4E7260;
            --olive-deep: #2D4A3E;
            --beige: #F0E8D8;
            --beige-soft: #FDFAF4;
            --white: #FFFDFB;
          }
        `}</style>

        <main className={styles.shell}>
          <InvitationHero
            invitedNames={invitedNames}
            seatsDescription={seatsDescription}
            eventDateIso={eventDateIso}
          />

          <section className={styles.details} data-reveal>
            <h2>Detalles del evento</h2>
            <div className={styles.ornamentalLine}></div>
            <div className={styles.detailCards}>
              <article>
                <h3>Fecha</h3>
                <p>18 de julio de 2026</p>
              </article>
              <article>
                <h3>Hora</h3>
                <p>4:00 pm</p>
              </article>
              <article>
                <h3>Lugar</h3>
                <p>Cabañas Villa Gladys</p>
              </article>
              <article>
                <h3>Dress Code</h3>
                <p>Tropical</p>
              </article>
            </div>
            <a
              className={styles.mapBtn}
              href="https://maps.app.goo.gl/JTe6z3YLfdwd1w539"
              target="_blank"
              rel="noreferrer"
            >
              Ver ubicación en Google Maps
            </a>
          </section>

          <Gallery />

          <section className={styles.rsvp} data-reveal>
            <h2>Confirma tu asistencia</h2>
            <div className={styles.ornamentalLine}></div>
            <p>Tu presencia en nuestra boda civil hará este día aún más especial.</p>
            <RsvpForm slug={slug} seats={guest.seats} initialRsvp={guest.rsvp} />
          </section>
        </main>
      </div>
    </InvitationEntryGate>
  );
}
