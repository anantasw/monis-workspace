import { cloneElement, type ReactElement, type ReactNode, type SVGProps } from "react";
import type { ArtKey, Product } from "@/domain/catalog";

// Every item is drawn the riso way: a paper knockout, an ink fill printed slightly off-register
// (multiply), then navy line art on top. Origin (0, 0) is the item's bottom-centre.

export const INK = {
  navy: "var(--color-brand)",
  lagoon: "var(--color-lagoon)",
  sun: "var(--color-sun)",
  pink: "var(--color-frangipani)",
  leaf: "var(--color-leaf)",
  paper: "var(--color-paper)",
} as const;

type Shape = ReactElement<SVGProps<SVGElement>>;
type Part = { ink?: string; opacity?: number; el: Shape };

export function Riso({ parts, details, offset = 3 }: { parts: Part[]; details?: ReactNode; offset?: number }) {
  return (
    <g>
      <g fill={INK.paper}>{parts.map((p, i) => cloneElement(p.el, { key: `k${i}` }))}</g>
      <g transform={`translate(${offset} ${offset * 0.66})`} style={{ mixBlendMode: "multiply" }}>
        {parts.map((p, i) =>
          p.ink ? cloneElement(p.el, { key: `i${i}`, fill: p.ink, fillOpacity: p.opacity ?? 0.92 }) : null,
        )}
      </g>
      <g fill="none" stroke={INK.navy} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
        {parts.map((p, i) => cloneElement(p.el, { key: `l${i}` }))}
        {details}
      </g>
    </g>
  );
}

export type ArtProps = { product?: Product; deskWidth?: number };
export type ArtDef = { w: (p: ArtProps) => number; h: (p: ArtProps) => number; Draw: (p: ArtProps) => ReactElement };

export const DESK_TOP = 170;
export const MONITOR_NECK = 52;
export const RISER_H = 26;

export function deskWidthFor(product?: Product): number {
  const cm = product?.meta?.widthCm ?? 120;
  return Math.round(cm * 4.4);
}

export function monitorSize(product?: Product): { w: number; h: number } {
  const w = product?.meta?.screenWidth ?? 180;
  return { w, h: Math.round(w * 0.58) };
}

function StandingDesk({ deskWidth = 528 }: ArtProps) {
  const w = deskWidth;
  const legX = w / 2 - 56;
  return (
    <Riso
      parts={[
        { ink: INK.lagoon, el: <rect x={-w / 2} y={-DESK_TOP} width={w} height={18} rx={4} /> },
        { ink: INK.navy, opacity: 0.25, el: <rect x={-legX - 12} y={-DESK_TOP + 18} width={24} height={DESK_TOP - 30} /> },
        { ink: INK.navy, opacity: 0.25, el: <rect x={legX - 12} y={-DESK_TOP + 18} width={24} height={DESK_TOP - 30} /> },
        { ink: INK.lagoon, el: <rect x={-legX - 48} y={-12} width={96} height={12} rx={6} /> },
        { ink: INK.lagoon, el: <rect x={legX - 48} y={-12} width={96} height={12} rx={6} /> },
        { ink: INK.navy, opacity: 0.2, el: <rect x={-legX} y={-DESK_TOP + 24} width={legX * 2} height={10} /> },
        { ink: INK.sun, el: <rect x={w / 2 - 120} y={-DESK_TOP + 18} width={44} height={14} rx={3} /> },
      ]}
      details={<line x1={w / 2 - 110} y1={-DESK_TOP + 25} x2={w / 2 - 86} y2={-DESK_TOP + 25} strokeWidth={2} />}
    />
  );
}

