# Wedding Cue Sheet Maker — Design Guidelines

## Aesthetic: Soft Collaboration

### Color Palette
- Background: `#F5F2EE` (warm greige)
- Surface / Cards: `#FFFFFF`
- Primary (Lavender): `#8B7FC7`
- Primary Light: `#B5ADDF`
- Primary Pale: `#F0EEF9`
- Primary Muted: `#EAE7F5`
- Secondary (Sage): `#7E9478`
- Secondary Light: `#A5B8A0`
- Secondary Pale: `#EEF3ED`
- Text: `#2C2825` (warm charcoal)
- Muted Text: `#7A746E`
- Border: `#E2DDD6`
- Muted Background: `#F0EDE7`
- Accent Rose: `#C4918A`
- Accent Rose Pale: `#F9EFEE`

### Typography
- Display / Headings: **Lora** (serif) — romantic, warm, wedding-appropriate
- Body / UI: **Nunito** (humanist sans) — friendly, readable, comfortable at all sizes
- The serif + sans pairing creates warmth without sacrificing clarity

### Shape & Radius
- Cards: 13–14px
- Buttons: 10px
- Inputs: 10px
- Pills/Chips: 999px (fully rounded)
- Never 0px radius

### Spacing
- Card padding: 20–24px
- Section gap: 32–48px
- Comfortable line height: 1.6–1.7 for body text

### Components
- **Cards**: white surface, 1px `#E2DDD6` border, 13px radius, `0 2px 8px rgba(0,0,0,0.06)` shadow
- **Primary buttons**: `#8B7FC7` fill, white text, 10px radius, hover to `#B5ADDF`
- **Secondary buttons**: white surface, `#8B7FC7` border + text
- **Inputs**: white, 1px border, lavender focus ring (`ring-2 ring-lavender/30`)
- **Chips/Tags**: fully rounded, lavender or sage depending on context
- **Timeline bar**: lavender-pale background, lavender markers

### Principles
1. **Readability first** — the cue sheet is read at a glance by a ceremony host
2. **Information hierarchy**: time ▸ title ▸ script
3. **Warm and celebratory**, never clinical or corporate
4. **Generous whitespace** — cards breathe; don't crowd them
5. **Rounded forms** — no sharp edges anywhere

### Never
- Dense data tables
- Zebra-striped rows
- Navy or cobalt
- Hairline rules (use 1px solid borders instead)
- 0px radius
- Monospace fonts in UI text
