"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./GiftsSection.module.css";

type ModalType = "cuenta" | "lista" | null;

export function GiftsSection() {
  const [open, setOpen] = useState<ModalType>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  const modal = open && mounted
    ? createPortal(
        <div
          className={styles.overlay}
          onClick={(e) => e.target === e.currentTarget && close()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className={styles.modal}>
            <button
              className={styles.closeBtn}
              onClick={close}
              aria-label="Cerrar"
            >
              ×
            </button>

            <div className={styles.modalIcon}>🎁</div>
            <h3 id="modal-title" className={styles.modalTitle}>Regalos</h3>
            <div className={styles.modalDivider} />

            {open === "cuenta" && (
              <div className={styles.modalBody}>
                <p className={styles.modalLabel}>Cuenta Nequi</p>
                <div className={styles.accountBox}>
                  <span className={styles.accountNumber}>310 531 3941</span>
                  <button
                    className={styles.copyBtn}
                    onClick={() => navigator.clipboard?.writeText("3105313941")}
                    aria-label="Copiar número"
                  >
                    Copiar
                  </button>
                </div>
                <p className={styles.modalHint}>
                  Transferencia directa por Nequi a este número.
                </p>
              </div>
            )}

            {open === "lista" && (
              <div className={styles.modalBody}>
                <p className={styles.modalLabel}>Lista de Regalos</p>
                <p className={styles.modalHint}>
                  Próximamente compartiremos nuestra lista de regalos. ¡Gracias por tu amor!
                </p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <section className={styles.gifts} data-reveal>
        <div className={styles.giftIcon}>🎁</div>
        <h2 className={styles.title}>Regalos</h2>
        <div className={styles.ornamentalLine} />
        <p className={styles.subtitle}>
          Si deseas regalarnos algo más que tu hermosa presencia…
        </p>
        <div className={styles.buttons}>
          <button className={styles.btn} onClick={() => setOpen("cuenta")}>
            Cuenta Bancaria
          </button>
          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setOpen("lista")}>
            Lista de Regalos
          </button>
        </div>
      </section>
      {modal}
    </>
  );
}
