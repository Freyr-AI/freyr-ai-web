const ALLOWED_ROLES = new Set(["editor", "publisher", "admin"]);
const PUBLISH_ROLES = new Set(["publisher", "admin"]);
const ALLOWED_TAGS = new Set([
  "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s",
  "ul", "ol", "li", "blockquote", "a", "img", "figure", "figcaption",
  "pre", "code", "hr",
]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/public/")) {
      return publicCors(new Response(null, { status: 204 }), env);
    }

    try {
      if (url.pathname.startsWith("/media/")) {
        return serveMedia(request, env, url);
      }

      if (url.pathname === "/api/public/news" && request.method === "GET") {
        return publicCors(await listPublishedNews(env, url), env);
      }

      if (url.pathname.startsWith("/api/public/news/") && request.method === "GET") {
        const slug = decodeURIComponent(url.pathname.slice("/api/public/news/".length));
        return publicCors(await getPublishedNews(env, slug), env);
      }

      if (url.pathname.startsWith("/api/admin/")) {
        if (env.ADMIN_HOSTNAME && url.hostname !== env.ADMIN_HOSTNAME) {
          throw new HttpError(404, "Not found");
        }
        const actor = await requireActor(request, env);
        return await handleAdmin(request, env, ctx, url, actor);
      }

      if (!env.ADMIN_HOSTNAME || url.hostname === env.ADMIN_HOSTNAME) {
        return env.ASSETS.fetch(request);
      }

      return new Response("Not found", { status: 404 });
    } catch (error) {
      console.error(error);
      const status = error instanceof HttpError ? error.status : 500;
      const message = status === 500 ? "Internal server error" : error.message;
      return json({ error: message }, status);
    }
  },
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function handleAdmin(request, env, ctx, url, actor) {
  const path = url.pathname;

  if (path === "/api/admin/session" && request.method === "GET") {
    return json({ user: actor });
  }

  if (path === "/api/admin/news" && request.method === "GET") {
    const rows = await env.DB.prepare(
      `SELECT id, slug, title, summary, category, body_json, body_html,
              cover_image_url, status, published_at, created_by, updated_by,
              created_at, updated_at
       FROM news
       ORDER BY updated_at DESC
       LIMIT 500`
    ).all();
    return json({ items: rows.results });
  }

  if (path === "/api/admin/news" && request.method === "POST") {
    const input = await readJson(request);
    const item = normalizeNewsInput(input);
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await env.DB.prepare(
      `INSERT INTO news (
        id, slug, title, summary, category, body_json, body_html,
        cover_image_url, status, created_by, updated_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?)`
    ).bind(
      id, item.slug, item.title, item.summary, item.category,
      item.bodyJson, item.bodyHtml, item.coverImageUrl,
      actor.email, actor.email, now, now
    ).run();

    await saveRevision(env, id, { ...item, status: "draft" }, actor.email);
    return json({ id, status: "draft" }, 201);
  }

  const newsMatch = path.match(/^\/api\/admin\/news\/([^/]+)$/);
  if (newsMatch && request.method === "PUT") {
    const id = newsMatch[1];
    const existing = await getNewsById(env, id);
    const item = normalizeNewsInput(await readJson(request));
    const now = new Date().toISOString();

    await env.DB.prepare(
      `UPDATE news
       SET slug = ?, title = ?, summary = ?, category = ?, body_json = ?,
           body_html = ?, cover_image_url = ?, updated_by = ?, updated_at = ?
       WHERE id = ?`
    ).bind(
      item.slug, item.title, item.summary, item.category, item.bodyJson,
      item.bodyHtml, item.coverImageUrl, actor.email, now, id
    ).run();

    await saveRevision(env, id, { ...item, status: existing.status }, actor.email);
    return json({ id, status: existing.status });
  }

  const publishMatch = path.match(/^\/api\/admin\/news\/([^/]+)\/(publish|unpublish)$/);
  if (publishMatch && request.method === "POST") {
    assertCanPublish(actor);
    const [, id, action] = publishMatch;
    const existing = await getNewsById(env, id);
    const status = action === "publish" ? "published" : "draft";
    const publishedAt = action === "publish"
      ? (existing.published_at || new Date().toISOString())
      : null;

    await env.DB.prepare(
      `UPDATE news
       SET status = ?, published_at = ?, updated_by = ?, updated_at = ?
       WHERE id = ?`
    ).bind(status, publishedAt, actor.email, new Date().toISOString(), id).run();

    await saveRevision(env, id, {
      slug: existing.slug,
      title: existing.title,
      summary: existing.summary,
      category: existing.category,
      bodyJson: existing.body_json,
      bodyHtml: existing.body_html,
      coverImageUrl: existing.cover_image_url,
      status,
    }, actor.email);

    if (env.DEPLOY_HOOK_URL) {
      ctx.waitUntil(fetch(env.DEPLOY_HOOK_URL, { method: "POST" }).catch(console.error));
    }

    return json({ id, status, published_at: publishedAt });
  }

  if (path === "/api/admin/assets" && request.method === "POST") {
    return uploadAsset(request, env, actor);
  }

  throw new HttpError(404, "Not found");
}

