"use client";

import React, { useEffect, useState } from "react";
import styles from "./InvitationHero.module.css";

interface InvitationHeroProps {
  invitedNames: string;
  seatsDescription: string;
  eventDateIso: string;
}

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getCountdownParts(eventDateIso: string): Countdown {
  const eventMs = new Date(eventDateIso).getTime();
  const nowMs = Date.now();
  const diffMs = Math.max(eventMs - nowMs, 0);

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

export const InvitationHero: React.FC<InvitationHeroProps> = ({
  invitedNames,
  seatsDescription,
  eventDateIso,
}) => {
  const [countdown, setCountdown] = useState<Countdown>(() => getCountdownParts(eventDateIso));

  useEffect(() => {
    setCountdown(getCountdownParts(eventDateIso));

    const timer = window.setInterval(() => {
      setCountdown(getCountdownParts(eventDateIso));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [eventDateIso]);

  return (
    <section className={`${styles.hero} reveal invitation-card`}>
      <p className={styles.eyebrow}>18 de julio de 2026</p>
      <p className={styles.mainTitle}>NOS CASAMOS</p>
      <h1 className={styles.coupleNames}>
        Johan Lara A <span>&</span> Mayra Suarez C
      </h1>
      <div className={styles.ornamentalLine} aria-hidden="true"></div>
      <div className={styles.invitedCard}>
        <p className={styles.invitedTitle}>Invitados:</p>
        <p className={styles.invitedNames}>{invitedNames}</p>
      </div>
      <p className={styles.inviteMeta}>{seatsDescription}</p>
      <p className={styles.romanticCopy}>
        "Con la bendición de Dios y de nuestros padres, tenemos el honor de invitarte a celebrar nuestra unión."
      </p>
      <div className={styles.countdownShell}>
        <span className={styles.labelTop}>Falta</span>
        <div className={styles.countdownGrid}>
          <article className={styles.timeCard}>
            <span className={styles.number}>{countdown.days}</span>
            <span className={styles.unit}>dias</span>
          </article>
          <article className={styles.timeCard}>
            <span className={styles.number}>{countdown.hours}</span>
            <span className={styles.unit}>hs</span>
          </article>
          <article className={styles.timeCard}>
            <span className={styles.number}>{countdown.minutes}</span>
            <span className={styles.unit}>min</span>
          </article>
          <article className={styles.timeCard}>
            <span className={styles.number}>{countdown.seconds}</span>
            <span className={styles.unit}>seg</span>
          </article>
        </div>
        <span className={styles.labelBottom}>para celebrar juntos</span>
      </div>
    </section>
  );
};
