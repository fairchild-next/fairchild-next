# Project Vision

## Product Strategy

**White-label, multi-tenant ticketing platform** for gardens, museums, and zoos. Fairchild Tropical Botanic Garden is the first client; the goal is to sell the same product to other institutions with pluggable backends per client.

---

## Architecture Principles

### Provider-Agnostic Commerce

Commerce backends are **pluggable** via `src/lib/commerce/providers/`. Different CRM/ticketing systems can be swapped per tenant via environment configuration.

- **Providers:** Stripe (MVP), Altru, Xtrulink, Salesforce, etc.
- **Switching:** `COMMERCE_PROVIDER` env var selects the active provider.
- **Interface:** All providers implement `CommerceProvider` (createCheckoutSession, verifyOrder).

Key paths:

- `src/lib/commerce/providers/` – provider implementations
- `src/lib/commerce/types.ts` – `CommerceProvider` interface
- `src/lib/commerce/index.ts` – `getCommerceProvider()` factory

### Database-Agnostic Design

The front-end and core flows are built to work with many backends. Each client can use their own CRM/ticketing DB (Altru, Xtrulink, Salesforce, etc.); providers abstract the differences.

### QR Code Strategy

- Encode **ticket UUID only** – any QR scanner can read it.
- Validation happens via API; third-party systems can call `POST /api/scan-ticket` with `{ qr_code }` and receive `valid`, `not_found`, `already_used`, or `invalid_request`.

---

## Fairchild Goals (First Client)

1. **Easier ticket buying and access** – streamlined flow for daily and flex tickets.
2. **Ticket wallet** – Current/Past tickets with QR codes.
3. **Revenue** – tickets, memberships, donations, events, plant shop.
4. **Guest experience** – map, Learn, tours.
5. **Post-visit engagement** – quizzes, push, badges.
6. **Marketing and analytics** – data to improve offers and retention.
7. **Flexible ticketing rules** – time slots, capacity, pricing – designed to adapt for other gardens.

---

## Key Implementation Paths

| Area | Path |
|------|------|
| Commerce providers | `src/lib/commerce/providers/` |
| QR validation | `src/app/api/scan-ticket/route.ts` |
| Staff scanner UI | `src/app/staff/scanner/page.tsx` |
| Ticket wallet | `src/app/tickets/my/page.tsx`, `src/app/wallet/page.tsx` |
| Cart & checkout | `src/app/tickets/cart/`, `src/app/tickets/checkout/` |

---

## Future Development

- Add Altru, Xtrulink, or other providers under `providers/`.
- Support multiple tenants per deployment (tenant ID in config/DB).
- Broaden `CommerceProvider` for memberships, donations, events, merchandise.
- Integrate guest experience features (map, tours, Learn).
- Add post-visit engagement (quizzes, push, badges).
