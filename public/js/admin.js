const guestModal = document.getElementById("guestModal");
const guestModalTitle = document.getElementById("guestModalTitle");
const guestForm = document.getElementById("guestForm");
const feedback = document.getElementById("feedback");
const guestRows = document.getElementById("guestRows");
const reloadBtn = document.getElementById("reloadBtn");
const openCreateModalBtn = document.getElementById("openCreateModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageIndicator = document.getElementById("pageIndicator");
const paginationInfo = document.getElementById("paginationInfo");
const linkModal = document.getElementById("linkModal");
const closeLinkModalBtn = document.getElementById("closeLinkModalBtn");
const shareLinkBtn = document.getElementById("shareLinkBtn");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const createdInvitationLink = document.getElementById("createdInvitationLink");

const invitationTypeSelect = document.getElementById("invitationType");
const partnerField = document.getElementById("partnerField");
const seatsField = document.getElementById("seatsField");
const fullNameInput = document.getElementById("fullName");
const partnerNameInput = document.getElementById("partnerName");
const seatsInput = document.getElementById("seats");

const statInvitations = document.getElementById("statInvitations");
const statSeats = document.getElementById("statSeats");
const statConfirmed = document.getElementById("statConfirmed");
const statDeclined = document.getElementById("statDeclined");
const statPending = document.getElementById("statPending");

let editingSlug = null;
let cachedGuests = [];
let filteredGuests = [];
let currentPage = 1;
const pageSize = 10;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function statusLabel(value) {
  if (value === "confirmed") return "Confirmado";
  if (value === "declined") return "No asistira";
  return "Pendiente";
}

function invitationTypeLabel(type) {
  if (type === "pareja") return "Pareja";
  if (type === "cupos") return "Cupos";
  return "Individual";
}

function getDisplayName(guest) {
  if (guest.invitationType === "pareja" && guest.partnerName) {
    return `${guest.fullName} y ${guest.partnerName}`;
  }

  return guest.fullName;
}

function showFeedback(message, type = "info") {
  feedback.textContent = message;
  feedback.className = `feedback ${type}`;
}

function updateConditionalFields() {
  const type = invitationTypeSelect.value;

  partnerField.classList.toggle("hidden", type !== "pareja");
  seatsField.classList.toggle("hidden", type !== "cupos");

  if (type === "pareja") {
    partnerNameInput.required = true;
    seatsInput.required = false;
  } else if (type === "cupos") {
    partnerNameInput.required = false;
    partnerNameInput.value = "";
    seatsInput.required = true;
  } else {
    partnerNameInput.required = false;
    partnerNameInput.value = "";
    seatsInput.required = false;
  }
}

function resetModalForm() {
  guestForm.reset();
  invitationTypeSelect.value = "individual";
  seatsInput.value = "2";
  editingSlug = null;
  updateConditionalFields();
}

function openCreateModal() {
  resetModalForm();
  guestModalTitle.textContent = "Agregar invitado";
  guestModal.showModal();
  fullNameInput.focus();
}

function openEditModal(guest) {
  editingSlug = guest.slug;
  guestModalTitle.textContent = "Editar invitacion";

  fullNameInput.value = guest.fullName || "";
  invitationTypeSelect.value = guest.invitationType || "individual";
  partnerNameInput.value = guest.partnerName || "";
  seatsInput.value = guest.seats || 1;

  updateConditionalFields();
  guestModal.showModal();
  fullNameInput.focus();
}

function closeModal() {
  guestModal.close();
  resetModalForm();
}

function openLinkModal(url) {
  createdInvitationLink.value = url;
  linkModal.showModal();
}

function closeLinkModal() {
  linkModal.close();
}

function updateStats(guests) {
  const totalInvitations = guests.length;
  const totalSeats = guests.reduce((sum, guest) => sum + (guest.seats || 1), 0);
  const confirmedPeople = guests
    .filter((guest) => guest.rsvp === "confirmed")
    .reduce((sum, guest) => sum + (guest.attendees || 0), 0);
  const declinedPeople = guests
    .filter((guest) => guest.rsvp === "declined")
    .reduce((sum, guest) => sum + (guest.seats || 1), 0);
  const pendingPeople = Math.max(totalSeats - confirmedPeople - declinedPeople, 0);

  statInvitations.textContent = String(totalInvitations);
  statSeats.textContent = String(totalSeats);
  statConfirmed.textContent = String(confirmedPeople);
  statDeclined.textContent = String(declinedPeople);
  statPending.textContent = String(pendingPeople);
}

function renderGuests(guests) {
  if (!guests.length) {
    guestRows.innerHTML = '<tr><td colspan="8">Aun no hay invitados registrados.</td></tr>';
    return;
  }

  guestRows.innerHTML = guests
    .map((guest) => {
      const safeSlug = encodeURIComponent(guest.slug);
      return `
      <tr>
        <td>${escapeHtml(getDisplayName(guest))}</td>
        <td>${escapeHtml(invitationTypeLabel(guest.invitationType))}</td>
        <td>${guest.seats || 1}</td>
        <td><a href="${guest.invitationUrl}" target="_blank" rel="noreferrer">Abrir invitacion</a></td>
        <td><span class="tag ${guest.rsvp}">${statusLabel(guest.rsvp)}</span></td>
        <td>${guest.attendees || 0}</td>
        <td><a href="${guest.qrUrl}" target="_blank" rel="noreferrer">Ver QR</a></td>
        <td>
          <div class="row-actions">
            <button type="button" class="action-btn edit" data-action="edit" data-slug="${safeSlug}">Editar</button>
            <button type="button" class="action-btn delete" data-action="delete" data-slug="${safeSlug}">Eliminar</button>
          </div>
        </td>
      </tr>`;
    })
    .join("");
}

function applyFilters() {
  const searchTerm = String(searchInput.value || "").trim().toLowerCase();
  const status = statusFilter.value;

  filteredGuests = cachedGuests.filter((guest) => {
    const byStatus = status === "all" ? true : guest.rsvp === status;
    if (!byStatus) {
      return false;
    }

    if (!searchTerm) {
      return true;
    }

    const searchable = [
      guest.fullName,
      guest.partnerName,
      guest.slug,
      invitationTypeLabel(guest.invitationType),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(searchTerm);
  });
}

function updatePaginationControls(totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  paginationInfo.textContent = `Mostrando ${startIndex}-${endIndex} de ${totalItems}`;
  pageIndicator.textContent = `Pagina ${currentPage} de ${totalPages}`;

  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;
}

function renderTableState() {
  applyFilters();

  const totalItems = filteredGuests.length;
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filteredGuests.slice(start, end);

  renderGuests(pageItems);
  updatePaginationControls(totalItems);
}

async function loadGuests() {
  try {
    const response = await fetch("/api/invitados");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "No se pudieron cargar invitados.");
    }

    cachedGuests = data;
    updateStats(cachedGuests);
    renderTableState();
  } catch (error) {
    showFeedback(error.message, "error");
  }
}

