# Strategic Roadmap – Fairchild App → Sellable Product

## What’s Solid (Don’t Break)

| Area | Status | Notes |
|------|--------|------|
| Ticket flow | ✅ | Daily (Scheduled vs Flex), Special Events entry |
| Stripe checkout | ✅ | Webhook + recovery for missing tickets |
| Wallet tabs | ✅ | Current vs Past, visit count banner |
| QR codes | ✅ | Standard encoding, scannable |
| Auth | ✅ | Email/password, forgot password |
| Provider abstraction | ✅ | `lib/commerce/providers/` ready for Altru, etc. |

---

## Gaps vs UX Design

### 1. Wallet ticket cards (HIGH – user-facing)

**Current:** Shows Ticket ID, Status, QR only.

**UX design:** Per-ticket type with:
- **Flex Ticket:** "USED May 6, 2026" · "1 Adult (18-64), 1 Senior (65+)"
- **Scheduled Ticket:** "USED April 6, 2026, 11 AM – 12 PM" · "1 Adult (18-64)"
- **Special Event:** "Sunrise Yoga" · "USED Dec 4, 2026, 7 AM – 8 AM" (+ thumbnail)

**Needed:** Enrich ticket data with:
- Ticket type name
- Slot date/time for scheduled
- Attendee breakdown (e.g. "1 Adult, 1 Senior")

---

### 2. Scheduled ticket messaging (MEDIUM – business rules)

**UX/summary:** "You must enter at your scheduled time" + 30-minute grace.

**Current:** Grace period exists in logic; not clearly surfaced in UI.

**Needed:** Prominent copy on date/slot selection and ticket card.

---

### 3. “Today at Fairchild” (MEDIUM – home page)

**Current:** Static text (hours, generic weather/events).

**UX:** Dynamic hours, weather, featured event.

**Needed:** Config/API for hours and events; optional weather API.

---

### 4. Peak vs non-peak pricing (MEDIUM – ticketing rules)

**Summary:** Scheduled tickets have different prices by day type.

**Current:** Single price per ticket type.

**Needed:** `ticket_types` or `pricing_rules` that support peak/non-peak and date-based logic.

---

### 5. Flex blocked days (MEDIUM – ticketing rules)

**Summary:** Flex tickets blocked on certain special-event days.

**Current:** Not modeled.

**Needed:** `flex_blocked_dates` or similar; validation before purchase.

---

### 6. Special Events (MEDIUM – revenue)

**Current:** Placeholder “Coming soon”.

**Needed:** Events table + list/detail UI, then purchase flow.

---

### 7. Map (LOWER – guest experience)

**UX:** POIs, search, filters, “Get Directions”, location detail.

**Current:** Placeholder.

**Needed:** Map UI, POI data, basic directions support.

---

### 8. Learn (LOWER – engagement)

**UX:** Browse plants, plant detail, plant ID guide, quiz, tours.

**Current:** Placeholder.

**Needed:** Plants/content model, search UI, detail pages.

---

### 9. Membership (LOWER – monetization)

**UX:** Member welcome, free tickets, digital membership card.

**Current:** Not implemented.

**Needed:** Memberships table, member check, $0 checkout path.

---

## Recommended Order

1. **Wallet ticket cards** – Enrich display with type, date/time, attendee breakdown. Fast UX win.
2. **Scheduled grace messaging** – Add copy across booking and ticket view.
3. **“Today at Fairchild” config** – Hours + featured event from config/API.
4. **Peak/non-peak + flex blocked days** – Schema + rules.
5. **Special Events** – Events model + list + basic purchase flow.
6. **Map, Learn, Membership** – As capacity allows.

---

## Next Step

**Implement Step 1: wallet ticket cards.**

This will:
- Make the wallet match your UX.
- Give attendees clear ticket type and timing.
- Use existing data (ticket_types, time_slots, order_items) without schema changes.