async function listPublishedNews(env, url) {
  const requestedLimit = Number(url.searchParams.get("limit") || 20);
  const limit = Math.max(1, Math.min(1000, requestedLimit));
  const includeBody = url.searchParams.get("include_body") === "1";
  const bodyColumns = includeBody ? ", body_json, body_html" : "";
  const rows = await env.DB.prepare(
    `SELECT id, slug, title, summary, category, cover_image_url,
            published_at, updated_at ${bodyColumns}
     FROM news
     WHERE status = 'published'
     ORDER BY published_at DESC
     LIMIT ?`
  ).bind(limit).all();

  return json({ items: rows.results });
}

async function getPublishedNews(env, slug) {
  const item = await env.DB.prepare(
    `SELECT id, slug, title, summary, category, body_json, body_html,
            cover_image_url, published_at, updated_at
     FROM news
     WHERE slug = ? AND status = 'published'
     LIMIT 1`
  ).bind(slug).first();

  if (!item) throw new HttpError(404, "News item not found");
  return json({ item });
}

async function uploadAsset(request, env, actor) {
  const form = await request.formData();
  const file = form.get("file");
  const altText = String(form.get("alt") || "").slice(0, 300);

  if (!(file instanceof File)) throw new HttpError(400, "Image file is required");
  if (!file.type.startsWith("image/")) throw new HttpError(400, "Only image uploads are allowed");
  if (file.size > 10 * 1024 * 1024) throw new HttpError(400, "Image must be smaller than 10 MB");

  const cleanName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(-100);
  const date = new Date();
  const key = `news/${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}-${cleanName}`;

  await env.MEDIA.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    },
    customMetadata: { uploadedBy: actor.email },
  });

  await env.DB.prepare(
    `INSERT INTO assets (
      id, r2_key, original_name, mime_type, size, alt_text, uploaded_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    crypto.randomUUID(), key, file.name, file.type, file.size, altText, actor.email
  ).run();

  const origin = String(env.PUBLIC_API_ORIGIN || new URL(request.url).origin).replace(/\/$/, "");
  return json({ url: `${origin}/media/${key}`, key });
}

async function serveMedia(request, env, url) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }

  const key = decodeURIComponent(url.pathname.slice("/media/".length));
  const object = await env.MEDIA.get(key);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(request.method === "HEAD" ? null : object.body, { headers });
}

async function requireActor(request, env) {
  let identity;

  if (env.ENVIRONMENT === "development" && env.DEV_AUTH_EMAIL) {
    identity = { email: String(env.DEV_AUTH_EMAIL).toLowerCase() };
  } else {
    identity = await verifyAccessJwt(request, env);
  }

  const email = String(identity.email || "").toLowerCase();
  if (!email) throw new HttpError(403, "Authenticated email is missing");

  let user = await env.DB.prepare(
    "SELECT email, role, enabled FROM admin_users WHERE email = ? LIMIT 1"
  ).bind(email).first();

  if (!user && email === String(env.BOOTSTRAP_ADMIN_EMAIL || "").toLowerCase()) {
    user = { email, role: "admin", enabled: 1 };
  }

  if (!user || !user.enabled || !ALLOWED_ROLES.has(user.role)) {
    throw new HttpError(403, "This account is not authorized for the news admin");
  }

  return { email, role: user.role };
}

async function verifyAccessJwt(request, env) {
  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token) throw new HttpError(401, "Cloudflare Access login is required");
  if (!env.TEAM_DOMAIN || !env.ACCESS_AUD) {
    throw new HttpError(500, "Cloudflare Access is not configured");
  }

  const parts = token.split(".");
  if (parts.length !== 3) throw new HttpError(401, "Invalid Access token");

  const header = JSON.parse(decodeBase64Url(parts[0]));
  const payload = JSON.parse(decodeBase64Url(parts[1]));
  const now = Math.floor(Date.now() / 1000);
  const issuer = String(env.TEAM_DOMAIN).replace(/\/$/, "");
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

  if (payload.iss !== issuer || !audiences.includes(env.ACCESS_AUD) || payload.exp < now) {
    throw new HttpError(401, "Expired or invalid Access token");
  }

  const jwksResponse = await fetch(`${issuer}/cdn-cgi/access/certs`, {
    cf: { cacheTtl: 3600, cacheEverything: true },
  });
  if (!jwksResponse.ok) throw new HttpError(503, "Unable to validate Access login");
  const { keys } = await jwksResponse.json();
  const jwk = keys.find((key) => key.kid === header.kid);
  if (!jwk) throw new HttpError(401, "Unknown Access signing key");

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    base64UrlBytes(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  );

  if (!valid) throw new HttpError(401, "Invalid Access token signature");
  return payload;
}

function normalizeNewsInput(input) {
  const title = String(input.title || "").trim().slice(0, 240);
  const slug = String(input.slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);

  if (!title) throw new HttpError(400, "Title is required");
  if (!slug) throw new HttpError(400, "Slug is required");

  return {
    title,
    slug,
    summary: String(input.summary || "").trim().slice(0, 1000),
    category: String(input.category || "NEWS").trim().toUpperCase().slice(0, 80),
    bodyJson: JSON.stringify(input.bodyJson || {}),
    bodyHtml: sanitizeHtml(String(input.bodyHtml || "")),
    coverImageUrl: safeUrl(String(input.coverImageUrl || ""), true),
  };
}

function sanitizeHtml(html) {
  return html.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, (rawTag) => {
    const closing = rawTag.match(/^<\s*\/\s*([a-z0-9]+)/i);
    if (closing) {
      const tag = closing[1].toLowerCase();
      return ALLOWED_TAGS.has(tag) && !["br", "img", "hr"].includes(tag) ? `</${tag}>` : "";
    }

    const opening = rawTag.match(/^<\s*([a-z0-9]+)/i);
    if (!opening) return "";
    const tag = opening[1].toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";

    if (tag === "a") {
      const href = attribute(rawTag, "href");
      const safeHref = safeUrl(href, false);
      return safeHref
        ? `<a href="${escapeAttribute(safeHref)}" target="_blank" rel="noopener noreferrer">`
        : "<a>";
    }

    if (tag === "img") {
      const src = safeUrl(attribute(rawTag, "src"), true);
      if (!src) return "";
      const alt = escapeAttribute(attribute(rawTag, "alt").slice(0, 300));
      return `<img src="${escapeAttribute(src)}" alt="${alt}" loading="lazy">`;
    }

    return `<${tag}>`;
  });
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match ? (match[1] ?? match[2] ?? match[3] ?? "") : "";
}

function safeUrl(value, allowMedia) {
  const url = value.trim();
  if (!url) return "";
  if (allowMedia && url.startsWith("/media/")) return url;
  if (url.startsWith("https://")) return url;
  if (!allowMedia && (url.startsWith("/") || url.startsWith("#"))) return url;
  return "";
}

async function getNewsById(env, id) {
  const item = await env.DB.prepare("SELECT * FROM news WHERE id = ? LIMIT 1").bind(id).first();
  if (!item) throw new HttpError(404, "News item not found");
  return item;
}

async function saveRevision(env, newsId, item, email) {
  await env.DB.prepare(
    `INSERT INTO news_revisions (
      id, news_id, title, summary, body_json, body_html,
      cover_image_url, status, edited_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    crypto.randomUUID(), newsId, item.title, item.summary, item.bodyJson,
    item.bodyHtml, item.coverImageUrl, item.status, email
  ).run();
}

function assertCanPublish(actor) {
  if (!PUBLISH_ROLES.has(actor.role)) {
    throw new HttpError(403, "Publisher permission is required");
  }
}

async function readJson(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) throw new HttpError(415, "JSON body is required");
  return request.json();
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function publicCors(response, env) {
  const headers = new Headers(response.headers);
  const allowedOrigin = String(env.PUBLIC_SITE_ORIGIN || "");
  if (allowedOrigin) headers.set("access-control-allow-origin", allowedOrigin);
  headers.set("access-control-allow-methods", "GET, OPTIONS");
  headers.set("access-control-allow-headers", "content-type");
  return new Response(response.body, { status: response.status, headers });
}

function decodeBase64Url(value) {
  return new TextDecoder().decode(base64UrlBytes(value));
}

function base64UrlBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function escapeAttribute(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export { sanitizeHtml };
