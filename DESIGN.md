# Design Direction: Laboratory Inventory & Borrowing Management System

## Product Identity
A specialized web application for managing Computer Laboratory Inventory & Equipment Borrowing (SIM-LAB). Built for university computer laboratory administrators and operational staff.

## Dials
- ENERGY: 2 (Balanced: clean, professional, purpose-built laboratory management utility)
- RHYTHM: 2 (Structured: distinct visual hierarchy between operational metrics, inventory tables, borrowing management, and user controls)
- MOTION: 1 (Calm: smooth and subtle state feedback only, fully honoring prefers-reduced-motion)

## Color Palette (WCAG AA Compliant)
- Base Dark / Primary Text: `#0F172A` (Deep Slate, contrast ratio > 15:1 against canvas)
- Muted Text: `#475569` (Slate 600, contrast ratio > 5.5:1 against canvas)
- Canvas Background: `#F8FAFC` (Slate 50)
- Surface / Card Background: `#FFFFFF` (White)
- Border / Dividers: `#CBD5E1` (Slate 300, non-text contrast > 3:1)
- Brand Primary: `#1E3A8A` (Dark Lab Navy, contrast ratio > 10:1 on white)
- Brand Secondary / Focus: `#0369A1` (Deep Sky Blue, contrast ratio > 4.8:1)
- Success / Available State: `#065F46` (Forest Green on `#DCFCE7`, contrast ratio > 7:1)
- In-Use / Borrowed State: `#9A3412` (Burnt Orange on `#FFEDD5`, contrast ratio > 6:1)

## Typography & Tone
- System UI font stack: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif.
- Clear tabular numerals for serial codes, quantities, and dates.
- Natural, professional Indonesian UI language without marketing buzzwords, filler words, or em dashes.

## Usability & Accessibility Standards
- Explicit 44px minimum tap targets for all clickable buttons and navigation links.
- Keyboard accessible with distinct high-contrast focus rings (3:1 contrast against backgrounds).
- Complete data views including Empty, Loading, and Error states with recovery actions.
- Real lab equipment inventory data with no fabricated numbers.

