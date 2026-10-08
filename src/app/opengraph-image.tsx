import { ImageResponse } from "next/og";
import { MONIS_LOGO_PATH, MONIS_LOGO_VIEWBOX } from "@/components/ui/monis-logo";

// Brand colours from DESIGN.md. CSS variables do not exist in ImageResponse, so values are literal.
const NAVY = "#15252e";
const PAPER = "#f9f2ea";
const SUN = "#f2c230";
const LAGOON = "#1f8a8a";
const PINK = "#e8708f";

export const alt = "Design your Bali workspace with monis.rent: a desk, a chair and screens in a sunny room";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: PAPER, color: NAVY, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, width: 620 }}>
          <svg width={166} height={48} viewBox={`0 0 ${MONIS_LOGO_VIEWBOX.width} ${MONIS_LOGO_VIEWBOX.height}`}>
            <path fill="#000" d={MONIS_LOGO_PATH} />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>Design your Bali workspace</div>
            <div style={{ fontSize: 28, color: "#5b6770" }}>Pick a desk, a chair and screens. Rent it by the week.</div>
          </div>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 700, background: SUN, padding: "10px 18px", alignSelf: "flex-start" }}>
            Rent by the week · free delivery in Bali
          </div>
        </div>
        {/* Simple room: window, desk, two screens, chair */}
        <div style={{ display: "flex", position: "relative", flex: 1 }}>
          <div style={{ position: "absolute", left: 60, top: 70, width: 200, height: 230, background: LAGOON, opacity: 0.45, border: `6px solid ${NAVY}` }} />
          <div style={{ position: "absolute", left: 200, top: 100, width: 44, height: 44, borderRadius: 44, background: SUN }} />
          <div style={{ position: "absolute", left: 120, top: 330, width: 140, height: 90, background: LAGOON, border: `6px solid ${NAVY}`, borderRadius: 8 }} />
          <div style={{ position: "absolute", left: 280, top: 330, width: 140, height: 90, background: LAGOON, border: `6px solid ${NAVY}`, borderRadius: 8 }} />
          <div style={{ position: "absolute", left: 60, top: 440, width: 440, height: 22, background: SUN, border: `6px solid ${NAVY}` }} />
          <div style={{ position: "absolute", left: 90, top: 462, width: 18, height: 120, background: NAVY }} />
          <div style={{ position: "absolute", left: 452, top: 462, width: 18, height: 120, background: NAVY }} />
          <div style={{ position: "absolute", left: 215, top: 380, width: 120, height: 150, background: PINK, border: `6px solid ${NAVY}`, borderRadius: 30 }} />
        </div>
      </div>
    ),
    size,
  );
}
