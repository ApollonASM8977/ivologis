"use client";

/**
 * APERÇU UNIQUEMENT (branche preview/animations) : effets repris de Magic UI (magicuidesign/magicui, MIT),
 * Cult UI (nolly-studio/cult-ui, MIT) et Skiper UI (composants gratuits, skiper-ui.com).
 * Code relu avant usage (aucun appel réseau, cookie, stockage, eval ni script externe), adapté à Tailwind 3
 * et aux couleurs IVOLOGIS ; `react-use-measure` remplacé par ResizeObserver (aucune dépendance ajoutée).
 */

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { AnimatePresence, motion, MotionConfig, useInView, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import clsx from "clsx";
import s from "./preview.module.css";

const BLUE = "#0B5FFF";

/** Magic UI — Blur Fade : apparition floue au défilement. */
export function BlurFade({ children, className, delay = 0, y = 8 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ delay: 0.04 + delay, duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/** Magic UI — Number Ticker : compteur animé quand il devient visible. */
export function NumberTicker({ value, locale, className }: { value: number; locale: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { damping: 60, stiffness: 100 });
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, mv, value]);
  useEffect(
    () =>
      spring.on("change", (v) => {
        if (ref.current) ref.current.textContent = Intl.NumberFormat(locale).format(Math.round(v));
      }),
    [spring, locale],
  );
  return (
    <span ref={ref} className={clsx("inline-block tabular-nums", className)}>
      0
    </span>
  );
}

/** Magic UI — Border Beam : faisceau lumineux qui parcourt le bord d'une carte. */
export function BorderBeam({ size = 90, duration = 7, delay = 0, from = BLUE, to = "#7DD3FC", width = 2 }: { size?: number; duration?: number; delay?: number; from?: string; to?: string; width?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-transparent"
      style={{
        borderWidth: width,
        borderStyle: "solid",
        mask: "linear-gradient(transparent, transparent), linear-gradient(#000, #000)",
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
        maskClip: "padding-box, border-box",
        WebkitMaskClip: "padding-box, border-box",
      } as CSSProperties}
    >
      <motion.div
        className="absolute aspect-square"
        style={{ width: size, offsetPath: `rect(0 auto auto 0 round ${size}px)`, background: `linear-gradient(to left, ${from}, ${to}, transparent)` }}
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: ["0%", "100%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration, delay: -delay }}
      />
    </div>
  );
}

/** Magic UI — Word Rotate : mots qui défilent à la même place. */
export function WordRotate({ words, className, every = 2600 }: { words: string[]; className?: string; every?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % words.length), every);
    return () => clearInterval(id);
  }, [words, every]);
  return (
    // Hauteur fixe de deux lignes : le titre ne saute pas quand un mot plus long arrive (pas de décalage de mise en page).
    <span className="relative block min-h-[2.3em] overflow-hidden py-1">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[i]}
          className={clsx("inline-block", className)}
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Magic UI — Animated Grid Pattern : quadrillage dont des cases s'allument au hasard. */
export function AnimatedGridPattern({ cell = 44, count = 28, maxOpacity = 0.35, className }: { cell?: number; count?: number; maxOpacity?: number; className?: string }) {
  const id = useId();
  const ref = useRef<SVGSVGElement | null>(null);
  const [dim, setDim] = useState({ w: 0, h: 0 });
  const [squares, setSquares] = useState<{ id: number; pos: [number, number]; it: number }[]>([]);
  const pos = (): [number, number] => [Math.floor((Math.random() * dim.w) / cell), Math.floor((Math.random() * dim.h) / cell)];
  useEffect(() => {
    if (dim.w && dim.h) setSquares(Array.from({ length: count }, (_, i) => ({ id: i, pos: pos(), it: 0 })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dim.w, dim.h, count]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setDim((d) => (d.w === e.contentRect.width && d.h === e.contentRect.height ? d : { w: e.contentRect.width, h: e.contentRect.height })));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const move = (sid: number) => setSquares((sq) => sq.map((q) => (q.id === sid ? { ...q, pos: pos(), it: q.it + 1 } : q)));
  return (
    <svg ref={ref} aria-hidden="true" className={clsx("pointer-events-none absolute inset-0 h-full w-full", className)} style={{ fill: `${BLUE}33`, stroke: `${BLUE}1A` }}>
      <defs>
        <pattern id={id} width={cell} height={cell} patternUnits="userSpaceOnUse" x={-1} y={-1}>
          <path d={`M.5 ${cell}V.5H${cell}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={-1} y={-1} className="overflow-visible">
        {squares.map(({ pos: [x, y], id: sid, it }, index) => (
          <motion.rect
            key={`${sid}-${it}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: maxOpacity }}
            transition={{ duration: 3, repeat: 1, delay: index * 0.1, repeatType: "reverse", repeatDelay: 0.5 }}
            onAnimationComplete={() => move(sid)}
            width={cell - 1}
            height={cell - 1}
            x={x * cell + 1}
            y={y * cell + 1}
            fill="currentColor"
            className="text-primary/30"
            strokeWidth="0"
          />
        ))}
      </svg>
    </svg>
  );
}

