const invited = window.__INVITADO__ || {};

const eventDate = new Date(invited.eventDateISO || "2026-07-18T16:00:00");
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const btnConfirm = document.getElementById("btnConfirm");
const btnDecline = document.getElementById("btnDecline");
const rsvpMessage = document.getElementById("rsvpMessage");
const attendeesSelect = document.getElementById("attendees");
const bgMusic = document.getElementById("bgMusic");
const openRsvpModalBtn = document.getElementById("openRsvpModalBtn");
const rsvpModal = document.getElementById("rsvpModal");
const closeRsvpModalBtn = document.getElementById("closeRsvpModalBtn");
const rsvpStatusModal = document.getElementById("rsvpStatusModal");
const closeRsvpStatusModalBtn = document.getElementById("closeRsvpStatusModalBtn");
const rsvpToast = document.getElementById("rsvpToast");
const preloaderArea = document.querySelector(".preloader-area");
const AUDIO_PREF_KEY = "invitationMusicEnabled";
let toastTimeoutId = null;
const hasConfirmedRsvp = invited.rsvp === "confirmed";
let preloaderHidden = false;
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const isConstrainedNetwork = Boolean(connection && (connection.saveData || /2g/.test(connection.effectiveType || "")));
const isSmallScreen = window.matchMedia("(max-width: 840px)").matches;

function hidePreloader() {
  if (!preloaderArea || preloaderHidden) {
    return;
  }

  preloaderHidden = true;
  preloaderArea.classList.add("is-hidden");
  document.body.classList.remove("preloader-active");
}

window.addEventListener("DOMContentLoaded", () => {
  window.requestAnimationFrame(() => {
    window.setTimeout(hidePreloader, 120);
  });
});

window.addEventListener("load", () => {
  window.setTimeout(hidePreloader, 80);
});

window.setTimeout(hidePreloader, 1200);

function lockRsvpForConfirmedGuest() {
  if (openRsvpModalBtn) {
    openRsvpModalBtn.disabled = true;
    openRsvpModalBtn.textContent = "Asistencia confirmada";
    openRsvpModalBtn.classList.add("is-locked");
  }

  if (btnConfirm) {
    btnConfirm.disabled = true;
  }

  if (btnDecline) {
    btnDecline.disabled = true;
  }

  if (attendeesSelect) {
    attendeesSelect.disabled = true;
  }

  if (rsvpMessage) {
    rsvpMessage.textContent = "Ya confirmaste tu asistencia.";
    rsvpMessage.classList.add("show");
  }
}

function showRsvpToast(message, variant = "success") {
  if (!rsvpToast) {
    return;
  }

  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }

  rsvpToast.textContent = message;
  rsvpToast.classList.remove("success", "error", "show");
  rsvpToast.classList.add(variant);

  // Force reflow so repeating the same class reliably replays animation.
  void rsvpToast.offsetWidth;
  rsvpToast.classList.add("show");

  toastTimeoutId = window.setTimeout(() => {
    rsvpToast.classList.remove("show");
  }, 4200);
}

function buildOwnerMessage(response, attendees) {
  if (response === "confirmed") {
    return `Hola, he confirmado mi asistencia a la boda. Invitado: ${invited.fullName}. Asistiremos ${attendees} persona(s).`;
  }

  return `Hola, no podre asistir a la boda. Invitado: ${invited.fullName}. Gracias por la invitacion.`;
}

function notifyOwner(response, attendees, waWindow = null) {
  const rawPhone = String(invited.ownerWhatsapp || "").trim();
  if (!rawPhone) {
    return;
  }

  const normalizedPhone = rawPhone.replace(/[^\d]/g, "");
  if (!normalizedPhone) {
    return;
  }

  const text = encodeURIComponent(buildOwnerMessage(response, attendees));
  const waUrl = `https://wa.me/${normalizedPhone}?text=${text}`;

  if (waWindow && !waWindow.closed) {
    waWindow.location.href = waUrl;
    waWindow.focus();
    return;
  }

  const popup = window.open(waUrl, "_blank", "noopener,noreferrer");
  if (!popup) {
    window.location.href = waUrl;
  }
}

function preOpenWhatsappWindow() {
  const rawPhone = String(invited.ownerWhatsapp || "").trim();
  if (!rawPhone) {
    return null;
  }

  const normalizedPhone = rawPhone.replace(/[^\d]/g, "");
  if (!normalizedPhone) {
    return null;
  }

  const waWindow = window.open("about:blank", "_blank");
  if (waWindow) {
    // Prevent the new tab from accessing this page while keeping a usable window reference.
    waWindow.opener = null;
  }

  return waWindow;
}

function twoDigits(value) {
  return value.toString().padStart(2, "0");
}

