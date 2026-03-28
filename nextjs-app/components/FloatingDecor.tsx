"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./FloatingDecor.module.css";

interface PetalConfig {
  id: number;
  left: string;
  size: number;
  duration: number;
  delay: number;
  drift: string;
  rot: string;
  type: "flower" | "leaf" | "petal" | "rose" | "hibiscus" | "butterfly" | "star";
  color: string;
}

const PETALS: PetalConfig[] = [
  { id:1,  left:"3%",  size:18, duration:14, delay:0,   drift:"45px",  rot:"280deg", type:"flower",    color:"#C5A060" },
  { id:2,  left:"9%",  size:14, duration:19, delay:-5,  drift:"-30px", rot:"200deg", type:"leaf",      color:"#5E8A6A" },
  { id:3,  left:"17%", size:22, duration:16, delay:-9,  drift:"55px",  rot:"320deg", type:"petal",     color:"#D4856A" },
  { id:4,  left:"25%", size:13, duration:22, delay:-2,  drift:"-20px", rot:"240deg", type:"leaf",      color:"#6FA27A" },
  { id:5,  left:"33%", size:20, duration:17, delay:-12, drift:"35px",  rot:"180deg", type:"flower",    color:"#C9A96E" },
  { id:6,  left:"41%", size:16, duration:21, delay:-7,  drift:"-40px", rot:"300deg", type:"petal",     color:"#C5A060" },
  { id:7,  left:"49%", size:24, duration:15, delay:-3,  drift:"60px",  rot:"220deg", type:"leaf",      color:"#4A7860" },
  { id:8,  left:"57%", size:15, duration:20, delay:-10, drift:"-25px", rot:"260deg", type:"flower",    color:"#D4B87A" },
  { id:9,  left:"65%", size:21, duration:18, delay:-6,  drift:"40px",  rot:"190deg", type:"petal",     color:"#C07060" },
  { id:10, left:"73%", size:17, duration:23, delay:-1,  drift:"-35px", rot:"310deg", type:"leaf",      color:"#5E8A6A" },
  { id:11, left:"81%", size:19, duration:16, delay:-8,  drift:"50px",  rot:"230deg", type:"flower",    color:"#C5A060" },
  { id:12, left:"89%", size:13, duration:24, delay:-4,  drift:"-20px", rot:"270deg", type:"petal",     color:"#D4856A" },
  { id:13, left:"96%", size:20, duration:20, delay:-15, drift:"30px",  rot:"210deg", type:"leaf",      color:"#6FA27A" },
  { id:14, left:"6%",  size:23, duration:17, delay:-11, drift:"-45px", rot:"290deg", type:"rose",      color:"#E07080" },
  { id:15, left:"14%", size:15, duration:19, delay:-13, drift:"35px",  rot:"180deg", type:"hibiscus",  color:"#D4605A" },
  { id:16, left:"22%", size:20, duration:15, delay:-14, drift:"-30px", rot:"250deg", type:"butterfly", color:"#C5A060" },
  { id:17, left:"30%", size:12, duration:21, delay:-16, drift:"40px",  rot:"320deg", type:"star",      color:"#D4B87A" },
  { id:18, left:"38%", size:18, duration:18, delay:-3,  drift:"-35px", rot:"200deg", type:"rose",      color:"#C07060" },
  { id:19, left:"46%", size:14, duration:22, delay:-8,  drift:"25px",  rot:"280deg", type:"hibiscus",  color:"#E07080" },
  { id:20, left:"54%", size:22, duration:14, delay:-17, drift:"-50px", rot:"150deg", type:"butterfly", color:"#5E8A6A" },
  { id:21, left:"62%", size:11, duration:20, delay:-2,  drift:"30px",  rot:"340deg", type:"star",      color:"#C9A96E" },
  { id:22, left:"70%", size:19, duration:16, delay:-10, drift:"-40px", rot:"220deg", type:"rose",      color:"#D4856A" },
  { id:23, left:"78%", size:16, duration:23, delay:-6,  drift:"45px",  rot:"300deg", type:"leaf",      color:"#4A7860" },
  { id:24, left:"85%", size:21, duration:17, delay:-13, drift:"-55px", rot:"170deg", type:"hibiscus",  color:"#D4605A" },
  { id:25, left:"92%", size:14, duration:19, delay:-4,  drift:"20px",  rot:"260deg", type:"butterfly", color:"#C5A060" },
  { id:26, left:"2%",  size:17, duration:25, delay:-18, drift:"60px",  rot:"190deg", type:"flower",    color:"#D4B87A" },
  { id:27, left:"11%", size:13, duration:18, delay:-7,  drift:"-28px", rot:"330deg", type:"star",      color:"#C5A060" },
  { id:28, left:"19%", size:23, duration:21, delay:-9,  drift:"38px",  rot:"240deg", type:"rose",      color:"#E07080" },
  { id:29, left:"27%", size:16, duration:15, delay:-20, drift:"-42px", rot:"290deg", type:"petal",     color:"#C07060" },
  { id:30, left:"35%", size:20, duration:24, delay:-5,  drift:"52px",  rot:"210deg", type:"hibiscus",  color:"#D4605A" },
  { id:31, left:"43%", size:12, duration:17, delay:-11, drift:"-22px", rot:"160deg", type:"butterfly", color:"#5E8A6A" },
  { id:32, left:"51%", size:18, duration:20, delay:-14, drift:"44px",  rot:"310deg", type:"leaf",      color:"#6FA27A" },
];

