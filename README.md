# DEAL Cleaning Products — Storefront + Private Admin Dashboard

Single-product e-commerce site for **DEAL CLEAN – All in One (500 ml)** by **SP Enterprises**, Katedan, Hyderabad.

Stack: **React + TypeScript + Tailwind CSS + TanStack Router/Start**, backed by **your own Supabase project** (Auth, PostgreSQL, RLS, Storage, Edge Functions) and **Razorpay** for payments.

> This project does **not** use any managed/hosted Lovable backend. All backend
> services run in the Supabase project you own and configure.

---

## 1. Create your personal Supabase project

1. Sign in at <https://supabase.com/dashboard> and click **New project**.
2. Pick an organisation, project name (e.g. `deal-clean`), a strong database password and a region close to your customers (e.g. `ap-south-1`).
3. Wait for provisioning, then open **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

## 2. Add the environment variables

Copy the example file and fill it in:

```sh
cp .env.example .env
```

```dotenv
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
# optional, only used to pre-fill Razorpay in the browser
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
```

The app reads them through `import.meta.env.VITE_SUPABASE_URL` and
`import.meta.env.VITE_SUPABASE_ANON_KEY` in `src/integrations/supabase/client.ts`.
No credentials are hardcoded anywhere. Never put the service-role key or the
Razorpay secret in `.env` — those are Supabase secrets (step 8).

Restart the dev server after changing `.env`.

## 3. Run the SQL migrations

The migrations live in `supabase/migrations/`:

| File | Contents |
| --- | --- |
| `20260731000100_init_schema.sql` | tables, indexes, defaults, updated-at triggers, admin helper functions, RLS + policies, seed rows |
| `20260731000200_storage.sql` | `product-images` storage bucket + storage policies |

**Option A — Supabase CLI (recommended)**

```sh
npm i -g supabase
supabase login
supabase link --project-ref YOUR-PROJECT-REF
supabase db push
```

**Option B — SQL editor**

Open **SQL Editor** in the dashboard, paste each file's contents in order and run them.

Tables created: `profiles`, `products`, `customers`, `orders`,
`order_status_history`, `reviews`, `contact_messages`, `business_settings`.
The migration also seeds one product row (DEAL CLEAN 500 ml, ₹200) and one
business-settings row.

## 4. Create the admin user manually

Public admin signup does not exist — create the account yourself:

1. Dashboard → **Authentication → Users → Add user → Create new user**.
2. Enter the admin email + password and tick **Auto Confirm User**.
3. A `profiles` row is created automatically by the `on_auth_user_created` trigger.

## 5. Set the role to `admin`

Run in the SQL editor (or edit the row in **Table Editor → profiles**):

```sql
update public.profiles
set role = 'admin'
where email = 'admin@yourdomain.com';
```

Sign in at `/admin/login`. Anyone signed in without `role = 'admin'` sees
**Access Denied**; signed-out visitors are redirected to `/admin/login`.
RLS enforces the same rule at the database level.

Admin routes: `/admin/dashboard`, `/admin/orders`, `/admin/customers`,
`/admin/product`, `/admin/reviews`, `/admin/contact-messages`, `/admin/settings`.
Password recovery: `/admin/forgot-password` → email link → `/admin/reset-password`.

## 6. Configure Supabase Storage

`20260731000200_storage.sql` creates a public **`product-images`** bucket:
public read, admin-only insert/update/delete. If you prefer to create it by
hand: **Storage → New bucket → `product-images` → Public**, then re-run the
policy statements from that migration.

Product image uploads from `/admin/product` land in this bucket and the public
URL is stored in `products.image_url`.

Also set **Authentication → URL Configuration → Site URL** and add your
deployed origin plus `http://localhost:8080` to the redirect allow-list so the
password-reset link returns to `/admin/reset-password`.

## 7. Deploy the Edge Functions

```sh
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
supabase functions deploy razorpay-webhook --no-verify-jwt
supabase functions deploy send-order-notification   # optional
```

