import React from "react";
import styles from "./Gallery.module.css";

export const Gallery: React.FC = () => {
  return (
    <section className={styles.gallery} data-reveal>
      <h2>Compartimos este día junto a ti</h2>
      <div className={styles.ornamentalLine}></div>
      <div className={styles.socialCard}>
        <p>Comparte tus fotos y videos de ese hermoso dia</p>
        <a
          className={styles.hashtag}
          href="https://www.instagram.com/explore/tags/Johan%26Mayra/"
          target="_blank"
          rel="noreferrer"
        >
          #Johan&Mayra
        </a>
        <a
          className={styles.instagramBtn}
          href="https://www.instagram.com/explore/tags/Johan%26Mayra/"
          target="_blank"
          rel="noreferrer"
        >
          Ver en Instagram
        </a>
        <div className={styles.instagramPeople}>
          <a href="https://www.instagram.com/j.lara_9/" target="_blank" rel="noreferrer">
            @j.lara_9
          </a>
          <a href="https://www.instagram.com/mayra1026sc/" target="_blank" rel="noreferrer">
            @mayra1026sc
          </a>
        </div>
      </div>
    </section>
  );
};