function FlowerSVG({ color }: { color: string }) {
  return (
    <svg viewBox="-14 -14 28 28" fill={color} style={{ width: "100%", height: "100%" }} aria-hidden>
      <ellipse cx="0" cy="-7" rx="3.2" ry="5.8" opacity="0.85" />
      <ellipse cx="0" cy="-7" rx="3.2" ry="5.8" transform="rotate(72)" opacity="0.85" />
      <ellipse cx="0" cy="-7" rx="3.2" ry="5.8" transform="rotate(144)" opacity="0.85" />
      <ellipse cx="0" cy="-7" rx="3.2" ry="5.8" transform="rotate(216)" opacity="0.85" />
      <ellipse cx="0" cy="-7" rx="3.2" ry="5.8" transform="rotate(288)" opacity="0.85" />
      <circle cx="0" cy="0" r="2.8" fill="rgba(255,255,255,0.65)" />
    </svg>
  );
}

function LeafSVG({ color }: { color: string }) {
  return (
    <svg viewBox="-8 -13 16 26" fill={color} style={{ width: "100%", height: "100%" }} aria-hidden>
      <path d="M0,-12 C6,-8 8,-3 7,3 C6,9 3,12 0,13 C-3,12 -6,9 -7,3 C-8,-3 -6,-8 0,-12Z" opacity="0.9" />
      <line x1="0" y1="-11" x2="0" y2="12" stroke="rgba(255,255,255,0.35)" strokeWidth="0.9" />
    </svg>
  );
}

function PetalSVG({ color }: { color: string }) {
  return (
    <svg viewBox="-7 -12 14 24" fill={color} style={{ width: "100%", height: "100%" }} aria-hidden>
      <path d="M0,-11 C4.5,-7 6,-2 5,3 C4,8 2.5,11 0,11 C-2.5,11 -4,8 -5,3 C-6,-2 -4.5,-7 0,-11Z" opacity="0.85" />
    </svg>
  );
}

function RoseSVG({ color }: { color: string }) {
  return (
    <svg viewBox="-12 -12 24 24" fill={color} style={{ width: "100%", height: "100%" }} aria-hidden>
      <circle cx="0" cy="0" r="3.5" opacity="0.9" />
      <path d="M0,-8 C3,-6 5,-3 4,0 C3,3 1,5 0,5 C-1,5 -3,3 -4,0 C-5,-3 -3,-6 0,-8Z" opacity="0.8" />
      <path d="M8,0 C6,3 3,5 0,4 C-3,3 -5,1 -5,0 C-5,-1 -3,-3 0,-4 C3,-5 6,-3 8,0Z" opacity="0.75" transform="rotate(72)" />
      <path d="M8,0 C6,3 3,5 0,4 C-3,3 -5,1 -5,0 C-5,-1 -3,-3 0,-4 C3,-5 6,-3 8,0Z" opacity="0.7" transform="rotate(144)" />
      <path d="M8,0 C6,3 3,5 0,4 C-3,3 -5,1 -5,0 C-5,-1 -3,-3 0,-4 C3,-5 6,-3 8,0Z" opacity="0.7" transform="rotate(216)" />
      <path d="M8,0 C6,3 3,5 0,4 C-3,3 -5,1 -5,0 C-5,-1 -3,-3 0,-4 C3,-5 6,-3 8,0Z" opacity="0.75" transform="rotate(288)" />
    </svg>
  );
}