/** Magic UI — Animated Beam : faisceau animé entre deux éléments. */
export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 4,
  delay = 0,
}: {
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  duration?: number;
  delay?: number;
}) {
  const id = useId();
  const [d, setD] = useState("");
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const update = () => {
      const c = containerRef.current, a = fromRef.current, b = toRef.current;
      if (!c || !a || !b) return;
      const rc = c.getBoundingClientRect(), ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      setBox({ w: rc.width, h: rc.height });
      const sx = ra.left - rc.left + ra.width / 2, sy = ra.top - rc.top + ra.height / 2;
      const ex = rb.left - rc.left + rb.width / 2, ey = rb.top - rc.top + rb.height / 2;
      setD(`M ${sx},${sy} Q ${(sx + ex) / 2},${sy - curvature} ${ex},${ey}`);
    };
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    update();
    return () => ro.disconnect();
  }, [containerRef, fromRef, toRef, curvature]);
  const g = reverse ? { x1: ["90%", "-10%"], x2: ["100%", "0%"] } : { x1: ["10%", "110%"], x2: ["0%", "100%"] };
  return (
    <svg aria-hidden="true" fill="none" width={box.w} height={box.h} viewBox={`0 0 ${box.w} ${box.h}`} className="pointer-events-none absolute left-0 top-0">
      <path d={d} stroke="#94A3B8" strokeWidth={2} strokeOpacity={0.25} strokeLinecap="round" />
      <path d={d} stroke={`url(#${id})`} strokeWidth={2} strokeLinecap="round" />
      <defs>
        <motion.linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
          animate={{ x1: g.x1, x2: g.x2, y1: ["0%", "0%"], y2: ["0%", "0%"] }}
          transition={{ delay, duration, ease: [0.16, 1, 0.3, 1], repeat: Infinity }}
        >
          <stop stopColor={BLUE} stopOpacity="0" />
          <stop stopColor={BLUE} />
          <stop offset="32.5%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
}

/** Magic UI — Shimmer Button : reflet lumineux qui tourne autour du bouton (CSS pur). */
export function ShimmerLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className={clsx(s.shimmer, "group relative z-0 inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-transform duration-300 hover:-translate-y-0.5")} style={{ background: BLUE }}>
      <span className={clsx(s.sparkBox, "absolute inset-0 -z-30 overflow-visible blur-[2px]")}>
        <span className={clsx(s.spark, "absolute inset-0 aspect-square h-full")}>
          <span className={clsx(s.sparkBefore, "absolute -inset-full")} />
        </span>
      </span>
      {children}
      <span className="absolute inset-0 rounded-xl shadow-[inset_0_-8px_10px_#ffffff1f] transition-all duration-300 group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]" />
      <span className="absolute -z-20 rounded-xl" style={{ inset: "0.05em", background: BLUE }} />
    </a>
  );
}

