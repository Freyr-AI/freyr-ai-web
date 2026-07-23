# Freyr News Studio

Cloudflare Worker-based news administration application.

## Runtime components

- Cloudflare Access protects the admin hostname.
- D1 stores news, revisions, assets, and role assignments.
- R2 stores uploaded news images.
- Worker static assets serve the responsive HTML editor.
- Publishing optionally calls a Pages Deploy Hook.

## Local preparation

1. Copy `wrangler.example.jsonc` to `wrangler.jsonc`.
2. Fill in the D1 database ID and environment-specific values.
3. Store `DEPLOY_HOOK_URL` with `wrangler secret put`; never commit it.
4. Apply migrations with Wrangler.
5. For local-only development, set `ENVIRONMENT=development` and
   `DEV_AUTH_EMAIL` in `.dev.vars`.

Both `wrangler.jsonc` and `.dev.vars` are ignored because they contain
environment-specific identifiers and local authentication settings.

## Authorization

Cloudflare Access determines who can reach the admin hostname. The Worker also
validates the Access JWT and checks `admin_users.role`.

- `editor`: create and edit drafts.
- `publisher`: editor permissions plus publish/unpublish.
- `admin`: full publishing access and bootstrap ownership.

