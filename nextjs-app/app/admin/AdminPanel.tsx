"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  Link as LinkIcon,
  Pencil,
  PlusCircle,
  Share2,
  UserRound,
  Users2,
  X,
} from "lucide-react";
import styles from "./page.module.css";

type InvitationType = "individual" | "pareja" | "cupos";
type RsvpType = "pending" | "confirmed" | "declined";

interface Guest {
  fullName: string;
  slug: string;
  invitationType: InvitationType;
  partnerName?: string;
  seats: number;
  rsvp: RsvpType;
  attendees: number;
  invitationUrl: string;
  qrUrl: string;
}

type FeedbackType = "info" | "success" | "error";

const pageSize = 9;

function statusLabel(value: RsvpType) {
  if (value === "confirmed") return "Confirmado";
  if (value === "declined") return "No asistira";
  return "Pendiente";
}

function invitationTypeLabel(type: InvitationType) {
  if (type === "pareja") return "Pareja";
  if (type === "cupos") return "Cupos";
  return "Individual";
}

function getDisplayName(guest: Guest) {
  if (guest.invitationType === "pareja" && guest.partnerName) {
    return `${guest.fullName} y ${guest.partnerName}`;
  }
  return guest.fullName;
}

export default function AdminPanel() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: FeedbackType }>({ message: "", type: "info" });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RsvpType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    invitationType: "individual" as InvitationType,
    partnerName: "",
    seats: 2,
  });

  const guestModalRef = useRef<HTMLDialogElement>(null);
  const linkModalRef = useRef<HTMLDialogElement>(null);

  const filteredGuests = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return guests.filter((guest) => {
      const byStatus = statusFilter === "all" ? true : guest.rsvp === statusFilter;
      if (!byStatus) return false;

      if (!searchTerm) return true;

      const searchable = [guest.fullName, guest.partnerName || "", guest.slug, invitationTypeLabel(guest.invitationType)]
        .join(" ")
        .toLowerCase();

      return searchable.includes(searchTerm);
    });
  }, [guests, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredGuests.length / pageSize));
  const pageItems = filteredGuests.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const totalInvitations = guests.length;
  const totalSeats = guests.reduce((sum, guest) => sum + (guest.seats || 1), 0);
  const confirmedPeople = guests
    .filter((guest) => guest.rsvp === "confirmed")
    .reduce((sum, guest) => sum + (guest.attendees || 0), 0);
  const declinedPeople = guests
    .filter((guest) => guest.rsvp === "declined")
    .reduce((sum, guest) => sum + (guest.seats || 1), 0);
  const pendingPeople = Math.max(totalSeats - confirmedPeople - declinedPeople, 0);
  const confirmationRate = totalSeats ? Math.round((confirmedPeople / totalSeats) * 100) : 0;

  async function loadGuests() {
    setLoading(true);
    try {
      const response = await fetch("/api/invitados", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudieron cargar invitados.");
      }

      setGuests(data);
      setFeedback({ message: "", type: "info" });
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : "Error cargando invitados.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGuests();
  }, []);

  function openCreateModal() {
    setEditingSlug(null);
    setFormData({ fullName: "", invitationType: "individual", partnerName: "", seats: 2 });
    guestModalRef.current?.showModal();
  }

  function openEditModal(guest: Guest) {
    setEditingSlug(guest.slug);
    setFormData({
      fullName: guest.fullName,
      invitationType: guest.invitationType,
      partnerName: guest.partnerName || "",
      seats: guest.seats || 1,
    });
    guestModalRef.current?.showModal();
  }

  function closeGuestModal() {
    guestModalRef.current?.close();
  }

  function closeLinkModal() {
    linkModalRef.current?.close();
  }

  async function submitGuestForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (!formData.fullName.trim()) {
        throw new Error("Ingresa un nombre valido.");
      }

      if (formData.invitationType === "pareja" && !formData.partnerName.trim()) {
        throw new Error("Ingresa el segundo nombre para invitacion de pareja.");
      }

      if (
        formData.invitationType === "cupos" &&
        (!Number.isInteger(Number(formData.seats)) || formData.seats < 1 || formData.seats > 20)
      ) {
        throw new Error("Los cupos deben estar entre 1 y 20.");
      }

      const payload: Record<string, unknown> = {
        fullName: formData.fullName.trim(),
        invitationType: formData.invitationType,
      };

      if (formData.invitationType === "pareja") {
        payload.partnerName = formData.partnerName.trim();
      }

      if (formData.invitationType === "cupos") {
        payload.seats = Number(formData.seats);
      }

      const isEditing = Boolean(editingSlug);
      const endpoint = isEditing ? `/api/invitados/${encodeURIComponent(editingSlug || "")}` : "/api/invitados";
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

      setFeedback({
        message: isEditing ? "Invitacion actualizada correctamente." : "Invitado creado correctamente.",
        type: "success",
      });
      closeGuestModal();
      await loadGuests();

      if (!isEditing && data.invitationUrl) {
        setCreatedLink(data.invitationUrl);
        linkModalRef.current?.showModal();
      }
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : "No fue posible guardar.",
        type: "error",
      });
    }
  }

  async function removeGuest(slug: string) {
    const confirmed = window.confirm("Esta accion eliminara la invitacion. Deseas continuar?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/invitados/${encodeURIComponent(slug)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "No fue posible eliminar el invitado.");
      }

      setFeedback({ message: "Invitado eliminado correctamente.", type: "success" });
      await loadGuests();
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : "No fue posible eliminar el invitado.",
        type: "error",
      });
    }
  }

  async function copyInvitationLink() {
    if (!createdLink) return;
    try {
      await navigator.clipboard.writeText(createdLink);
      setFeedback({ message: "Link copiado al portapapeles.", type: "success" });
      closeLinkModal();
    } catch {
      setFeedback({ message: "No se pudo copiar automaticamente. Copia el link manualmente.", type: "error" });
    }
  }

  async function shareInvitationLink() {
    if (!createdLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Invitacion de boda",
          text: "Te compartimos tu invitacion.",
          url: createdLink,
        });
        return;
      } catch {
        // no-op
      }
    }

    await copyInvitationLink();
  }

  async function copyFromCard(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setFeedback({ message: "Link copiado al portapapeles.", type: "success" });
    } catch {
      setFeedback({ message: "No se pudo copiar automaticamente.", type: "error" });
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>Panel Administrativo</p>
          <h1>Control de Invitaciones</h1>
          <p>Organiza invitados, monitorea RSVP y comparte enlaces desde una sola vista jerarquica.</p>
        </div>
        <button className={styles.primaryBtn} type="button" onClick={openCreateModal}>
          <span className={styles.btnContent}>
            <PlusCircle aria-hidden size={18} />
            <span>Nuevo invitado</span>
          </span>
        </button>
      </header>

      <section className={styles.kpiGrid} aria-label="Resumen de estado RSVP">
        <article className={styles.kpiCard}><span>Invitaciones</span><strong>{totalInvitations}</strong></article>
        <article className={styles.kpiCard}><span>Cupos totales</span><strong>{totalSeats}</strong></article>
        <article className={styles.kpiCard}><span>Confirmados</span><strong>{confirmedPeople}</strong></article>
        <article className={styles.kpiCard}><span>No asistiran</span><strong>{declinedPeople}</strong></article>
        <article className={`${styles.kpiCard} ${styles.kpiHighlight}`}><span>Tasa de confirmacion</span><strong>{confirmationRate}%</strong></article>
      </section>

      <section className={styles.workspace}>
        <aside className={styles.sidebar}>
          <article className={styles.panel}>
            <h2>Filtros</h2>
            <label htmlFor="search">Buscar</label>
            <input
              id="search"
              type="search"
              placeholder="Nombre, pareja o slug"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />

            <label htmlFor="statusFilter">Estado RSVP</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "all" | RsvpType);
                setCurrentPage(1);
              }}
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="declined">No asistira</option>
            </select>

            <button type="button" className={styles.secondaryBtn} onClick={loadGuests}>Actualizar datos</button>
          </article>

          <article className={styles.panel}>
            <h2>Estado rapido</h2>
            <dl className={styles.quickStats}>
              <div><dt>Pendientes</dt><dd>{pendingPeople}</dd></div>
              <div><dt>Confirmados</dt><dd>{confirmedPeople}</dd></div>
              <div><dt>Declinados</dt><dd>{declinedPeople}</dd></div>
            </dl>
          </article>
        </aside>

        <section className={styles.contentArea}>
          <div className={styles.contentHead}>
            <div>
              <h2>Invitaciones</h2>
              <p>Mostrando {filteredGuests.length ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filteredGuests.length)} de {filteredGuests.length}</p>
            </div>
          </div>

          <p className={`${styles.feedback} ${styles[feedback.type]}`}>{feedback.message}</p>

          {!loading && pageItems.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No hay resultados</h3>
              <p>Ajusta los filtros o crea tu primera invitacion.</p>
            </div>
          ) : (
            <div className={styles.cardGrid}>
              {pageItems.map((guest) => {
                const seatsUsed = guest.rsvp === "confirmed" ? guest.attendees || 0 : 0;
                const occupancy = guest.seats > 0 ? Math.min(100, Math.round((seatsUsed / guest.seats) * 100)) : 0;

                return (
                  <article key={guest.slug} className={styles.guestCard}>
                    <header className={styles.cardTop}>
                      <div>
                        <p className={styles.slug}>{guest.slug}</p>
                        <h3>{getDisplayName(guest)}</h3>
                      </div>
                      <span className={`${styles.status} ${styles[guest.rsvp]}`}>{statusLabel(guest.rsvp)}</span>
                    </header>

                    <div className={styles.cardMeta}>
                      <span>{invitationTypeLabel(guest.invitationType)}</span>
                      <span>{guest.seats} cupos</span>
                      <span>{guest.attendees || 0} asistentes</span>
                    </div>

                    <div className={styles.progressBlock}>
                      <div className={styles.progressLabel}>
                        <span>Ocupacion</span>
                        <strong>{occupancy}%</strong>
                      </div>
                      <div className={styles.progressTrack}>
                        <div className={styles.progressFill} style={{ width: `${occupancy}%` }}></div>
                      </div>
                    </div>

                    <div className={styles.actionMatrix}>
                      <a className={`${styles.cardAction} ${styles.actionPrimary}`} href={guest.invitationUrl} target="_blank" rel="noreferrer">Abrir invitacion</a>
                      <button type="button" className={`${styles.cardAction} ${styles.actionPrimary}`} onClick={() => copyFromCard(guest.invitationUrl)}>Copiar URL</button>
                      <a className={`${styles.cardAction} ${styles.actionPrimary}`} href={guest.qrUrl} target="_blank" rel="noreferrer">Ver QR</a>
                      <button type="button" className={`${styles.cardAction} ${styles.actionEdit}`} onClick={() => openEditModal(guest)}>Editar</button>
                      <button type="button" className={`${styles.cardAction} ${styles.actionDelete}`} onClick={() => removeGuest(guest.slug)}>Eliminar</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <footer className={styles.pagination}>
            <button type="button" aria-label="Pagina anterior" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>◀</button>
            <span>Pagina {currentPage} de {totalPages}</span>
            <button type="button" aria-label="Pagina siguiente" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>▶</button>
          </footer>
        </section>
      </section>

      <dialog ref={guestModalRef} className={styles.guestModal}>
        <form className={styles.guestForm} onSubmit={submitGuestForm}>
          <div className={styles.modalHeader}>
            <div className={styles.modalTitle}>
              <span className={styles.iconPill} aria-hidden>
                {editingSlug ? <Pencil size={16} /> : <UserRound size={16} />}
              </span>
              <div>
                <h2>{editingSlug ? "Editar invitacion" : "Agregar invitado"}</h2>
                <p className={styles.subtle}>Completa los datos y guarda para generar el enlace.</p>
              </div>
            </div>
            <button className={styles.ghostIcon} type="button" onClick={closeGuestModal} aria-label="Cerrar">
              <X aria-hidden size={18} />
            </button>
          </div>

          <label htmlFor="fullName">Nombre completo</label>
          <input id="fullName" type="text" placeholder="Ej. Juan Perez" required value={formData.fullName} onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))} />

          <label htmlFor="invitationType">Tipo de invitacion</label>
          <select
            id="invitationType"
            value={formData.invitationType}
            onChange={(e) => setFormData((prev) => ({ ...prev, invitationType: e.target.value as InvitationType }))}
          >
            <option value="individual">Individual</option>
            <option value="pareja">Pareja</option>
            <option value="cupos">Por cupos</option>
          </select>

          {formData.invitationType === "pareja" && (
            <div className={styles.conditionalField}>
              <label htmlFor="partnerName">Segundo nombre (pareja)</label>
              <input id="partnerName" type="text" placeholder="Ej. Maria Lopez" value={formData.partnerName} onChange={(e) => setFormData((prev) => ({ ...prev, partnerName: e.target.value }))} />
            </div>
          )}

          {formData.invitationType === "cupos" && (
            <div className={styles.conditionalField}>
              <label htmlFor="seats">Numero de cupos</label>
              <input id="seats" type="number" min={1} max={20} value={formData.seats} onChange={(e) => setFormData((prev) => ({ ...prev, seats: Number(e.target.value) }))} />
              <p className={styles.subtle}>Define cuantos lugares puede usar este invitado.</p>
            </div>
          )}

          <div className={styles.modalActions}>
            <button type="submit" className={styles.filledAction}>
              <span className={styles.btnContent}>
                {editingSlug ? <Pencil aria-hidden size={16} /> : <Users2 aria-hidden size={16} />}
                <span>{editingSlug ? "Actualizar" : "Guardar invitado"}</span>
              </span>
            </button>
            <button type="button" className={`${styles.secondaryAction} ${styles.btnContent}`} onClick={closeGuestModal}>
              <X aria-hidden size={16} />
              <span>Cancelar</span>
            </button>
          </div>
        </form>
      </dialog>

      <dialog ref={linkModalRef} className={styles.guestModal}>
        <div className={styles.linkModalContent}>
          <div className={styles.modalHeader}>
            <div className={styles.modalTitle}>
              <span className={styles.iconPill} aria-hidden>
                <LinkIcon size={16} />
              </span>
              <div>
                <h2>Invitacion creada</h2>
                <p className={styles.subtle}>Comparte o copia el enlace para enviarlo.</p>
              </div>
            </div>
            <button className={styles.ghostIcon} type="button" onClick={closeLinkModal} aria-label="Cerrar">
              <X aria-hidden size={18} />
            </button>
          </div>
          <input type="text" readOnly value={createdLink} />
          <div className={styles.modalActions}>
            <button type="button" className={styles.filledAction} onClick={shareInvitationLink}>
              <span className={styles.btnContent}>
                <Share2 aria-hidden size={16} />
                <span>Compartir</span>
              </span>
            </button>
            <button type="button" className={`${styles.secondaryAction} ${styles.btnContent}`} onClick={copyInvitationLink}>
              <Copy aria-hidden size={16} />
              <span>Copiar link</span>
            </button>
          </div>
        </div>
      </dialog>
    </main>
  );
}
