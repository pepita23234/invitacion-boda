"use client";

import React, { useState } from "react";
import {
  CalendarHeart,
  CheckCircle2,
  Loader2,
  PartyPopper,
  Users,
  XCircle,
} from "lucide-react";
import styles from "./RsvpForm.module.css";

interface RsvpFormProps {
  slug: string;
  seats: number;
  initialRsvp?: "pending" | "confirmed" | "declined";
}

export const RsvpForm: React.FC<RsvpFormProps> = ({ slug, seats, initialRsvp = "pending" }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedSeats, setSelectedSeats] = useState(seats);
  const [success, setSuccess] = useState(initialRsvp !== "pending");

  const handleSubmit = async (response: "confirmed" | "declined") => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          response,
          attendees: selectedSeats,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Error al guardar tu respuesta.");
        return;
      }

      setMessage(data.message);
      setSuccess(true);
    } catch (error) {
      setMessage("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const alreadyResponded = initialRsvp !== "pending" && !message;
    const defaultMsg = initialRsvp === "declined"
      ? "Ya nos avisaste que no podrás asistir. ¡Te extrañaremos!"
      : "Ya confirmaste tu asistencia a nuestra boda. ¡Te esperamos!";
    return (
      <div className={styles.result}>
        <div className={styles.resultIcon}>
          <PartyPopper aria-hidden size={26} />
        </div>
        <div>
          <h4>{alreadyResponded ? "¡Tu confirmación ya fue registrada!" : "¡Gracias!"}</h4>
          <p>{message || defaultMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.form}>
      <div className={styles.header}>
        <div className={styles.iconBadge}>
          <CalendarHeart aria-hidden size={20} />
        </div>
        <div>
          <p className={styles.eyebrow}>Confirma tu asistencia</p>
          <h3 className={styles.title}>Nos encantará celebrar contigo</h3>
        </div>
      </div>

      {seats > 1 && (
        <div className={styles.attendeesControl}>
          <label htmlFor="attendees">
            <Users aria-hidden size={18} /> Cantidad de asistentes
          </label>
          <select
            id="attendees"
            value={selectedSeats}
            onChange={(e) => setSelectedSeats(Number(e.target.value))}
            disabled={loading}
          >
            {Array.from({ length: seats }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.actions}>
        <button
          className={styles.primaryBtn}
          onClick={() => handleSubmit("confirmed")}
          disabled={loading}
        >
          <span className={styles.btnContent}>
            {loading ? (
              <Loader2 className={styles.spinner} aria-hidden size={18} />
            ) : (
              <CheckCircle2 aria-hidden size={18} />
            )}
            <span>{loading ? "Guardando..." : "Confirmar asistencia"}</span>
          </span>
        </button>
        <button
          className={styles.secondaryBtn}
          onClick={() => handleSubmit("declined")}
          disabled={loading}
        >
          <span className={styles.btnContent}>
            <XCircle aria-hidden size={18} />
            <span>No podré asistir</span>
          </span>
        </button>
      </div>

      {message && (
        <div className={styles.message}>
          <XCircle aria-hidden size={18} />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
};
