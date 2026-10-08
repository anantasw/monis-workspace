---
# gstack: design-md-format=spec
name: Monis Workspace Builder
description: A two-ink risograph print of a real Bali room that you can play with, framed by the clean white monis.rent UI.
colors:
  primary: "#15252E"
  primary-hover: "#22394A"
  on-primary: "#FFFFFF"
  surface: "#FFFFFF"
  paper: "#F9F2EA"
  text: "#15252E"
  text-muted: "#5B6770"
  line: "#E5E7EB"
  ink-lagoon: "#1F8A8A"
  ink-sun: "#F2C230"
  ink-frangipani: "#E8708F"
  success: "#2F6B4A"
  error: "#B42318"
typography:
  display:
    fontFamily: Bricolage Grotesque
    fontWeight: 700
    fontSize: clamp(1.75rem, 1.2rem + 2vw, 2.75rem)
    letterSpacing: -0.02em
  price:
    fontFamily: Bricolage Grotesque
    fontWeight: 800
    fontSize: 2.5rem
    fontFeature: tnum
  body:
    fontFamily: Inter
    fontSize: 1rem
    lineHeight: 1.5
  label:
    fontFamily: Inter
    fontWeight: 600
    fontSize: 0.8125rem
  note:
    fontFamily: Gochi Hand
    fontSize: 1.25rem
rounded:
  sm: 4px
  md: 6px
  lg: 12px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  input:
    borderColor: "{colors.line}"
    rounded: "{rounded.sm}"
  sticker-selected:
    backgroundColor: "{colors.ink-sun}"
---

# Monis Workspace Builder

## Overview

**Creative North Star:** "That's my desk, in Bali." The preview is a risograph-style print of a real Bali room. The light in the room follows the real time in Bali, so the user feels they already own this desk before they rent it.
**Product context:** Visual configurator for monis.rent, a Bali office-equipment rental for digital nomads and startups. Next.js + Tailwind, no extra libraries.
**Mode per surface:** Scene = Experience. Sticker tray, price ticket, summary table, rent form = Operate.
**Reference sites:** https://www.monis.rent/ (brand source: navy buttons, white surfaces, Inter, sand surface).
**Logo:** the official monis wordmark and icons from monis.rent, unchanged (`src/components/ui/monis-logo.tsx`, `src/app/icon*.png`, `src/app/apple-icon.png`). The wordmark is black, as on monis.rent; never recolour or redraw it.
**Key characteristics:**
- The scene is the hero and the catalogue. It fills most of the first viewport.
- Personality lives inside the scene, the stickers and the ticket. The UI frame stays quiet and white.
- Two-ink print look: navy line art plus slightly offset colour fills that multiply where they overlap.
- Every price is always visible.

## Colors

**Strategy:** Committed. Monis navy owns the UI (buttons, text, line art). Three riso inks (lagoon, sun, frangipani) appear only inside the scene and as state colours.
**Light or dark:** Light. Users browse in bright cafes and villas. The scene itself turns to dusk and night with the Bali clock; the UI frame does not.
Sun yellow marks the selected state and new light. Lagoon teal is the main fill ink. Frangipani pink is rare: plants, zones, the postmark. Success green and error red are for status only. Never put text on sun yellow without navy text.

## Typography

Bricolage Grotesque (Google Fonts, variable wght/wdth/opsz) is the display and price voice: headings, sticker names in the scene, large numbers. Inter is the UI and body face to stay consistent with monis.rent (Inter is on the overused-display list, so it is never the display voice here). Gochi Hand is only for small handwritten notes inside the scene and on the postcard, at most 3 per screen. All loaded with next/font/google (self-hosted at build). Numbers use tabular figures.

## Layout

- Desktop (1024px+): scene left at about 62% width, sticky, full viewport height minus header. Right rail 380-440px: title, sticker tray with tabs, price ticket.
- Tablet/phone: scene sticky on top (about 46vh), tray below, compact ticket fixed at the bottom with safe-area padding.
- Max content width 1440px. 4px base, steps of 8.

## Elevation & Depth

Depth comes from print layering in the scene (multiply overlap, offset fills). In the UI: 1px line borders, and one soft offset shadow for the ticket and toasts (0 8px 24px rgb(21 37 46 / 0.12)). No zero-offset glow.

## Shapes

Buttons and inputs 6px radius (not pills). Ticket 12px radius with a perforated top edge. Stickers have no box: their outline is the die-cut silhouette of the item.

## Components

- **Sticker:** die-cut item art with white outline. States: default, hover (lift 2px), focus-visible (2px navy ring), selected (sun-yellow disc behind, check), at limit (disabled + hint), out of stock (40% opacity + label).
- **Price ticket:** weekly total, total for N weeks, week blocks 1-12, primary button.
- **Scene items:** clickable, keyboard focusable, open the matching sticker.
- **Toast:** navy, white text, optional Undo, auto-hide 5s.

## Do's and Don'ts

- Do keep all scene colour inside the four inks plus paper.
- Do show price on every sticker and in the ticket.
- Do draw every item as navy line art with an offset ink fill.
- Don't use a product grid of photo cards.
- Don't use gradients, glows or pill buttons in the UI frame.
- Don't add a kicker label above headings.

## Motion

- **Approach:** intentional
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out); drop-in cubic-bezier(0.34, 1.4, 0.64, 1)
- **Duration:** micro(80ms) short(180ms) medium(260ms) long(600ms for phase change)
- **The one authored moment:** the sticker peels (rotate and lift) and the item drops onto the desk with a small bounce. All motion off under prefers-reduced-motion.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-10-09 | Initial design system "Riso Villa" created | /design-consultation from monis.rent brand + memorable thing "That's my desk, in Bali"; independent Claude subagent agreed on Bricolage + Inter, clock-driven light, scene as catalogue; Codex unavailable (auth) |