/** Magic UI — Magic Card : bordure et halo qui suivent le pointeur. */
export function MagicCard({ children, className }: { children: ReactNode; className?: string }) {
  const size = 220;
  const x = useMotionValue(-size);
  const y = useMotionValue(-size);
  const border = useMotionTemplate`linear-gradient(#fff 0 0) padding-box, radial-gradient(${size}px circle at ${x}px ${y}px, ${BLUE}, #7DD3FC, #E5E7EB 100%) border-box`;
  const glow = useMotionTemplate`radial-gradient(${size}px circle at ${x}px ${y}px, ${BLUE}14, transparent 100%)`;
  return (
    <motion.div
      className={clsx("group relative isolate overflow-hidden rounded-2xl border border-transparent", className)}
      style={{ background: border }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      onPointerLeave={() => {
        x.set(-size);
        y.set(-size);
      }}
    >
      <motion.div className="pointer-events-none absolute inset-px z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: glow }} />
      <div className="relative z-20">{children}</div>
    </motion.div>
  );
}

/** Cult UI — Direction Aware Tabs : le contenu glisse du côté de l'onglet choisi, la bulle suit. */
export function DirectionAwareTabs({ tabs, label }: { tabs: { id: number; label: string; content: ReactNode }[]; label: string }) {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(0);
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setHeight(e.contentRect.height + 8));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const variants = {
    initial: (d: number) => ({ x: 300 * d, opacity: 0, filter: "blur(4px)" }),
    active: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: (d: number) => ({ x: -300 * d, opacity: 0, filter: "blur(4px)" }),
  };
  return (
    <div className="flex w-full flex-col items-center">
      <div role="tablist" aria-label={label} className="flex space-x-1 rounded-full bg-primary-dark p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => {
              if (tab.id === active) return;
              setDir(tab.id > active ? 1 : -1);
              setActive(tab.id);
            }}
            className={clsx("relative rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white", active === tab.id ? "text-primary-dark" : "text-white/80 hover:text-white")}
          >
            {active === tab.id && <motion.span layoutId="ivo-bubble" className="absolute inset-0 z-0 rounded-full bg-white" transition={{ type: "spring", bounce: 0.19, duration: 0.4 }} />}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
      <MotionConfig transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}>
        <motion.div className="relative mt-8 w-full overflow-hidden" initial={false} animate={{ height }}>
          <div ref={inner} className="p-1">
            <AnimatePresence custom={dir} mode="popLayout">
              <motion.div key={active} role="tabpanel" variants={variants} initial="initial" animate="active" exit="exit" custom={dir}>
                {tabs.find((t) => t.id === active)?.content}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </MotionConfig>
    </div>
  );
}

/** Skiper UI (skiper58) — Text Roll : les lettres roulent au survol. */
export function TextRoll({ children, className }: { children: string; className?: string }) {
  const letters = children.split("");
  const delay = (i: number) => 0.025 * Math.abs(i - (letters.length - 1) / 2);
  return (
    <motion.span initial="initial" whileHover="hovered" className={clsx("relative block overflow-hidden", className)} aria-label={children}>
      <span aria-hidden="true" className="block">
        {letters.map((l, i) => (
          <motion.span key={i} className="inline-block whitespace-pre" variants={{ initial: { y: 0 }, hovered: { y: "-100%" } }} transition={{ ease: "easeInOut", delay: delay(i) }}>
            {l}
          </motion.span>
        ))}
      </span>
      <span aria-hidden="true" className="absolute inset-0 text-primary">
        {letters.map((l, i) => (
          <motion.span key={i} className="inline-block whitespace-pre" variants={{ initial: { y: "100%" }, hovered: { y: 0 } }} transition={{ ease: "easeInOut", delay: delay(i) }}>
            {l}
          </motion.span>
        ))}
      </span>
    </motion.span>
  );
}

