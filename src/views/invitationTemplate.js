function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function invitationPage({ fullName, slug, invitationType, partnerName, seats, rsvp, attendees, eventDateISO, ownerWhatsapp }) {
  const safeName = escapeHtml(fullName);
  const safeSlug = escapeHtml(slug);
  const safeInvitationType = escapeHtml(invitationType || "individual");
  const safePartnerName = escapeHtml(partnerName || "");
  const safeSeats = Number.isInteger(Number(seats)) ? Number(seats) : 1;
  const safeRsvp = escapeHtml(rsvp || "pending");
  const safeAttendees = Number.isInteger(Number(attendees)) ? Number(attendees) : 0;
  const safeDate = escapeHtml(eventDateISO);
  const safeOwnerWhatsapp = escapeHtml(ownerWhatsapp || "");
  const invitedNames =
    invitationType === "pareja" && partnerName
      ? `${safeName} y ${safePartnerName}`
      : safeName;
  const guestLine =
    invitationType === "pareja" && partnerName
      ? `${safeName} y ${safePartnerName}, estan invitados a nuestra boda`
      : `${safeName}, estas invitado(a) a nuestra boda`;

  const seatsDescription =
    invitationType === "pareja"
      ? "Esta invitacion esta reservada para 2 personas."
      : invitationType === "cupos"
        ? `Esta invitacion incluye ${safeSeats} cupos especiales.`
        : "Esta invitacion es personal e intransferible.";

  const attendeesControl =
    safeSeats > 1
      ? `<div class="attendees-control">
        <label for="attendees">Cantidad de asistentes</label>
        <select id="attendees" name="attendees">
          ${Array.from({ length: safeSeats }, (_, index) => {
            const value = index + 1;
            return `<option value="${value}" ${value === safeSeats ? "selected" : ""}>${value}</option>`;
          }).join("")}
        </select>
      </div>`
      : `<input id="attendees" name="attendees" type="hidden" value="1" />`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invitacion de Boda | ${safeName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preconnect" href="https://images.unsplash.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/css/invitation.css" />
</head>
<body class="preloader-active">
  <div class="preloader-area" aria-live="polite" aria-label="Cargando invitacion">
    <div class="d-flex justify-content-center align-items-center h-100">
      <div class="loader" aria-hidden="true"></div>
    </div>
  </div>

  <div class="ambient-shape ambient-left"></div>
  <div class="ambient-shape ambient-right"></div>

  <main class="invitation-shell">
    <div class="floral-corner floral-top-left" aria-hidden="true"></div>
    <div class="floral-corner floral-top-right" aria-hidden="true"></div>
    <div class="floral-corner floral-bottom-left" aria-hidden="true"></div>
    <div class="floral-corner floral-bottom-right" aria-hidden="true"></div>

    <section class="hero reveal invitation-card">
      <p class="eyebrow">18 de julio de 2026</p>
      <p class="main-title">NOS CASAMOS</p>
      <h1 class="couple-names">Mayra Suarez <span>&</span> Johan Lara</h1>
      <div class="ornamental-line" aria-hidden="true"></div>
      <div class="invited-card" id="guestName">
        <p class="invited-title">Invitados:</p>
        <p class="invited-names">${invitedNames}</p>
      </div>
      <p class="invite-meta">${seatsDescription}</p>
      <p class="romantic-copy romantic-quote">"Todos somos mortales, hasta el primer beso y la segunda copa de vino."</p>
    </section>

    <section class="countdown reveal invitation-card">
      <h2>Faltan</h2>
      <div class="ornamental-line" aria-hidden="true"></div>
      <div class="count-grid">
        <article><strong id="days">00</strong><span>Dias</span></article>
        <article><strong id="hours">00</strong><span>Horas</span></article>
        <article><strong id="minutes">00</strong><span>Min</span></article>
        <article><strong id="seconds">00</strong><span>Seg</span></article>
      </div>
    </section>

    <section class="details reveal invitation-card">
      <h2>Detalles del evento</h2>
      <div class="ornamental-line" aria-hidden="true"></div>
      <div class="detail-cards">
        <article>
          <h3>Fecha</h3>
          <p>18 de julio de 2026</p>
        </article>
        <article>
          <h3>Lugar</h3>
          <p>Cabanas Villa Gladys</p>
        </article>
        <article>
          <h3>Dress Code</h3>
          <p>Tropical</p>
        </article>
      </div>
      <a class="map-btn" href="https://maps.app.goo.gl/JTe6z3YLfdwd1w539" target="_blank" rel="noreferrer">Ver ubicacion en Google Maps</a>
    </section>

    <section class="gallery reveal invitation-card">
      <h2>Un instante de nuestra historia</h2>
      <div class="ornamental-line" aria-hidden="true"></div>
      <div class="gallery-grid">
        <figure class="gallery-item">
          <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=680&q=60" alt="Foto romantica 1" loading="lazy" decoding="async" fetchpriority="low" />
        </figure>
        <figure class="gallery-item">
          <img src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=680&q=60" alt="Foto romantica 2" loading="lazy" decoding="async" fetchpriority="low" />
        </figure>
        <figure class="gallery-item">
          <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=680&q=60" alt="Foto romantica 3" loading="lazy" decoding="async" fetchpriority="low" />
        </figure>
      </div>
    </section>

    <section class="rsvp reveal invitation-card">
      <h2>Confirma tu asistencia</h2>
      <div class="ornamental-line" aria-hidden="true"></div>
      <p>Tu presencia en nuestra boda civil hara este dia aun mas especial.</p>
      <button id="openRsvpModalBtn" class="primary-btn" type="button">Responder RSVP</button>
    </section>
  </main>

  <dialog id="rsvpModal" class="rsvp-modal">
    <div class="rsvp-modal-content">
      <div class="rsvp-modal-header">
        <h3>Confirma tu asistencia</h3>
        <button id="closeRsvpModalBtn" type="button" class="rsvp-close-btn" aria-label="Cerrar RSVP">x</button>
      </div>
      <p class="rsvp-modal-copy">Tu presencia en nuestra boda civil hara este dia aun mas especial.</p>
      ${attendeesControl}
      <div class="actions">
        <button id="btnConfirm" class="primary-btn" type="button">Confirmar asistencia</button>
        <button id="btnDecline" class="secondary-btn" type="button">No podre asistir</button>
      </div>
      <p id="rsvpMessage" class="rsvp-message" role="status"></p>
    </div>
  </dialog>

  <dialog id="rsvpStatusModal" class="rsvp-status-modal" aria-labelledby="rsvpStatusTitle">
    <div class="rsvp-status-content">
      <h3 id="rsvpStatusTitle">Asistencia ya confirmada</h3>
      <p>Ya habias confirmado tu invitacion. Gracias por acompanarnos en este dia tan especial.</p>
      <button id="closeRsvpStatusModalBtn" type="button" class="primary-btn">Cerrar</button>
    </div>
  </dialog>

  <div id="rsvpToast" class="rsvp-toast" role="status" aria-live="polite" aria-atomic="true"></div>

  <audio id="bgMusic" loop preload="none">
    <source src="/audio/Ed%20Sheeran%20-%20Perfect%20%5BOfficial%20Lyric%20Video%5D.mp3" type="audio/mpeg" />
  </audio>

  <script>
    window.__INVITADO__ = {
      slug: "${safeSlug}",
      fullName: "${safeName}",
      invitationType: "${safeInvitationType}",
      partnerName: "${safePartnerName}",
      seats: ${safeSeats},
      rsvp: "${safeRsvp}",
      attendees: ${safeAttendees},
      eventDateISO: "${safeDate}",
      ownerWhatsapp: "${safeOwnerWhatsapp}"
    };
  </script>
  <script src="/js/invitation.js" defer></script>
</body>
</html>`;
}

module.exports = { invitationPage };