function TeakDesk({ deskWidth = 484 }: ArtProps) {
  const w = deskWidth;
  const drawerX = w / 2 - 176;
  return (
    <Riso
      parts={[
        { ink: INK.sun, el: <rect x={-w / 2} y={-DESK_TOP} width={w} height={20} rx={3} /> },
        { ink: INK.sun, opacity: 0.75, el: <rect x={drawerX} y={-DESK_TOP + 20} width={160} height={96} /> },
        { ink: INK.sun, opacity: 0.75, el: <path d={`M${-w / 2 + 18} ${-DESK_TOP + 20} h22 l-6 ${DESK_TOP - 20} h-10 z`} /> },
        { ink: INK.sun, opacity: 0.75, el: <path d={`M${w / 2 - 40} ${-DESK_TOP + 20} h22 l-6 ${DESK_TOP - 20} h-10 z`} /> },
        { ink: INK.sun, opacity: 0.6, el: <rect x={-w / 2 + 40} y={-DESK_TOP + 20} width={w - 216} height={16} /> },
      ]}
      details={
        <>
          <line x1={drawerX} y1={-DESK_TOP + 68} x2={drawerX + 160} y2={-DESK_TOP + 68} />
          <circle cx={drawerX + 80} cy={-DESK_TOP + 44} r={4} fill={INK.navy} />
          <circle cx={drawerX + 80} cy={-DESK_TOP + 92} r={4} fill={INK.navy} />
          <path d={`M${-w / 2 + 30} ${-DESK_TOP + 8} h${w * 0.3} M${w * 0.05} ${-DESK_TOP + 12} h${w * 0.25}`} strokeWidth={1.5} opacity={0.5} />
        </>
      }
    />
  );
}

function ChairBase({ seatY }: { seatY: number }) {
  return (
    <>
      <circle cx={-88} cy={-8} r={8} />
      <circle cx={88} cy={-8} r={8} />
      <circle cx={-34} cy={-6} r={7} />
      <circle cx={34} cy={-6} r={7} />
      <path d="M-88 -18 L0 -30 L88 -18" />
      <line x1={0} y1={-30} x2={0} y2={seatY} />
    </>
  );
}

function ErgoChair() {
  return (
    <Riso
      parts={[
        { ink: INK.navy, opacity: 0.35, el: <rect x={-8} y={-118} width={16} height={88} /> },
        { ink: INK.navy, opacity: 0.55, el: <rect x={-96} y={-142} width={192} height={26} rx={12} /> },
        { ink: INK.lagoon, el: <rect x={-82} y={-318} width={164} height={170} rx={34} /> },
        { ink: INK.navy, opacity: 0.55, el: <rect x={-46} y={-352} width={92} height={28} rx={12} /> },
        { ink: INK.sun, el: <rect x={-60} y={-214} width={120} height={22} rx={10} /> },
      ]}
      details={
        <>
          <ChairBase seatY={-118} />
          {[-48, -24, 0, 24, 48].map((x) => (
            <line key={x} x1={x} y1={-306} x2={x} y2={-160} strokeWidth={1.5} opacity={0.45} />
          ))}
          <path d="M-96 -150 v-50 h-16 M96 -150 v-50 h16" />
          <line x1={0} y1={-324} x2={0} y2={-318} />
        </>
      }
    />
  );
}

function TaskChair() {
  return (
    <Riso
      parts={[
        { ink: INK.navy, opacity: 0.35, el: <rect x={-7} y={-112} width={14} height={82} /> },
        { ink: INK.navy, opacity: 0.5, el: <rect x={-86} y={-134} width={172} height={22} rx={10} /> },
        { ink: INK.pink, el: <rect x={-70} y={-262} width={140} height={112} rx={22} /> },
      ]}
      details={
        <>
          <ChairBase seatY={-112} />
          <line x1={0} y1={-150} x2={0} y2={-134} />
          <path d="M-46 -226 h92" strokeWidth={1.5} opacity={0.5} />
        </>
      }
    />
  );
}

function RattanChair() {
  return (
    <Riso
      parts={[
        { ink: INK.sun, el: <path d="M-88 -128 V-232 a88 72 0 0 1 176 0 V-128 z" /> },
        { ink: INK.sun, opacity: 0.7, el: <rect x={-96} y={-140} width={192} height={24} rx={8} /> },
        { ink: INK.sun, opacity: 0.6, el: <path d="M-84 -116 l-8 116 h12 l10 -116 z" /> },
        { ink: INK.sun, opacity: 0.6, el: <path d="M84 -116 l8 116 h-12 l-10 -116 z" /> },
      ]}
      details={
        <>
          <path d="M-88 -128 V-232 a88 72 0 0 1 176 0 V-128" fill="url(#weave)" stroke="none" opacity={0.55} />
          <path d="M-64 -230 a64 52 0 0 1 128 0 V-150 h-128 z" strokeWidth={2} opacity={0.6} />
        </>
      }
    />
  );
}