function updateCountdown() {
  const now = new Date();
  const diff = eventDate.getTime() - now.getTime();

  if (diff <= 0) {
    daysEl.textContent = "00";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  daysEl.textContent = twoDigits(days);
  hoursEl.textContent = twoDigits(hours);
  minutesEl.textContent = twoDigits(minutes);
  secondsEl.textContent = twoDigits(seconds);
}

async function sendRsvp(response, waWindow = null) {
  if (hasConfirmedRsvp) {
    showRsvpToast("Ya confirmaste tu asistencia anteriormente.", "success");
    if (waWindow && !waWindow.closed) {
      waWindow.close();
    }
    return;
  }

  btnConfirm.disabled = true;
  btnDecline.disabled = true;

  const attendees = Number(attendeesSelect ? attendeesSelect.value : invited.seats || 1);

  try {
    const request = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: invited.slug, response, attendees }),
    });

    const data = await request.json();

    if (!request.ok) {
      throw new Error(data.message || "No fue posible guardar tu confirmacion.");
    }

    rsvpMessage.textContent = data.message;
    rsvpMessage.classList.add("show");
    if (response === "confirmed") {
      showRsvpToast("Gracias por confirmar tu asistencia.", "success");
      lockRsvpForConfirmedGuest();
    } else {
      showRsvpToast("Hemos recibido tu respuesta.", "success");
    }

    if (rsvpModal && rsvpModal.open) {
      rsvpModal.close();
    }

    notifyOwner(response, attendees, waWindow);
  } catch (error) {
    if (waWindow && !waWindow.closed) {
      waWindow.close();
    }

    rsvpMessage.textContent = error.message;
    rsvpMessage.classList.add("show");
    showRsvpToast(error.message, "error");
    btnConfirm.disabled = false;
    btnDecline.disabled = false;
  }
}

if (openRsvpModalBtn && rsvpModal) {
  openRsvpModalBtn.addEventListener("click", () => {
    if (hasConfirmedRsvp) {
      return;
    }
    rsvpModal.showModal();
  });
}

if (closeRsvpModalBtn && rsvpModal) {
  closeRsvpModalBtn.addEventListener("click", () => {
    rsvpModal.close();
  });
}

if (rsvpModal) {
  rsvpModal.addEventListener("cancel", (event) => {
    event.preventDefault();
    rsvpModal.close();
  });
}

if (btnConfirm) {
  btnConfirm.addEventListener("click", () => {
    const waWindow = preOpenWhatsappWindow();
    sendRsvp("confirmed", waWindow);
  });
}

if (btnDecline) {
  btnDecline.addEventListener("click", () => {
    const waWindow = preOpenWhatsappWindow();
    sendRsvp("declined", waWindow);
  });
}

if (closeRsvpStatusModalBtn && rsvpStatusModal) {
  closeRsvpStatusModalBtn.addEventListener("click", () => {
    rsvpStatusModal.close();
  });
}

if (rsvpStatusModal) {
  rsvpStatusModal.addEventListener("cancel", (event) => {
    event.preventDefault();
    rsvpStatusModal.close();
  });
}

function removeUnlockListeners(handler) {
  document.removeEventListener("click", handler);
  document.removeEventListener("touchstart", handler);
  document.removeEventListener("keydown", handler);
}

async function playMusicFromStart() {
  if (!bgMusic) {
    return false;
  }

  try {
    if (bgMusic.preload !== "auto") {
      bgMusic.preload = "auto";
      bgMusic.load();
    }

    bgMusic.volume = 0.65;
    bgMusic.currentTime = 0;
    await bgMusic.play();
    localStorage.setItem(AUDIO_PREF_KEY, "1");
    return true;
  } catch (error) {
    return false;
  }
}

function setupUnlockOnInteraction() {
  const unlockAudio = async () => {
    const success = await playMusicFromStart();
    if (success) {
      removeUnlockListeners(unlockAudio);
    }
  };

  document.addEventListener("click", unlockAudio);
  document.addEventListener("touchstart", unlockAudio);
  document.addEventListener("keydown", unlockAudio);
}

async function tryAutoPlayMusic() {
  if (!bgMusic) {
    return;
  }

  const hasEnabledMusic = localStorage.getItem(AUDIO_PREF_KEY) === "1";

  if (isConstrainedNetwork || isSmallScreen) {
    setupUnlockOnInteraction();
    return;
  }

  if (!hasEnabledMusic) {
    setupUnlockOnInteraction();
    return;
  }

  const played = await playMusicFromStart();

  if (!played) {
    setupUnlockOnInteraction();
  }
}

document.addEventListener("visibilitychange", () => {
  const hasEnabledMusic = localStorage.getItem(AUDIO_PREF_KEY) === "1";
  if (document.visibilityState === "visible" && hasEnabledMusic && bgMusic && bgMusic.paused) {
    bgMusic.play().catch(() => {});
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));

if (hasConfirmedRsvp) {
  lockRsvpForConfirmedGuest();
  if (rsvpStatusModal) {
    rsvpStatusModal.showModal();
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);
tryAutoPlayMusic();