function getPayloadFromForm() {
  const formData = new FormData(guestForm);
  const fullName = String(formData.get("fullName") || "").trim();
  const invitationType = String(formData.get("invitationType") || "individual");
  const partnerName = String(formData.get("partnerName") || "").trim();
  const seats = Number(formData.get("seats") || 1);

  if (!fullName) {
    throw new Error("Ingresa un nombre valido.");
  }

  if (invitationType === "pareja" && !partnerName) {
    throw new Error("Ingresa el segundo nombre para invitacion de pareja.");
  }

  if (invitationType === "cupos" && (!Number.isInteger(seats) || seats < 1 || seats > 20)) {
    throw new Error("Los cupos deben estar entre 1 y 20.");
  }

  const payload = { fullName, invitationType };

  if (invitationType === "pareja") {
    payload.partnerName = partnerName;
  }

  if (invitationType === "cupos") {
    payload.seats = seats;
  }

  return payload;
}

async function submitGuestForm(event) {
  event.preventDefault();

  try {
    const payload = getPayloadFromForm();
    const isEditing = Boolean(editingSlug);
    const endpoint = isEditing ? `/api/invitados/${encodeURIComponent(editingSlug)}` : "/api/invitados";
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "No fue posible guardar el invitado.");
    }

    showFeedback(isEditing ? "Invitacion actualizada correctamente." : "Invitado creado correctamente.", "success");

    closeModal();
    await loadGuests();

    if (!isEditing && data.invitationUrl) {
      openLinkModal(data.invitationUrl);
    }
  } catch (error) {
    showFeedback(error.message, "error");
  }
}

async function deleteGuest(slug) {
  const confirmed = window.confirm("Esta accion eliminara la invitacion. Deseas continuar?");
  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`/api/invitados/${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "No fue posible eliminar el invitado.");
    }

    showFeedback("Invitado eliminado correctamente.", "success");
    await loadGuests();
  } catch (error) {
    showFeedback(error.message, "error");
  }
}

function onTableClick(event) {
  const target = event.target.closest("button[data-action]");
  if (!target) {
    return;
  }

  const action = target.dataset.action;
  const slug = decodeURIComponent(target.dataset.slug || "");
  const guest = cachedGuests.find((item) => item.slug === slug);

  if (!guest) {
    showFeedback("No se encontro el invitado seleccionado.", "error");
    return;
  }

  if (action === "edit") {
    openEditModal(guest);
    return;
  }

  if (action === "delete") {
    deleteGuest(slug);
  }
}

function onFilterChange() {
  currentPage = 1;
  renderTableState();
}

function goToPreviousPage() {
  if (currentPage > 1) {
    currentPage -= 1;
    renderTableState();
  }
}

function goToNextPage() {
  const totalPages = Math.max(1, Math.ceil(filteredGuests.length / pageSize));
  if (currentPage < totalPages) {
    currentPage += 1;
    renderTableState();
  }
}

async function shareInvitationLink() {
  const url = createdInvitationLink.value;
  if (!url) {
    return;
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Invitacion de boda",
        text: "Te compartimos tu invitacion.",
        url,
      });
      return;
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    showFeedback("Link copiado para compartir.", "success");
    closeLinkModal();
  } catch (error) {
    showFeedback("No se pudo compartir automaticamente. Copia el link manualmente.", "error");
  }
}

async function copyInvitationLink() {
  const url = createdInvitationLink.value;
  if (!url) {
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    showFeedback("Link copiado al portapapeles.", "success");
    closeLinkModal();
  } catch (error) {
    showFeedback("No se pudo copiar automaticamente. Copia el link manualmente.", "error");
  }
}

openCreateModalBtn.addEventListener("click", openCreateModal);
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);
reloadBtn.addEventListener("click", loadGuests);
invitationTypeSelect.addEventListener("change", updateConditionalFields);
guestRows.addEventListener("click", onTableClick);
guestForm.addEventListener("submit", submitGuestForm);
searchInput.addEventListener("input", onFilterChange);
statusFilter.addEventListener("change", onFilterChange);
prevPageBtn.addEventListener("click", goToPreviousPage);
nextPageBtn.addEventListener("click", goToNextPage);
shareLinkBtn.addEventListener("click", shareInvitationLink);
copyLinkBtn.addEventListener("click", copyInvitationLink);
closeLinkModalBtn.addEventListener("click", closeLinkModal);

guestModal.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeModal();
});

linkModal.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeLinkModal();
});

updateConditionalFields();
loadGuests();