function Monitor({ product }: ArtProps) {
  const { w, h } = monitorSize(product);
  const top = -MONITOR_NECK - h;
  const label = product?.meta?.screenLabel ?? "";
  return (
    <Riso
      parts={[
        { ink: INK.navy, opacity: 0.3, el: <rect x={-42} y={-8} width={84} height={8} rx={3} /> },
        { ink: INK.navy, opacity: 0.3, el: <rect x={-8} y={-MONITOR_NECK} width={16} height={MONITOR_NECK - 8} /> },
        { ink: INK.navy, opacity: 0.85, el: <rect x={-w / 2} y={top} width={w} height={h} rx={6} /> },
        { ink: INK.lagoon, el: <rect x={-w / 2 + 8} y={top + 8} width={w - 16} height={h - 16} rx={2} /> },
      ]}
      details={
        <g stroke={INK.sun} strokeWidth={4} opacity={0.95}>
          <line x1={-w / 2 + 22} y1={top + 26} x2={-w / 2 + 70} y2={top + 26} />
          <line x1={-w / 2 + 34} y1={top + 40} x2={-w / 2 + 96} y2={top + 40} />
          <line x1={-w / 2 + 34} y1={top + 54} x2={-w / 2 + 60} y2={top + 54} />
          <line x1={-w / 2 + 22} y1={top + 68} x2={-w / 2 + 84} y2={top + 68} />
          <text
            x={w / 2 - 20}
            y={top + h - 20}
            textAnchor="end"
            fill={INK.sun}
            stroke="none"
            fontSize={20}
            fontWeight={800}
            fontFamily="var(--font-bricolage)"
          >
            {label}
          </text>
        </g>
      }
    />
  );
}

function StudioDisplay({ product }: ArtProps) {
  const { w, h } = monitorSize(product);
  const top = -MONITOR_NECK - h;
  return (
    <Riso
      parts={[
        { ink: INK.navy, opacity: 0.15, el: <path d={`M-30 0 h60 l-14 ${-MONITOR_NECK + 4} h-32 z`} /> },
        { ink: INK.navy, opacity: 0.15, el: <rect x={-w / 2} y={top} width={w} height={h} rx={8} /> },
        { ink: INK.lagoon, el: <rect x={-w / 2 + 6} y={top + 6} width={w - 12} height={h - 12} rx={3} /> },
        { ink: INK.pink, opacity: 0.85, el: <circle cx={w / 2 - 54} cy={top + h / 2 - 6} r={26} /> },
      ]}
      details={
        <>
          <circle cx={0} cy={top + 3} r={1.5} fill={INK.navy} />
          <text
            x={-w / 2 + 22}
            y={top + 40}
            fill={INK.sun}
            stroke="none"
            fontSize={22}
            fontWeight={800}
            fontFamily="var(--font-bricolage)"
          >
            5K
          </text>
        </>
      }
    />
  );
}

function Keyboard() {
  return (
    <Riso
      parts={[{ ink: INK.navy, opacity: 0.3, el: <path d="M-82 0 h164 l-6 -14 h-152 z" /> }]}
      details={<path d="M-66 -7 h132" strokeDasharray="6 4" strokeWidth={2} />}
    />
  );
}

function Mouse() {
  return <Riso parts={[{ ink: INK.navy, opacity: 0.4, el: <path d="M-17 0 a17 15 0 0 1 34 0 z" /> }]} />;
}

function LaptopStand() {
  return (
    <Riso
      parts={[
        { ink: INK.navy, opacity: 0.2, el: <path d="M-44 0 L-10 -44 h20 L44 0 h-14 L4 -34 h-8 L-30 0 z" /> },
        { ink: INK.navy, opacity: 0.6, el: <rect x={-76} y={-50} width={152} height={8} rx={3} /> },
        { ink: INK.paper, el: <rect x={-70} y={-146} width={140} height={94} rx={6} /> },
        { ink: INK.pink, opacity: 0.55, el: <rect x={-62} y={-138} width={124} height={78} rx={2} /> },
      ]}
      details={<circle cx={0} cy={-99} r={8} strokeWidth={2} />}
    />
  );
}