function HibiscusSVG({ color }: { color: string }) {
  return (
    <svg viewBox="-13 -13 26 26" fill={color} style={{ width: "100%", height: "100%" }} aria-hidden>
      <path d="M0,-11 C2,-8 3,-5 2,-2 C1,1 0,3 0,3 C0,3 -1,1 -2,-2 C-3,-5 -2,-8 0,-11Z" opacity="0.9" />
      <path d="M0,-11 C2,-8 3,-5 2,-2 C1,1 0,3 0,3 C0,3 -1,1 -2,-2 C-3,-5 -2,-8 0,-11Z" opacity="0.9" transform="rotate(72)" />
      <path d="M0,-11 C2,-8 3,-5 2,-2 C1,1 0,3 0,3 C0,3 -1,1 -2,-2 C-3,-5 -2,-8 0,-11Z" opacity="0.9" transform="rotate(144)" />
      <path d="M0,-11 C2,-8 3,-5 2,-2 C1,1 0,3 0,3 C0,3 -1,1 -2,-2 C-3,-5 -2,-8 0,-11Z" opacity="0.9" transform="rotate(216)" />
      <path d="M0,-11 C2,-8 3,-5 2,-2 C1,1 0,3 0,3 C0,3 -1,1 -2,-2 C-3,-5 -2,-8 0,-11Z" opacity="0.9" transform="rotate(288)" />
      <circle cx="0" cy="0" r="2.2" fill="#fff" opacity="0.85" />
      <circle cx="0" cy="-1.2" r="0.8" fill={color} opacity="0.9" />
    </svg>
  );
}

function ButterflySVG({ color }: { color: string }) {
  return (
    <svg viewBox="-14 -10 28 20" fill={color} style={{ width: "100%", height: "100%" }} aria-hidden>
      <path d="M0,0 C-2,-4 -7,-8 -12,-6 C-10,-2 -6,2 0,0Z" opacity="0.8" />
      <path d="M0,0 C2,-4 7,-8 12,-6 C10,-2 6,2 0,0Z" opacity="0.8" />
      <path d="M0,0 C-1,3 -5,7 -9,6 C-7,3 -3,1 0,0Z" opacity="0.7" />
      <path d="M0,0 C1,3 5,7 9,6 C7,3 3,1 0,0Z" opacity="0.7" />
      <ellipse cx="0" cy="0" rx="1" ry="4" fill="#2D4A3E" opacity="0.6" />
    </svg>
  );
}

function StarSVG({ color }: { color: string }) {
  return (
    <svg viewBox="-12 -12 24 24" fill={color} style={{ width: "100%", height: "100%" }} aria-hidden>
      <path d="M0,-10 L2.4,-3.1 L9.5,-3.1 L3.8,1.2 L6.1,8.1 L0,4 L-6.1,8.1 L-3.8,1.2 L-9.5,-3.1 L-2.4,-3.1Z" opacity="0.85" />
    </svg>
  );
}

export function FloatingDecor() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Decoraciones laterales */}
      <div className={styles.decorLeft}>
        <div className={`${styles.decorImage} ${styles.decorA}`}>
          <Image src="/Grupo01_a.webp" alt="" width={200} height={200} className={styles.image} priority />
        </div>
        <div className={`${styles.decorImage} ${styles.decorB}`}>
          <Image src="/Grupo01_b.webp" alt="" width={180} height={180} className={styles.image} priority />
        </div>
      </div>

      <div className={styles.decorRight}>
        <div className={`${styles.decorImage} ${styles.decorC}`}>
          <Image src="/Grupo01_c.webp" alt="" width={220} height={220} className={styles.image} priority />
        </div>
        <div className={`${styles.decorImage} ${styles.decorA}`}>
          <Image src="/Grupo01_a.webp" alt="" width={190} height={190} className={styles.image} priority />
        </div>
      </div>

      {/* Pétalos y flores flotantes */}
      {PETALS.map((petal) => (
        <div
          key={petal.id}
          className={styles.petal}
          style={{
            left: petal.left,
            width: `${petal.size}px`,
            height: `${petal.size}px`,
            "--duration": `${petal.duration}s`,
            "--delay": `${petal.delay}s`,
            "--drift": petal.drift,
            "--rot": petal.rot,
          } as React.CSSProperties}
        >
          {petal.type === "flower"    && <FlowerSVG    color={petal.color} />}
          {petal.type === "leaf"      && <LeafSVG      color={petal.color} />}
          {petal.type === "petal"     && <PetalSVG     color={petal.color} />}
          {petal.type === "rose"      && <RoseSVG      color={petal.color} />}
          {petal.type === "hibiscus"  && <HibiscusSVG  color={petal.color} />}
          {petal.type === "butterfly" && <ButterflySVG color={petal.color} />}
          {petal.type === "star"      && <StarSVG      color={petal.color} />}
        </div>
      ))}
    </>
  );
}