`razorpay-webhook` must be deployed with `--no-verify-jwt` so Razorpay's
servers can reach it; it authenticates the request by HMAC signature instead.

## 8. Add the Razorpay (and other) secrets

```sh
supabase secrets set \
  RAZORPAY_KEY_ID=rzp_live_xxxxxxxx \
  RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx \
  RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected into Edge Functions
automatically. Secrets are never exposed to the browser — the frontend only
ever receives the public `key_id` returned by `create-razorpay-order`.

Optional notification secrets (nothing is sent until they exist):

```sh
supabase secrets set \
  NOTIFY_EMAIL_ENDPOINT=... NOTIFY_EMAIL_API_KEY=... \
  NOTIFY_EMAIL_FROM=... NOTIFY_EMAIL_TO=...
supabase secrets set \
  WHATSAPP_API_URL=... WHATSAPP_API_TOKEN=... WHATSAPP_ADMIN_NUMBER=...
```

The email/WhatsApp helpers in `supabase/functions/_shared/notifications.ts` are
provider-agnostic HTTP calls — point them at whichever provider you choose.

## 9. Configure the Razorpay webhook

1. Razorpay dashboard → **Settings → Webhooks → Add New Webhook**.
2. URL: `https://YOUR-PROJECT-REF.supabase.co/functions/v1/razorpay-webhook`
3. Secret: the same value you stored as `RAZORPAY_WEBHOOK_SECRET`.
4. Active events: `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`.

Payment flow: checkout → `create-razorpay-order` (server-side pricing, pending
order row) → Razorpay checkout → `verify-razorpay-payment` (HMAC signature
check) → order set to `payment_status = 'paid'`, `order_status = 'new'` →
customer sees `/order-confirmed`, admin sees it in `/admin/orders`. The webhook
reconciles anything the browser misses.

## 10. Run the project locally

```sh
npm install
npm run dev
```

The app starts on <http://localhost:8080>.

## 11. Build

```sh
npm run build
npm run preview   # serve the production build locally
```

## 12. Deploy the frontend

Deploy the built output to any host that supports Node/edge SSR (Vercel,
Netlify, Cloudflare Workers). Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
(and optionally `VITE_RAZORPAY_KEY_ID`) as environment variables in the hosting
dashboard, then add the deployed origin to Supabase **Authentication → URL
Configuration**.

---

## Project structure

```
src/
  components/        UI + site sections + admin/ layout & guards
  hooks/             useAuth (Supabase session + profile role)
  integrations/
    supabase/client.ts   reusable @supabase/supabase-js client
  lib/               cart, site config, utils
  routes/            TanStack file-based routes
    admin/login.tsx, forgot-password.tsx, reset-password.tsx
    admin/_protected/route.tsx        role-protected layout (all admin pages)
    admin/_protected/*.tsx            dashboard, orders, customers, product,
                                      reviews, contact-messages, settings
  services/          authService, productService, orderService,
                     adminService, paymentService
  types/database.ts  typed rows mirroring the migrations
supabase/
  migrations/        SQL schema, triggers, RLS, storage
  functions/         create-razorpay-order, verify-razorpay-payment,
                     razorpay-webhook, send-order-notification, _shared
.env.example
```

TanStack Router is file-based, so route protection lives in
`src/routes/admin/_protected/route.tsx` (the equivalent of a
`protectedRoutes.tsx`) and the admin route table is the
`src/routes/admin/` folder itself.

## Security notes

- RLS is enabled on every table; private tables use `public.is_admin(auth.uid())`
  checks — never `USING (true)`.
- Orders can only be inserted by the Edge Functions (service role) after
  server-side payment verification; the public role cannot read or modify
  orders, customers, or payment status.
- Public visitors can read only available products, approved reviews and public
  business settings, and can submit contact messages and reviews.
- `/admin` is disallowed in `robots.txt` and every admin page is `noindex`.