function Webcam() {
  return (
    <Riso
      parts={[
        { ink: INK.navy, opacity: 0.7, el: <rect x={-26} y={-24} width={52} height={22} rx={10} /> },
        { ink: INK.navy, opacity: 0.4, el: <rect x={-10} y={-4} width={20} height={8} /> },
      ]}
      details={<circle cx={0} cy={-13} r={6} fill={INK.lagoon} />}
    />
  );
}

function Lamp() {
  return (
    <Riso
      parts={[
        { ink: INK.navy, opacity: 0.5, el: <rect x={-30} y={-10} width={60} height={10} rx={5} /> },
        { ink: INK.sun, el: <path d="M-58 -196 l58 -26 l12 28 l-58 26 z" /> },
      ]}
      details={
        <>
          <path d="M14 -10 L30 -120 L4 -204" strokeWidth={5} />
          <circle cx={30} cy={-120} r={6} fill={INK.paper} />
        </>
      }
    />
  );
}

function Riser({ deskWidth = 240 }: ArtProps) {
  const w = deskWidth;
  return (
    <Riso
      parts={[
        { ink: INK.sun, el: <rect x={-w / 2} y={-RISER_H} width={w} height={10} rx={3} /> },
        { ink: INK.sun, opacity: 0.6, el: <rect x={-w / 2 + 10} y={-RISER_H + 10} width={14} height={RISER_H - 10} /> },
        { ink: INK.sun, opacity: 0.6, el: <rect x={w / 2 - 24} y={-RISER_H + 10} width={14} height={RISER_H - 10} /> },
      ]}
    />
  );
}

function DeskPlant() {
  return (
    <Riso
      parts={[
        { ink: INK.lagoon, el: <path d="M-4 -46 C-40 -70 -46 -100 -30 -116 C-18 -96 -8 -76 -4 -46 z" /> },
        { ink: INK.leaf, opacity: 0.85, el: <path d="M2 -46 C30 -64 52 -86 46 -110 C26 -100 8 -80 2 -46 z" /> },
        { ink: INK.lagoon, el: <path d="M0 -46 C-6 -86 4 -112 16 -130 C22 -104 14 -76 0 -46 z" /> },
        { ink: INK.pink, el: <path d="M-27 0 h54 l6 -46 h-66 z" /> },
      ]}
      details={<path d="M-30 -36 h60" strokeWidth={2} />}
    />
  );
}

function FloorPlant() {
  return (
    <Riso
      parts={[
        { ink: INK.lagoon, el: <path d="M0 -96 C-90 -120 -150 -200 -120 -280 C-60 -250 -20 -180 0 -96 z" /> },
        { ink: INK.leaf, opacity: 0.85, el: <path d="M0 -96 C70 -150 140 -170 150 -250 C80 -260 30 -200 0 -96 z" /> },
        { ink: INK.lagoon, el: <path d="M0 -96 C-20 -190 0 -280 50 -340 C70 -270 40 -170 0 -96 z" /> },
        { ink: INK.pink, el: <path d="M-56 0 h112 l12 -96 h-136 z" /> },
      ]}
      details={
        <>
          <path d="M-96 -232 l30 18 M-70 -164 l26 4 M104 -214 l-30 12 M80 -164 l-24 2 M36 -284 l-12 22" strokeWidth={6} stroke={INK.paper} />
          <path d="M0 -96 C-40 -150 -80 -190 -110 -260 M0 -96 C50 -150 100 -190 140 -240 M0 -96 C10 -180 20 -260 46 -324" strokeWidth={2} opacity={0.6} />
          <path d="M-62 -78 h124" strokeWidth={2} />
        </>
      }
    />
  );
}

function CoffeeStation() {
  return (
    <Riso
      parts={[
        { ink: INK.sun, el: <rect x={-90} y={-160} width={180} height={14} rx={3} /> },
        { ink: INK.sun, opacity: 0.6, el: <path d="M-80 -146 l-8 146 h12 l10 -146 z" /> },
        { ink: INK.sun, opacity: 0.6, el: <path d="M80 -146 l8 146 h-12 l-10 -146 z" /> },
        { ink: INK.sun, opacity: 0.5, el: <rect x={-76} y={-70} width={152} height={10} /> },
        { ink: INK.navy, opacity: 0.85, el: <path d="M-46 -160 v-112 a10 10 0 0 1 10 -10 h44 a10 10 0 0 1 10 10 v112 z" /> },
        { ink: INK.pink, el: <rect x={-30} y={-186} width={30} height={24} rx={3} /> },
        { ink: INK.paper, el: <rect x={36} y={-182} width={34} height={22} rx={5} /> },
      ]}
      details={
        <>
          <path d="M-14 -238 v20 M-20 -218 h12" strokeWidth={2} />
          <path d="M70 -176 h8 a5 5 0 0 1 0 10 h-8" strokeWidth={2} />
          <path d="M46 -196 c-4 -8 4 -12 0 -20 M58 -196 c-4 -8 4 -12 0 -20" strokeWidth={2} opacity={0.6} />
        </>
      }
    />
  );
}

