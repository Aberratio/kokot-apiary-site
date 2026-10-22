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
