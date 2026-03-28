"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./InvitationEntryGate.module.css";
import { FloatingDecor } from "./FloatingDecor";

interface InvitationEntryGateProps {
  children: ReactNode;
}

export function InvitationEntryGate({ children }: InvitationEntryGateProps) {
  const [entered, setEntered] = useState(false);
  const [withMusic, setWithMusic] = useState(false);
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!entered || !withMusic || !audioRef.current) return;
    const p = audioRef.current.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, [entered, withMusic]);

  if (entered) {
    return (
      <>
        {withMusic && (
          <audio ref={audioRef} src="/audio/entrada.mp3" autoPlay loop preload="auto" />
        )}
        {children}
      </>
    );
  }

  const overlay = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        boxSizing: "border-box",
        background: "linear-gradient(158deg, #FDFAF4 0%, #F3E8D4 55%, #EBD9BB 100%)",
        zIndex: 99999,
      }}
    >
      <FloatingDecor />
      <div className={styles.card}>
        <p className={styles.eyebrow}>18 · julio · 2026 · Boda Civil</p>
        <h1 className={styles.title}>Estás invitado a nuestra boda</h1>
        <p className={styles.names}>Johan & Mayra</p>
        <div className={styles.divider} aria-hidden />
        <p className={styles.hint}>La música hace parte de la experiencia</p>
        <div className={styles.actions}>
          <button type="button" onClick={() => { setWithMusic(true); setEntered(true); }}>
            🎶 Ingresar con música
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => { setWithMusic(false); setEntered(true); }}
          >
            Ingresar sin música
          </button>
        </div>
      </div>
    </div>
  );

  return mounted ? createPortal(overlay, document.body) : overlay;
}