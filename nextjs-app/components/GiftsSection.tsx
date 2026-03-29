"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./GiftsSection.module.css";

type ModalType = "cuenta" | null;

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

            <h3 id="modal-title" className={styles.modalTitle}>Lluvias de Sobres</h3>
            <div className={styles.modalDivider} />

            {open === "cuenta" && (
              <div className={styles.modalBody}>
                <p className={styles.modalHint}>
                  Aquí puedes enviarme tus lluvias de sobres
                </p>

                <p className={styles.modalLabel}>Cuenta Nequi</p>
                <div className={styles.accountBox}>
                  <span className={styles.accountNumber}>300 839 9854</span>
                  <button
                    className={styles.copyBtn}
                    onClick={() => navigator.clipboard?.writeText("3008399854")}
                    aria-label="Copiar número"
                  >
                    Copiar
                  </button>
                </div>

                <p className={styles.modalLabel}>Llave Nequi</p>
                <div className={styles.accountBox}>
                  <span className={styles.accountNumber}>114 316 6920</span>
                  <button
                    className={styles.copyBtn}
                    onClick={() => navigator.clipboard?.writeText("1143166920")}
                    aria-label="Copiar llave"
                  >
                    Copiar
                  </button>
                </div>
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
        <div className={styles.giftIcon}></div>
        <h2 className={styles.title}>Lluvias de Sobres</h2>
        <div className={styles.ornamentalLine} />
        <p className={styles.subtitle}>
          Si deseas regalarnos algo más que tu hermosa presencia…
        </p>
        <div className={styles.buttons}>
          <button className={styles.btn} onClick={() => setOpen("cuenta")}>
            Ver Cuentas
          </button>
        </div>
      </section>
      {modal}
    </>
  );
}
