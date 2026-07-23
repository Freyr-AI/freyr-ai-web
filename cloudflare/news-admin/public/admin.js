const state = {
  user: null,
  items: [],
  currentId: null,
  htmlMode: false,
  dirty: false,
};

const elements = {
  sessionUser: document.querySelector("#sessionUser"),
  newsList: document.querySelector("#newsList"),
  searchNews: document.querySelector("#searchNews"),
  articleForm: document.querySelector("#articleForm"),
  editorState: document.querySelector("#editorState"),
  editorHeading: document.querySelector("#editorHeading"),
  notice: document.querySelector("#notice"),
  title: document.querySelector("#title"),
  slug: document.querySelector("#slug"),
  category: document.querySelector("#category"),
  summary: document.querySelector("#summary"),
  coverImageUrl: document.querySelector("#coverImageUrl"),
  coverUpload: document.querySelector("#coverUpload"),
  richEditor: document.querySelector("#richEditor"),
  htmlEditor: document.querySelector("#htmlEditor"),
  toolbar: document.querySelector("#toolbar"),
  toggleHtml: document.querySelector("#toggleHtml"),
  saveArticle: document.querySelector("#saveArticle"),
  publishArticle: document.querySelector("#publishArticle"),
  unpublishArticle: document.querySelector("#unpublishArticle"),
  previewDialog: document.querySelector("#previewDialog"),
};

document.querySelector("#newArticle").addEventListener("click", newArticle);
document.querySelector("#previewArticle").addEventListener("click", openPreview);
document.querySelector("#closePreview").addEventListener("click", () => elements.previewDialog.close());
document.querySelector("#addLink").addEventListener("click", addLink);
elements.searchNews.addEventListener("input", renderNewsList);
elements.toggleHtml.addEventListener("click", toggleHtmlMode);
elements.saveArticle.addEventListener("click", () => saveArticle(false));
elements.publishArticle.addEventListener("click", publishArticle);
elements.unpublishArticle.addEventListener("click", unpublishArticle);
elements.coverUpload.addEventListener("change", uploadCover);
elements.articleForm.addEventListener("input", () => {
  state.dirty = true;
  if (document.activeElement === elements.title && !state.currentId) {
    elements.slug.value = slugify(elements.title.value);
  }
});
elements.toolbar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-command]");
  if (!button) return;
  document.execCommand(button.dataset.command, false, button.dataset.value || null);
  elements.richEditor.focus();
  state.dirty = true;
});
window.addEventListener("beforeunload", (event) => {
  if (!state.dirty) return;
  event.preventDefault();
  event.returnValue = "";
});

initialize();

async function initialize() {
  try {
    const session = await api("/api/admin/session");
    state.user = session.user;
    elements.sessionUser.textContent = `${session.user.email} · ${session.user.role}`;
    const canPublish = ["publisher", "admin"].includes(session.user.role);
    elements.publishArticle.hidden = !canPublish;
    await loadNews();
    newArticle();
  } catch (error) {
    showNotice(error.message, true);
    elements.editorShell?.setAttribute("aria-disabled", "true");
  }
}

async function loadNews(selectId = null) {
  const result = await api("/api/admin/news");
  state.items = result.items || [];
  renderNewsList();
  if (selectId) selectArticle(selectId);
}

function renderNewsList() {
  const query = elements.searchNews.value.trim().toLowerCase();
  const items = state.items.filter((item) =>
    !query || item.title.toLowerCase().includes(query) || item.slug.toLowerCase().includes(query)
  );

  if (!items.length) {
    elements.newsList.innerHTML = '<p class="empty">No matching articles.</p>';
    return;
  }

  elements.newsList.innerHTML = items.map((item) => `
    <button class="news-item ${item.id === state.currentId ? "active" : ""}" data-id="${escapeHtml(item.id)}" type="button">
      <strong>${escapeHtml(item.title)}</strong>
      <span class="news-meta">
        <span>${escapeHtml(item.category || "NEWS")}</span>
        <span class="status ${item.status}">${item.status}</span>
      </span>
    </button>
  `).join("");

  elements.newsList.querySelectorAll(".news-item").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.dirty && !window.confirm("Discard unsaved changes?")) return;
      selectArticle(button.dataset.id);
    });
  });
}

function newArticle() {
  state.currentId = null;
  state.dirty = false;
  elements.articleForm.reset();
  elements.category.value = "NEWS";
  elements.richEditor.innerHTML = "";
  elements.htmlEditor.value = "";
  elements.editorState.textContent = "NEW DRAFT";
  elements.editorHeading.textContent = "Create news";
  elements.saveArticle.textContent = "Save draft";
  elements.unpublishArticle.hidden = true;
  renderNewsList();
}