function Purifier() {
  return (
    <Riso
      parts={[{ ink: INK.paper, el: <rect x={-44} y={-226} width={88} height={226} rx={20} /> }]}
      details={
        <>
          {[-190, -170, -150, -130, -110, -90, -70].map((y) => (
            <line key={y} x1={-28} y1={y} x2={28} y2={y} stroke={INK.lagoon} strokeWidth={4} />
          ))}
          <circle cx={0} cy={-208} r={6} fill={INK.sun} />
        </>
      }
    />
  );
}

export const ART: Record<ArtKey, ArtDef> = {
  "desk-standing": { w: (p) => p.deskWidth ?? deskWidthFor(p.product), h: () => DESK_TOP, Draw: StandingDesk },
  "desk-teak": { w: (p) => p.deskWidth ?? deskWidthFor(p.product), h: () => DESK_TOP, Draw: TeakDesk },
  "chair-ergo": { w: () => 230, h: () => 356, Draw: ErgoChair },
  "chair-task": { w: () => 190, h: () => 266, Draw: TaskChair },
  "chair-rattan": { w: () => 200, h: () => 300, Draw: RattanChair },
  monitor: { w: (p) => monitorSize(p.product).w, h: (p) => monitorSize(p.product).h + MONITOR_NECK, Draw: Monitor },
  "monitor-studio": {
    w: (p) => monitorSize(p.product).w,
    h: (p) => monitorSize(p.product).h + MONITOR_NECK,
    Draw: StudioDisplay,
  },
  keyboard: { w: () => 170, h: () => 16, Draw: Keyboard },
  mouse: { w: () => 40, h: () => 18, Draw: Mouse },
  "laptop-stand": { w: () => 156, h: () => 150, Draw: LaptopStand },
  webcam: { w: () => 56, h: () => 28, Draw: Webcam },
  lamp: { w: () => 120, h: () => 226, Draw: Lamp },
  riser: { w: (p) => p.deskWidth ?? 240, h: () => RISER_H, Draw: Riser },
  "plant-desk": { w: () => 100, h: () => 134, Draw: DeskPlant },
  "plant-floor": { w: () => 300, h: () => 344, Draw: FloorPlant },
  coffee: { w: () => 190, h: () => 286, Draw: CoffeeStation },
  purifier: { w: () => 92, h: () => 230, Draw: Purifier },
};

/** Shared <defs> for the weave pattern and print grain. Render once per SVG. */
export function ArtDefs({ grainId }: { grainId?: string }) {
  return (
    <defs>
      <pattern id="weave" width="12" height="12" patternUnits="userSpaceOnUse">
        <path d="M0 6 L6 0 L12 6 L6 12 Z" fill="none" stroke="var(--color-brand)" strokeWidth="1.2" />
      </pattern>
      {grainId ? (
        <filter id={grainId} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.55" />
          </feComponentTransfer>
        </filter>
      ) : null}
    </defs>
  );
}

/** Small standalone drawing of one product, used on stickers. */
export function ProductArt({ product, className }: { product: Product; className?: string }) {
  const def = ART[product.art];
  const props: ArtProps = { product, deskWidth: product.art === "riser" ? 200 : undefined };
  if (product.category === "desk") props.deskWidth = deskWidthFor(product) * 0.7;
  const w = def.w(props);
  const h = def.h(props);
  const pad = 10;
  const Draw = def.Draw;
  return (
    <svg
      viewBox={`${-w / 2 - pad} ${-h - pad} ${w + pad * 2} ${h + pad * 2}`}
      className={className}
      aria-hidden="true"
      style={{ isolation: "isolate" }}
    >
      <ArtDefs />
      <Draw {...props} />
    </svg>
  );
}
