import React from "react";
import styles from "./Preloader.module.css";

export const Preloader: React.FC = () => {
  return (
    <div className={styles.preloader} role="status" aria-label="Cargando invitación">
      <div className={styles.spinner}></div>
    </div>
  );
};
