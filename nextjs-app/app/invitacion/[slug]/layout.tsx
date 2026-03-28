import styles from "./layout.module.css";
import { FloatingDecor } from "@/components/FloatingDecor";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function InvitationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <FloatingDecor />
      <ScrollReveal />
      {children}
    </div>
  );
}