function selectArticle(id) {
  const item = state.items.find((entry) => entry.id === id);
  if (!item) return;

  state.currentId = id;
  state.dirty = false;
  elements.title.value = item.title;
  elements.slug.value = item.slug;
  elements.category.value = item.category || "NEWS";
  elements.summary.value = item.summary || "";
  elements.coverImageUrl.value = item.cover_image_url || "";
  elements.richEditor.innerHTML = item.body_html || "";
  elements.htmlEditor.value = item.body_html || "";
  elements.editorState.textContent = item.status === "published" ? "PUBLISHED" : "DRAFT";
  elements.editorHeading.textContent = item.title;
  elements.saveArticle.textContent = "Save changes";
  elements.unpublishArticle.hidden = item.status !== "published" || !["publisher", "admin"].includes(state.user.role);
  renderNewsList();
}

async function saveArticle(quiet) {
  syncEditor();
  const payload = getPayload();
  if (!payload.title || !payload.slug) {
    showNotice("Title and slug are required.", true);
    return null;
  }

  setBusy(true);
  try {
    const result = state.currentId
      ? await api(`/api/admin/news/${state.currentId}`, { method: "PUT", body: payload })
      : await api("/api/admin/news", { method: "POST", body: payload });
    state.currentId = result.id;
    state.dirty = false;
    await loadNews(result.id);
    if (!quiet) showNotice("Draft saved.");
    return result;
  } catch (error) {
    showNotice(error.message, true);
    return null;
  } finally {
    setBusy(false);
  }
}

async function publishArticle() {
  const saved = await saveArticle(true);
  if (!saved) return;
  setBusy(true);
  try {
    await api(`/api/admin/news/${state.currentId}/publish`, { method: "POST" });
    await loadNews(state.currentId);
    showNotice("Published. The public site rebuild has been requested.");
  } catch (error) {
    showNotice(error.message, true);
  } finally {
    setBusy(false);
  }
}

async function unpublishArticle() {
  if (!state.currentId || !window.confirm("Remove this article from the public site?")) return;
  setBusy(true);
  try {
    await api(`/api/admin/news/${state.currentId}/unpublish`, { method: "POST" });
    await loadNews(state.currentId);
    showNotice("Article returned to draft.");
  } catch (error) {
    showNotice(error.message, true);
  } finally {
    setBusy(false);
  }
}

async function uploadCover() {
  const file = elements.coverUpload.files[0];
  if (!file) return;
  const form = new FormData();
  form.append("file", file);
  form.append("alt", elements.title.value || file.name);
  showNotice("Uploading image…");
  try {
    const result = await api("/api/admin/assets", { method: "POST", form });
    elements.coverImageUrl.value = result.url;
    state.dirty = true;
    showNotice("Image uploaded.");
  } catch (error) {
    showNotice(error.message, true);
  } finally {
    elements.coverUpload.value = "";
  }
}

function toggleHtmlMode() {
  if (state.htmlMode) {
    elements.richEditor.innerHTML = elements.htmlEditor.value;
  } else {
    elements.htmlEditor.value = elements.richEditor.innerHTML;
  }
  state.htmlMode = !state.htmlMode;
  elements.richEditor.hidden = state.htmlMode;
  elements.htmlEditor.hidden = !state.htmlMode;
  elements.toolbar.hidden = state.htmlMode;
  elements.toggleHtml.textContent = state.htmlMode ? "Visual editor" : "Edit HTML";
}

function syncEditor() {
  if (state.htmlMode) elements.richEditor.innerHTML = elements.htmlEditor.value;
  else elements.htmlEditor.value = elements.richEditor.innerHTML;
}

function addLink() {
  const url = window.prompt("Link URL (https://…)");
  if (!url) return;
  document.execCommand("createLink", false, url);
  state.dirty = true;
}

function openPreview() {
  syncEditor();
  const payload = getPayload();
  document.querySelector("#previewCategory").textContent = payload.category;
  document.querySelector("#previewTitle").textContent = payload.title || "Untitled article";
  document.querySelector("#previewSummary").textContent = payload.summary;
  document.querySelector("#previewBody").innerHTML = payload.bodyHtml;
  const cover = document.querySelector("#previewCover");
  cover.hidden = !payload.coverImageUrl;
  cover.src = payload.coverImageUrl || "";
  elements.previewDialog.showModal();
}

function getPayload() {
  return {
    title: elements.title.value.trim(),
    slug: slugify(elements.slug.value),
    category: elements.category.value.trim() || "NEWS",
    summary: elements.summary.value.trim(),
    coverImageUrl: elements.coverImageUrl.value.trim(),
    bodyHtml: elements.richEditor.innerHTML,
    bodyJson: { format: "html", version: 1 },
  };
}

async function api(url, options = {}) {
  const init = {
    method: options.method || "GET",
    credentials: "same-origin",
    headers: {},
  };
  if (options.form) init.body = options.form;
  if (options.body) {
    init.headers["content-type"] = "application/json";
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

function setBusy(busy) {
  [elements.saveArticle, elements.publishArticle, elements.unpublishArticle].forEach((button) => {
    button.disabled = busy;
  });
}

function showNotice(message, error = false) {
  elements.notice.hidden = false;
  elements.notice.textContent = message;
  elements.notice.classList.toggle("error", error);
  window.clearTimeout(showNotice.timer);
  showNotice.timer = window.setTimeout(() => {
    if (!error) elements.notice.hidden = true;
  }, 5000);
}

function slugify(value) {
  return value.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

