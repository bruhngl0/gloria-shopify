# Styled by Gloria lead capture

This Cloudflare Worker receives the contact and styling-service forms from the Shopify theme and stores submissions in Neon Postgres. The private dashboard is available at `/admin`.

## First-time setup

1. Authenticate with Cloudflare using `npx wrangler login`.
2. Create a Neon project and copy its pooled connection string. Keep it private.
3. Create the schema in the Neon SQL Editor, or locally with:

   `DATABASE_URL='your-neon-connection-string' npm run db:migrate`

4. Set the Neon connection string and dashboard secret without committing either:

   `npx wrangler secret put DATABASE_URL`

   `npx wrangler secret put ADMIN_TOKEN`

5. Deploy:

   `npx wrangler deploy`

6. In Shopify admin, set the theme setting `Cloudflare Worker endpoint` to the deployed Worker URL.
7. Open `/admin` on the Worker URL and use the `ADMIN_TOKEN` value.

The Worker validates name, email, and message, rejects the honeypot field, limits stored field lengths, supports CORS only from the configured Shopify origin, and keeps Shopify's native contact form as a fallback when the endpoint is unavailable.
