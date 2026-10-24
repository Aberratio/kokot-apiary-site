# kokot-apiary-site

Website for Franciszek Kokot's apiary: a one-page, 3D-heavy site with a honey offer managed through a custom CMS.

Built on [web-studio-starter](https://github.com/aberratio/web-studio-starter) and [web-studio-kit](https://github.com/aberratio/web-studio-kit). Hosted on Vercel.

See [docs/plan.md](docs/plan.md) for the implementation plan.

## Local development

```sh
npm install
cp .env.example .env.local   # fill in what you have; everything is optional locally
npm run dev
```

Without `DATABASE_URL` the public page renders the placeholder content, and `/admin` shows that the database is not configured.

## Database

Postgres on Neon through Drizzle ORM. The schema lives in `src/db/schema.ts`, and migrations in `drizzle/`.

| Command               | What it does                                                       |
| --------------------- | ------------------------------------------------------------------ |
| `npm run db:generate` | Writes a new migration after a schema change                       |
| `npm run db:migrate`  | Applies pending migrations to `DATABASE_URL` (skips when unset)    |
| `npm run db:seed`     | Fills an empty database with placeholder content; never overwrites |

On Vercel, `vercel-build` runs `db:migrate` before `next build`. Tests run the same migrations against an in-memory PGlite, so they need no database.

## Ordering

The CMS setting `orderMode` picks the form at the bottom of the page: `form` (order form) or `contact` (contact form). The order form falls back to the contact form while no product is available.

- Prices are recalculated on the server from the database; the browser total is only a preview.
- The order is stored before any email is sent, so a failed email never loses an order. Franciszek gets a notification in Polish (reply goes to the customer), and the customer gets a confirmation with the transfer details in their language.
- Spam: an off-screen honeypot field, plus a per-IP rate limit stored in Postgres (`rate_limits`, hashed keys, no raw IPs). The admin login is rate-limited the same way.
- Emails go through Resend (`RESEND_API_KEY`, `EMAIL_FROM`). Without a key they are skipped and logged; a contact message then shows an error, because the email is its only copy.

## Admin (`/admin`)

One admin account. Create its secrets with:

```sh
npm run admin:hash -- "<a long password>"
```

This prints `ADMIN_PASSWORD_HASH` and a fresh `SESSION_SECRET`; set both as environment variables. The session is a signed, httpOnly cookie that lasts a week. Every admin page and every Server Action checks it.

Saving in the admin refreshes the public page immediately: the page's content is cached under the `site-content` tag, and every save calls `updateTag`.

## Graphics (Blender)

Every rendered still and the jar model are built from Python scripts in `blender/`, so each asset can be rebuilt from source. There are no hand-made `.blend` files.

| File                    | What it does                                                                  |
| ----------------------- | ----------------------------------------------------------------------------- |
| `blender/common.py`     | The shared look: the hero's palette, the warm backlight rig, bokeh, materials |
| `blender/geometry.py`   | Procedural models: honey jar, dipper, honey drip, comb and frame, hive        |
| `blender/stills.py`     | One scene per still (`hero-*`, `jar`, `product-*`, `about-*`, `process-comb`) |
| `blender/export_jar.py` | The jar as three named meshes (Glass, Honey, Lid) in a `.glb`                 |

```sh
npm run assets:build                                   # render, encode and compress everything (about 20 min on 16 cores)
npm run assets:build -- --only about-hive --samples 64 # one still, quicker
npm run assets:build -- --skip-render                  # re-encode the existing renders only
```

The hero's drip loops (`hero-wide-drip`, `hero-tall-drip`) also need ffmpeg with libvpx-vp9 (`FFMPEG` env var, else `ffmpeg` on `PATH`; Playwright's bundled ffmpeg works). Their regions on the stills go to `src/lib/hero-loops.json`.

It needs Blender 5.2 (`BLENDER` env var, else the default Windows install path, else `blender` on `PATH`). Renders land in `blender/build/` (not committed). `scripts/build-assets.mts` encodes each still as AVIF and WebP at the widths listed in `src/lib/stills.ts` into `public/stills/`, and compresses the model with gltfpack (Meshopt) into `public/models/jar.glb`.

Budgets, checked by `src/lib/stills.test.ts`: jar model 60 KB or less (now 38 KB); stills 35 KB per file at phone widths and 50 KB at desktop widths, 45 and 90 KB for the jar and the comb (now 4 to 37 KB as AVIF). Stills load only after the page's load event and when they near the viewport (`LazyStill`), so nothing is fetched before the hero title paints. The exception is the hero's own still (`hero-wide` or `hero-tall`, chosen by the same media query as the layout), which is in the server HTML with high fetch priority.
