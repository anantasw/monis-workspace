"use client";

import { useId, type KeyboardEvent, type ReactNode, type Ref } from "react";
import type { Phase } from "@/domain/bali-time";
import { PRODUCT_BY_ID, type Product } from "@/domain/catalog";
import type { Setup } from "@/domain/setup";
import {
  ART,
  ArtDefs,
  DESK_TOP,
  INK,
  MONITOR_NECK,
  RISER_H,
  deskWidthFor,
  monitorSize,
} from "./art";

const VIEW_W = 1200;
const VIEW_H = 760;
const FLOOR_Y = 630;
const DESK_X = 660;
const DESK_Y = 690;
const CHAIR_Y = 752;
const BLEED = 1600;

type SkyStyle = { sky: string; skyOpacity: number; light: string; lightOpacity: number; dim: number };

const PHASES: Record<Phase, SkyStyle> = {
  morning: { sky: INK.lagoon, skyOpacity: 0.32, light: INK.sun, lightOpacity: 0.34, dim: 0 },
  noon: { sky: INK.lagoon, skyOpacity: 0.5, light: INK.sun, lightOpacity: 0.22, dim: 0 },
  sunset: { sky: INK.pink, skyOpacity: 0.7, light: INK.pink, lightOpacity: 0.2, dim: 0.08 },
  night: { sky: INK.navy, skyOpacity: 0.95, light: INK.sun, lightOpacity: 0, dim: 0.3 },
};

interface SceneProps {
  /** React 19: ref is a normal prop. Used to export the room as an image. */
  ref?: Ref<SVGSVGElement>;
  setup: Setup;
  phase: Phase;
  /** Called when the user taps an item in the room. */
  onItemClick?: (product: Product) => void;
  onEmptySlotClick?: () => void;
  interactive?: boolean;
  className?: string;
  title?: string;
}

/** One placed item: moves smoothly to its spot and drops in when it first appears. */
function Placed({
  x,
  y,
  product,
  onActivate,
  children,
  scale = 1,
}: {
  x: number;
  y: number;
  product?: Product;
  onActivate?: (p: Product) => void;
  children: ReactNode;
  scale?: number;
}) {
  const clickable = Boolean(product && onActivate);
  const onKey = (e: KeyboardEvent<SVGGElement>) => {
    if (product && onActivate && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onActivate(product);
    }
  };
  return (
    <g className="placed" style={{ transform: `translate(${x}px, ${y}px) scale(${scale})` }}>
      <g
        className={`drop-in ${clickable ? "scene-item" : ""}`}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        aria-label={clickable && product ? `${product.name}. Show in the list` : undefined}
        onClick={clickable && product ? () => onActivate?.(product) : undefined}
        onKeyDown={clickable ? onKey : undefined}
      >
        {children}
      </g>
    </g>
  );
}

function Draw({ product, deskWidth, weaveId }: { product: Product; deskWidth?: number; weaveId?: string }) {
  const D = ART[product.art].Draw;
  return <D product={product} deskWidth={deskWidth} weaveId={weaveId} />;
}

