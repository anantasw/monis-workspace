import { formatUsd, pluralize } from "@/domain/format";
import type { SetupPrice } from "@/domain/setup";
import { MONIS_LOGO_PATH, MONIS_LOGO_VIEWBOX } from "@/components/ui/monis-logo";

// Builds a 1600 x 900 PNG postcard in the browser: the room SVG on the left, handwriting and the
// price stamp on the right. No library: XMLSerializer + <canvas>.

const WIDTH = 1600;
const HEIGHT = 900;

/** CSS custom properties do not exist inside a standalone SVG image: replace them with their values. */
function inlineCssVars(markup: string): string {
  const root = getComputedStyle(document.documentElement);
  return markup.replace(/var\((--[\w-]+)\)/g, (match, name: string) => {
    const value = root.getPropertyValue(name).trim();
    // Values land inside XML attributes: font lists contain double quotes, which would end the attribute.
    return value ? value.replaceAll("&", "&amp;").replaceAll('"', "'") : match;
  });
}

async function svgToImage(svg: SVGSVGElement): Promise<HTMLImageElement> {
  const clone = svg.cloneNode(true) as SVGSVGElement; // cloneNode returns Node; it is the same element type
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", "1200");
  clone.setAttribute("height", "760");
  clone.removeAttribute("class");
  const markup = inlineCssVars(new XMLSerializer().serializeToString(clone));
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  await img.decode();
  return img;
}

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

interface PostcardInput {
  svg: SVGSVGElement;
  price: SetupPrice;
  weeks: number;
  clockLabel: string;
}

export async function renderPostcard({ svg, price, weeks, clockLabel }: PostcardInput): Promise<Blob> {
  // Make sure the page fonts are ready, so canvas text uses them.
  await document.fonts.ready;

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");

  const navy = cssVar("--color-brand");
  const paper = cssVar("--color-paper");
  const sun = cssVar("--color-sun");
  const pink = cssVar("--color-frangipani");
  const muted = cssVar("--color-ink-muted");
  const display = cssVar("--font-display");
  const note = cssVar("--font-note");
  const sans = cssVar("--font-sans");

  // Card
  ctx.fillStyle = cssVar("--color-surface");
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Room, left 1000 x 633 inside a paper frame
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, 1040, HEIGHT);
  const room = await svgToImage(svg);
  const roomW = 1000;
  const roomH = (roomW * 760) / 1200;
  ctx.drawImage(room, 20, (HEIGHT - roomH) / 2, roomW, roomH);

  // Divider
  ctx.strokeStyle = navy;
  ctx.globalAlpha = 0.25;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(1040, 40);
  ctx.lineTo(1040, HEIGHT - 40);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  // Stamp
  ctx.fillStyle = sun;
  ctx.fillRect(1420, 50, 140, 160);
  ctx.strokeStyle = navy;
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(1420, 50, 140, 160);
  ctx.setLineDash([]);
  ctx.fillStyle = navy;
  ctx.textAlign = "center";
  ctx.font = `800 34px ${display}`;
  ctx.fillText(formatUsd(price.weeklyCents), 1490, 135);
  ctx.font = `700 16px ${display}`;
  ctx.fillText("PER WEEK", 1490, 165);

  // Postmark
  ctx.strokeStyle = pink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(1330, 120, 58, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = pink;
  ctx.font = `700 18px ${display}`;
  ctx.fillText("CANGGU", 1330, 116);
  ctx.font = `500 16px ${display}`;
  ctx.fillText(`${clockLabel} WITA`, 1330, 140);

  // Handwriting
  ctx.textAlign = "left";
  ctx.fillStyle = navy;
  ctx.font = `64px ${note}`;
  ctx.fillText("Greetings", 1090, 300);
  ctx.fillText("from my desk!", 1090, 370);

  // Item list
  ctx.font = `500 22px ${sans}`;
  ctx.fillStyle = muted;
  const lines = price.lines.slice(0, 9);
  lines.forEach((l, i) => {
    ctx.fillText(`${l.qty > 1 ? `${l.qty} × ` : ""}${l.product.name}`, 1090, 440 + i * 34);
  });
  if (price.lines.length > lines.length) {
    ctx.fillText(`+ ${price.lines.length - lines.length} more`, 1090, 440 + lines.length * 34);
  }

  // Total
  ctx.fillStyle = navy;
  ctx.font = `700 24px ${sans}`;
  ctx.fillText(`${pluralize(weeks, "week")} · ${formatUsd(price.totalCents)} total`, 1090, 820);
  // Official wordmark, 30 px high, right-aligned at the bottom.
  const logoH = 30;
  const scale = logoH / MONIS_LOGO_VIEWBOX.height;
  ctx.save();
  ctx.translate(1560 - MONIS_LOGO_VIEWBOX.width * scale, 820 - logoH + 4);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#000";
  ctx.fill(new Path2D(MONIS_LOGO_PATH));
  ctx.restore();

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create the image."))), "image/png"),
  );
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  // Give the browser a moment to start the download before the URL is released.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
