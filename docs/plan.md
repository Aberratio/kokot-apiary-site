# Implementation plan

## Goal

A one-page website for Franciszek Kokot's apiary that feels modern and creative: custom 3D, shaders, particles and kinetic typography, with great photography. Franciszek edits the offer, payment details and delivery options himself through a custom CMS. There are no online payments.

## Decisions

| Topic | Decision |
|---|---|
| Framework | Next.js (App Router) + TypeScript, hosted on Vercel |
| 3D and effects | three.js, @react-three/fiber, @react-three/drei, postprocessing, custom GLSL, GSAP (incl. ScrollTrigger and SplitText, free since 2025), Lenis |
| Paid libraries | None. Every dependency must be free and open source |
| Shared code | Reusable effects go to `web-studio-kit`, installed as a pinned git dependency (`github:aberratio/web-studio-kit#vX.Y.Z`) |
| CMS | Custom, built into this app under `/admin`. Single admin user (Franciszek) |
| Database | Postgres on the free Neon tier (Vercel Marketplace), Drizzle ORM |
| Images | Vercel Blob, served through `next/image` |
| Auth | One admin account: password hash in env, signed httpOnly session cookie. No third-party auth service |
| Email | Resend free tier, sent from a server action or route handler |
| Languages | Polish by default, English switch. Every CMS text field has a PL and an EN value |
| Ordering | CMS flag `orderMode`: `form` (order form) or `contact` (contact form only). Both must work |
| Domain | `*.vercel.app` for now |
| Content | Nothing exists yet. Use placeholder photos, copy and prices, all replaceable from the CMS |

## Page sections (one page, scroll-driven)

1. **Hero**: kinetic typography (apiary name) over an abstract honey shader (flowing, viscous, golden, reacting to cursor and scroll).
2. **About the apiary**: photos with scroll-driven reveal, short story.
3. **Bees / process**: particle system that forms a swarm, then a honeycomb, then a jar as the user scrolls.
4. **Offer**: product cards from the CMS (name, description, size, price, photo, availability). A 3D honey jar model presents the featured product.
5. **How to order**: payment info (bank account for transfer) and delivery options (pickup, shipping methods with prices), all from the CMS.
6. **Order or contact form**: depends on `orderMode`.
7. **Footer**: contact details, social links, language switch.

## Ordering

- `orderMode = form`: the customer picks products and quantities, enters name, email, phone, address and delivery option, and sees the total. On submit, Franciszek gets an email with the order and the customer gets a confirmation with the bank transfer details. Orders are also stored in the database and listed in `/admin`.
- `orderMode = contact`: a plain contact form (name, email, message), emailed to Franciszek.
- Spam protection: honeypot field plus rate limiting. No paid captcha.

## CMS (`/admin`)

Admin UI copy in Polish, with an English switch. Editable entities:

- **Products**: PL/EN name and description, size, price, photo, available flag, sort order.
- **Payment info**: account holder, bank name, account number, transfer title hint (PL/EN).
- **Delivery options**: PL/EN name and description, price, enabled flag, sort order.
- **Settings**: `orderMode`, contact email and phone, social links, section copy (PL/EN).
- **Orders**: list with editable status (new / paid / shipped).

## Quality bar

- **Light mode**: on low-end devices (CPU cores, device memory, WebGL capability) and under `prefers-reduced-motion`, swap 3D scenes for static images or CSS fallbacks. The page must be fully usable without WebGL.
- **Performance**: lazy-load each scene when its section nears the viewport, compress models (Draco or Meshopt `.glb`) and textures (KTX2), cap the device pixel ratio. Mobile LCP under 2.5 s on the Vercel preview.
- **Accessibility**: semantic HTML, keyboard-reachable forms, visible focus, alt text from the CMS.
- **SEO**: per-language metadata, `hreflang`, Open Graph image, `sitemap.xml`, `robots.txt`, JSON-LD `LocalBusiness`.

## Tasks

### Phase 0: foundations (kit and starter)

- [ ] Scaffold `web-studio-kit`: React + TypeScript library build, peer deps (react, three, @react-three/fiber), first exports: `<SmoothScroll>` (Lenis + GSAP ticker), `useScrollProgress`, `<ShaderPlane>` (fullscreen GLSL with time, mouse and scroll uniforms), `useQualityTier` (light / full detection). Tag `v0.1.0`.
- [ ] Scaffold `web-studio-starter`: Next.js App Router + TypeScript, i18n routing (`/pl`, `/en`, default `pl`), kit installed from its tag, light-mode fallback wiring, ESLint + Prettier, Vitest. README explains the new-client-site flow.

### Phase 1: site skeleton

- [ ] Bring the starter into this repo, deploy to Vercel, confirm the preview URL works.
- [ ] One-page layout with all seven sections, placeholder content, language switch.
- [ ] Smooth scroll and per-section scroll progress.

### Phase 2: CMS and data

- [ ] Neon Postgres + Drizzle schema and migrations for products, payment info, delivery options, settings, orders.
- [ ] Admin auth (login page, session cookie, protected `/admin` routes).
- [ ] CRUD screens for products, payment info, delivery options, settings. Image upload to Vercel Blob.
- [ ] Seed script with placeholder data.
- [ ] Public sections read from the database, revalidated on save.

### Phase 3: ordering

- [ ] `orderMode` switch rendering either form.
- [ ] Order form with zod validation, total calculation, DB write, two emails via Resend.
- [ ] Contact form.
- [ ] Orders list and status changes in `/admin`.
- [ ] Honeypot and rate limiting.

### Phase 4: visuals

- [ ] Hero honey shader (reusable part goes into the kit).
- [ ] Kinetic typography for the hero and section titles (SplitText + shader distortion).
- [ ] Particle swarm to honeycomb to jar morph.
- [ ] 3D honey jar model (built in code or Blender, compressed `.glb`) for the featured product.
- [ ] Post-processing pass (bloom, grain) tuned per quality tier.
- [ ] Light-mode fallback for every scene.

### Phase 5: polish and launch

- [ ] SEO set (metadata, hreflang, OG image, sitemap, robots, JSON-LD).
- [ ] Accessibility pass and Lighthouse check on mobile.
- [ ] Handover note for Franciszek (in Polish, kept outside the repo): how to log in and edit the offer.

## Open questions

- Apiary name, logo, photos, copy and prices from Franciszek.
- A sending domain for Resend: without a verified domain, Resend only delivers to the account owner's address, so customer confirmations need a domain.
- Vercel Hobby is for non-commercial use only; a site that sells honey may need Vercel Pro.