export function Scene({
  ref,
  setup,
  phase,
  onItemClick,
  onEmptySlotClick,
  interactive = true,
  className,
  title = "Preview of your workspace",
}: SceneProps) {
  // Unique per SVG: the room is drawn on the builder and again on the postcard.
  const weaveId = useId();
  const style = PHASES[phase];
  const act = interactive ? onItemClick : undefined;
  const desk = PRODUCT_BY_ID[setup.deskId];
  const chair = setup.chairId ? PRODUCT_BY_ID[setup.chairId] : undefined;
  const has = (id: string) => (setup.items[id] ?? 0) > 0;
  const deskW = deskWidthFor(desk);

  // Monitors in the order they were added, one entry per unit.
  const monitors: Product[] = Object.entries(setup.items).flatMap(([id, qty]) => {
    const p = PRODUCT_BY_ID[id];
    return p?.category === "monitor" ? Array.from({ length: qty }, () => p) : [];
  });
  const riser = has("monitor-riser") ? PRODUCT_BY_ID["monitor-riser"] : undefined;
  const laptop = has("laptop-stand") ? PRODUCT_BY_ID["laptop-stand"] : undefined;
  const lamp = has("lamp-1s") ? PRODUCT_BY_ID["lamp-1s"] : undefined;
  const deskPlant = has("plant-desk") ? PRODUCT_BY_ID["plant-desk"] : undefined;

  // Lay out the desk top from left to right: plant, laptop, screens, lamp.
  const gap = 18;
  const monitorWidths = monitors.map((m) => monitorSize(m).w);
  const screensW = monitors.length
    ? monitorWidths.reduce((a, b) => a + b, 0) + gap * (monitors.length - 1)
    : 190;
  const blocks: { key: string; w: number }[] = [];
  if (deskPlant) blocks.push({ key: "plant", w: 70 });
  if (laptop) blocks.push({ key: "laptop", w: 156 });
  blocks.push({ key: "screens", w: screensW + (riser ? 24 : 0) });
  if (lamp) blocks.push({ key: "lamp", w: 96 });
  const rowW = blocks.reduce((a, b) => a + b.w, 0) + gap * 2 * (blocks.length - 1);
  const fit = Math.min(1, (deskW - 24) / rowW);
  const centers: Record<string, number> = {};
  let cursor = -rowW / 2;
  for (const b of blocks) {
    centers[b.key] = cursor + b.w / 2;
    cursor += b.w + gap * 2;
  }
  const lift = riser ? RISER_H : 0;
  let mx = centers.screens - screensW / 2;
  const monitorPos = monitors.map((m, i) => {
    const x = mx + monitorWidths[i] / 2;
    mx += monitorWidths[i] + gap;
    return x;
  });
  const middle = monitors.length ? Math.floor((monitors.length - 1) / 2) : -1;
  const webcamOn =
    middle >= 0
      ? { x: monitorPos[middle], y: -lift - MONITOR_NECK - monitorSize(monitors[middle]).h }
      : laptop
        ? { x: centers.laptop, y: -146 }
        : { x: centers.screens, y: 0 };

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={className}
      role="img"
      aria-label={title}
      data-phase={phase}
      preserveAspectRatio="xMidYMid meet"
      style={{ isolation: "isolate" }}
    >
      <ArtDefs weaveId={weaveId} />

      {/* Wall and floor */}
      {/* Wall and floor run past the viewBox so the room fills any frame shape. */}
      <rect x={-BLEED} y={-BLEED} width={VIEW_W + BLEED * 2} height={FLOOR_Y + BLEED} fill={INK.paper} />
      <rect x={-BLEED} y={FLOOR_Y} width={VIEW_W + BLEED * 2} height={VIEW_H - FLOOR_Y + BLEED} fill={INK.paper} />
      <rect x={-BLEED} y={FLOOR_Y} width={VIEW_W + BLEED * 2} height={VIEW_H - FLOOR_Y + BLEED} fill={INK.lagoon} fillOpacity={0.16} style={{ mixBlendMode: "multiply" }} />
      <g stroke={INK.navy} strokeOpacity={0.18} strokeWidth={2}>
        {[-570, -390, -210, -30, 150, 330, 510, 690, 870, 1050, 1230, 1410, 1590].map((x) => (
          <line key={x} x1={x} y1={FLOOR_Y} x2={x - 120} y2={VIEW_H} />
        ))}
      </g>
      <line x1={-BLEED} y1={FLOOR_Y} x2={VIEW_W + BLEED} y2={FLOOR_Y} stroke={INK.navy} strokeWidth={3} />

      {/* Rattan pendant hanging from the ceiling */}
      <g>
        <line x1={DESK_X - 40} y1={-BLEED} x2={DESK_X - 40} y2={96} stroke={INK.navy} strokeWidth={2.5} />
        <path d={`M${DESK_X - 96} 168 Q${DESK_X - 40} 70 ${DESK_X + 16} 168 Z`} fill={INK.sun} fillOpacity={0.75} style={{ mixBlendMode: "multiply" }} transform="translate(3 2)" />
        <path d={`M${DESK_X - 96} 168 Q${DESK_X - 40} 70 ${DESK_X + 16} 168 Z`} fill={`url(#${weaveId})`} fillOpacity={0.5} stroke={INK.navy} strokeWidth={3} strokeLinejoin="round" />
      </g>

      {/* Louvred window with the Bali sky */}
      <g>
        <rect x={84} y={70} width={276} height={300} fill={style.sky} fillOpacity={style.skyOpacity} className="phase-fade" style={{ mixBlendMode: "multiply" }} />
        {phase === "night" ? (
          <circle cx={290} cy={130} r={22} fill={INK.paper} />
        ) : (
          <circle cx={phase === "sunset" ? 250 : 290} cy={phase === "sunset" ? 300 : 130} r={phase === "sunset" ? 40 : 30} fill={INK.sun} fillOpacity={0.95} style={{ mixBlendMode: "multiply" }} />
        )}
        {/* Rice terrace lines and a palm */}
        <path d="M84 330 C150 312 220 318 360 300 M84 352 C170 338 250 344 360 328" stroke={INK.leaf} strokeWidth={4} fill="none" opacity={phase === "night" ? 0.25 : 0.7} />
        <g opacity={phase === "night" ? 0.55 : 0.9} style={{ mixBlendMode: "multiply" }} className="palm">
          <path d="M150 370 C156 300 164 230 176 168" stroke={INK.navy} strokeWidth={6} fill="none" />
          <path d="M176 168 C140 140 110 150 90 176 C120 160 150 160 176 168 Z M176 168 C200 130 236 126 262 140 C230 142 200 152 176 168 Z M176 168 C150 120 160 96 184 82 C182 110 182 140 176 168 Z M176 168 C214 168 240 190 248 220 C222 196 200 182 176 168 Z" fill={INK.leaf} fillOpacity={0.9} />
        </g>
        <rect x={84} y={70} width={276} height={300} fill="none" stroke={INK.navy} strokeWidth={5} />
        <line x1={222} y1={70} x2={222} y2={370} stroke={INK.navy} strokeWidth={4} />
        {/* Open shutters */}
        {[44, 362].map((x) => (
          <g key={x}>
            <rect x={x} y={70} width={38} height={300} fill={INK.sun} fillOpacity={0.55} stroke={INK.navy} strokeWidth={3} style={{ mixBlendMode: "multiply" }} />
            {Array.from({ length: 13 }, (_, i) => (
              <line key={i} x1={x + 6} x2={x + 32} y1={88 + i * 21} y2={92 + i * 21} stroke={INK.navy} strokeWidth={2} />
            ))}
          </g>
        ))}
        <rect x={70} y={370} width={304} height={14} fill={INK.paper} stroke={INK.navy} strokeWidth={3} />
      </g>

      {/* Light from the window */}
      <polygon
        points="84,384 360,384 860,760 380,760"
        fill={style.light}
        fillOpacity={style.lightOpacity}
        className="phase-fade"
        style={{ mixBlendMode: "multiply" }}
      />

      <text x={420} y={246} fontFamily="var(--font-note)" fontSize={30} fill={INK.navy} transform="rotate(-5 420 246)">
        hello from Canggu
      </text>

      {/* Back of the room: purifier and coffee corner */}
      {has("purifier-elite") ? (
        <Placed x={300} y={672} product={PRODUCT_BY_ID["purifier-elite"]} onActivate={act} key="purifier">
          <Draw product={PRODUCT_BY_ID["purifier-elite"]} />
        </Placed>
      ) : null}
      {has("coffee-essenza") ? (
        <Placed x={1074} y={700} product={PRODUCT_BY_ID["coffee-essenza"]} onActivate={act} key="coffee">
          <Draw product={PRODUCT_BY_ID["coffee-essenza"]} />
          <text x={-60} y={-300} fontFamily="var(--font-note)" fontSize={26} fill={INK.navy} transform="rotate(-4 -60 -300)" stroke="none">
            your coffee
          </text>
        </Placed>
      ) : null}

      {/* Desk */}
      {desk ? (
        <Placed x={DESK_X} y={DESK_Y} product={desk} onActivate={act} key={`desk-${desk.id}`}>
          <Draw product={desk} deskWidth={deskW} />
        </Placed>
      ) : null}

      {/* Desk top */}
      <g className="placed" style={{ transform: `translate(${DESK_X}px, ${DESK_Y - DESK_TOP}px) scale(${fit})` }}>
        {deskPlant ? (
          <Placed x={centers.plant} y={0} product={deskPlant} onActivate={act} key="plant-desk">
            <Draw product={deskPlant} />
          </Placed>
        ) : null}
        {laptop ? (
          <Placed x={centers.laptop} y={0} product={laptop} onActivate={act} key="laptop">
            <Draw product={laptop} />
          </Placed>
        ) : null}
        {riser ? (
          <Placed x={centers.screens} y={0} product={riser} onActivate={act} key="riser">
            <Draw product={riser} deskWidth={Math.max(screensW + 24, 160)} />
          </Placed>
        ) : null}
        {monitors.map((m, i) => (
          <Placed key={`mon-${i}-${m.id}`} x={monitorPos[i]} y={-lift} product={m} onActivate={act}>
            <Draw product={m} />
          </Placed>
        ))}
        {monitors.length === 0 ? (
          <g
            className={interactive ? "scene-item" : undefined}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? "Add a screen" : undefined}
            onClick={interactive ? onEmptySlotClick : undefined}
            onKeyDown={(e) => {
              if (interactive && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onEmptySlotClick?.();
              }
            }}
          >
            <rect x={centers.screens - 90} y={-150} width={180} height={104} rx={8} fill={INK.paper} fillOpacity={0.6} stroke={INK.navy} strokeWidth={2.5} strokeDasharray="10 8" />
            <text x={centers.screens} y={-92} textAnchor="middle" fill={INK.navy} fontSize={22} fontWeight={700} fontFamily="var(--font-bricolage)">
              + add a screen
            </text>
          </g>
        ) : null}
        {lamp ? (
          <Placed x={centers.lamp} y={0} product={lamp} onActivate={act} key="lamp">
            <Draw product={lamp} />
          </Placed>
        ) : null}
        {has("webcam-4k") ? (
          <Placed x={webcamOn.x} y={webcamOn.y} product={PRODUCT_BY_ID["webcam-4k"]} onActivate={act} key="webcam">
            <Draw product={PRODUCT_BY_ID["webcam-4k"]} />
          </Placed>
        ) : null}
        {has("keyboard-mx") ? (
          <Placed x={centers.screens - 10} y={0} product={PRODUCT_BY_ID["keyboard-mx"]} onActivate={act} key="keyboard">
            <Draw product={PRODUCT_BY_ID["keyboard-mx"]} />
          </Placed>
        ) : null}
        {has("mouse-mx") ? (
          <Placed x={centers.screens + 106} y={0} product={PRODUCT_BY_ID["mouse-mx"]} onActivate={act} key="mouse">
            <Draw product={PRODUCT_BY_ID["mouse-mx"]} />
          </Placed>
        ) : null}
        {monitors.some((m) => m.id === "mon-studio") ? (
          <text
            x={monitorPos[monitors.findIndex((m) => m.id === "mon-studio")] + 70}
            y={-lift - 200}
            fontFamily="var(--font-note)"
            fontSize={28}
            fill={INK.navy}
            transform={`rotate(8 ${monitorPos[monitors.findIndex((m) => m.id === "mon-studio")] + 70} ${-lift - 200})`}
          >
            5K!
          </text>
        ) : null}
      </g>

      {/* Front: floor plant and chair */}
      {has("plant-floor") ? (
        <Placed x={170} y={742} product={PRODUCT_BY_ID["plant-floor"]} onActivate={act} key="plant-floor">
          <Draw product={PRODUCT_BY_ID["plant-floor"]} />
        </Placed>
      ) : null}
      {chair ? (
        <Placed x={DESK_X + 20} y={CHAIR_Y} scale={0.8} product={chair} onActivate={act} key={`chair-${chair.id}`}>
          <Draw product={chair} weaveId={weaveId} />
        </Placed>
      ) : null}

      {/* Evening dims the room; the lamp and the screens still glow. */}
      <rect x={-BLEED} y={-BLEED} width={VIEW_W + BLEED * 2} height={VIEW_H + BLEED * 2} fill={INK.navy} fillOpacity={style.dim} className="phase-fade" style={{ mixBlendMode: "multiply" }} pointerEvents="none" />
      {lamp && (phase === "night" || phase === "sunset") ? (
        <g style={{ transform: `translate(${DESK_X}px, ${DESK_Y - DESK_TOP}px) scale(${fit})` }} pointerEvents="none">
          <polygon
            points={`${centers.lamp - 50},${-196} ${centers.lamp - 6},${-210} ${centers.lamp + 60},0 ${centers.lamp - 210},0`}
            fill={INK.sun}
            fillOpacity={phase === "night" ? 0.42 : 0.22}
          />
        </g>
      ) : null}

    </svg>
  );
}
