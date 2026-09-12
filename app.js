const DEFAULT_SHORTCUTS = [];
const STORAGE_VERSION = "1.9.0";

const ENGINES = {
  google: { name: "Google", symbol: "G", url: "https://www.google.com/search?q=" },
  bing: { name: "Bing", symbol: "◆", url: "https://www.bing.com/search?q=" }
};

const MAX_SHORTCUTS = 12;

const ICONS = {
  google: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 12.2c0-0.7-0.1-1.3-0.2-1.9H12v3.6h4.6a4 4 0 0 1-1.7 2.6v2.2h2.8c1.7-1.6 2.5-3.8 2.5-6.5Z"/><path d="M12 20.8c2.4 0 4.4-0.8 5.8-2.1L15 16.5c-.8.5-1.7.8-3 .8-2.3 0-4.2-1.5-4.9-3.6H4.2v2.3a8.8 8.8 0 0 0 7.8 4.8Z"/><path d="M7.1 13.7a5.3 5.3 0 0 1 0-3.4V8H4.2a8.9 8.9 0 0 0 0 8l2.9-2.3Z"/><path d="M12 6.7c1.3 0 2.5.5 3.4 1.3l2.5-2.5C16.4 4.1 14.4 3.2 12 3.2a8.8 8.8 0 0 0-7.8 4.8l2.9 2.3C7.8 8.2 9.7 6.7 12 6.7Z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.4" y="6.2" width="17.2" height="11.6" rx="3"/><path d="m10.2 9.2 5 2.8-5 2.8V9.2Z"/></svg>`,
  github: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.4a8.6 8.6 0 0 0-2.7 16.8c.4.1.5-.2.5-.4v-1.6c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.1-.9-1.1-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.8.9 2.2.7.1-.5.3-.9.5-1.1-1.8-.2-3.7-.9-3.7-4a3 3 0 0 1 .8-2.1c-.1-.2-.3-1 .1-2.1 0 0 .7-.2 2.2.8a7.5 7.5 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.8-3.7 4 .3.3.5.7.5 1.4v2.3c0 .2.1.5.5.4A8.6 8.6 0 0 0 12 3.4Z"/></svg>`,
  notion: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.1 4.3h10.7l3.1 3v12.4H5.1V4.3Z"/><path d="m8.2 8.1 3.1 5.4V8.1h2.3"/><path d="M8.2 8.1h2.1"/></svg>`,
  chatgpt: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 4.1 2.6 1.5v3L12 10.1 9.4 8.6v-3L12 4.1Z"/><path d="m9.4 8.6-2.6 1.5v3l2.6 1.5 2.6-1.5v-3L9.4 8.6Z"/><path d="m14.6 8.6 2.6 1.5v3l-2.6 1.5-2.6-1.5v-3l2.6-1.5Z"/><path d="m9.4 14.6 2.6 1.5v3l2.6-1.5v-3"/><path d="m6.8 13.1-2.6 1.5v3l2.6 1.5 2.6-1.5"/></svg>`,
  bilibili: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.1 5.4 6.3 3.7M15.9 5.4l1.8-1.7"/><rect x="3.5" y="6.4" width="17" height="12.2" rx="3.7"/><path d="M8.4 11.2h.1M15.5 11.2h.1M8.4 14.5c1.1.8 2.1.8 3.6.8s2.5 0 3.6-.8"/></svg>`
};

const state = {
  shortcuts: [],
  engine: "google",
  customBackground: "",
  backgroundBlur: 16,
  draftShortcuts: []
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function formatClock() {
  const now = new Date();
  $("#clock").textContent = now.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function storageGet(keys) {
  if (globalThis.chrome?.storage?.local) {
    return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
  }
  const result = {};
  for (const key of keys) {
    const raw = localStorage.getItem(`glass-dock:${key}`);
    result[key] = raw ? JSON.parse(raw) : undefined;
  }
  return Promise.resolve(result);
}

function storageSet(values) {
  if (globalThis.chrome?.storage?.local) {
    return new Promise((resolve) => chrome.storage.local.set(values, resolve));
  }
  for (const [key, value] of Object.entries(values)) {
    localStorage.setItem(`glass-dock:${key}`, JSON.stringify(value));
  }
  return Promise.resolve();
}

function normalizeUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.href;
  } catch {
    return "";
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clampBackgroundBlur(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 16;
  return Math.min(32, Math.max(0, Math.round(number)));
}

function applyBackgroundBlur(value) {
  state.backgroundBlur = clampBackgroundBlur(value);
  document.documentElement.style.setProperty("--background-blur", `${state.backgroundBlur}px`);
  const slider = $("#background-blur");
  const output = $("#background-blur-value");
  if (slider) slider.value = String(state.backgroundBlur);
  if (output) output.textContent = `${state.backgroundBlur}px`;
}

function faviconUrl(pageUrl) {
  if (!globalThis.chrome?.runtime?.getURL) return "";
  const url = new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", pageUrl);
  url.searchParams.set("size", "64");
  return url.toString();
}

function iconMarkup(shortcut) {
  const letter = escapeHtml((shortcut.name || "?").trim().charAt(0).toUpperCase() || "?");
  const source = faviconUrl(shortcut.url);
  return `<span class="dock-letter" aria-hidden="true">${letter}</span>${source ? `<img class="dock-favicon" src="${escapeHtml(source)}" alt="" />` : ""}`;
}

function renderDock() {
  const dock = $("#dock");
  if (!state.shortcuts.length) {
    dock.innerHTML = `<div class="dock-empty">还没有入口，<button type="button" data-action="open-settings">添加第一个快捷入口</button></div>`;
    return;
  }
  dock.innerHTML = state.shortcuts.map((shortcut) => {
    const name = escapeHtml(shortcut.name);
    const url = escapeHtml(shortcut.url);
    return `<a class="dock-item" href="${url}" title="${name}" aria-label="打开 ${name}">
      <span class="dock-icon">${iconMarkup(shortcut)}</span>
      <span class="dock-label">${name}</span>
    </a>`;
  }).join("");
  dock.querySelectorAll(".dock-favicon").forEach((image) => {
    const fallback = image.previousElementSibling;
    const showImage = () => fallback?.classList.add("is-hidden");
    const showFallback = () => image.remove();
    image.addEventListener("load", showImage, { once: true });
    image.addEventListener("error", showFallback, { once: true });
    if (image.complete) {
      image.naturalWidth > 0 ? showImage() : showFallback();
    }
  });
}

function renderEngine() {
  const engine = ENGINES[state.engine] || ENGINES.google;
  $("#engine-symbol").textContent = engine.symbol;
  const menu = $("#engine-menu");
  menu.innerHTML = Object.entries(ENGINES).map(([key, item]) => `<button class="engine-option ${key === state.engine ? "active" : ""}" type="button" role="menuitem" data-engine="${key}">
    <span class="engine-option-symbol">${escapeHtml(item.symbol)}</span>
    <span class="engine-option-name">${escapeHtml(item.name)}</span>
    ${key === state.engine ? `<span class="engine-option-key">当前</span>` : ""}
  </button>`).join("");
}

function renderEditor() {
  const editor = $("#shortcut-editor");
  const template = $("#shortcut-row-template");
  editor.innerHTML = "";
  state.draftShortcuts.forEach((shortcut, index) => {
    const fragment = template.content.cloneNode(true);
    const row = fragment.querySelector(".shortcut-row");
    row.dataset.index = String(index);
    row.querySelector(".row-name").value = shortcut.name || "";
    row.querySelector(".row-url").value = shortcut.url || "";
    editor.appendChild(fragment);
  });
  if (!state.draftShortcuts.length) {
    editor.innerHTML = `<p class="editor-empty">暂无快捷入口。使用右上角“添加”建立第一个。</p>`;
  }
}

function openSettings() {
  state.draftShortcuts = state.shortcuts.map((item) => ({ ...item }));
  renderEditor();
  $("#settings-backdrop").hidden = false;
  $("#settings-modal").hidden = false;
  document.body.classList.add("modal-open");
  $("#editor-add").focus();
}

function closeSettings() {
  $("#settings-backdrop").hidden = true;
  $("#settings-modal").hidden = true;
  document.body.classList.remove("modal-open");
}

function addDraftShortcut() {
  if (state.draftShortcuts.length >= MAX_SHORTCUTS) return;
  state.draftShortcuts.push({ name: "新入口", url: "https://" });
  renderEditor();
  const rows = $$(".shortcut-row");
  rows.at(-1)?.querySelector(".row-name")?.focus();
}

function saveEditorRows() {
  const rows = $$(".shortcut-row");
  const next = [];
  for (const row of rows) {
    const name = row.querySelector(".row-name").value.trim();
    const url = normalizeUrl(row.querySelector(".row-url").value);
    if (!name && !url) continue;
    if (!name || !url) {
      row.querySelector(!name ? ".row-name" : ".row-url").focus();
      return null;
    }
    next.push({ name, url });
  }
  return next;
}

async function saveSettings() {
  const next = saveEditorRows();
  if (!next) return;
  state.shortcuts = next;
  await storageSet({ shortcuts: state.shortcuts, engine: state.engine, customBackground: state.customBackground, backgroundBlur: state.backgroundBlur });
  renderDock();
  closeSettings();
}

function applyBackground(value) {
  state.customBackground = value || "";
  if (state.customBackground) {
    document.body.classList.add("has-custom-background");
    document.documentElement.style.setProperty("--custom-background", `url("${state.customBackground}")`);
  } else {
    document.body.classList.remove("has-custom-background");
    document.documentElement.style.removeProperty("--custom-background");
  }
}

async function optimizeBackgroundImage(file) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.addEventListener("load", () => resolve(element), { once: true });
      element.addEventListener("error", reject, { once: true });
      element.src = objectUrl;
    });
    const maxSide = 2400;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.86);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function submitSearch(event) {
  event.preventDefault();
  const query = $("#query").value.trim();
  if (!query) return;
  const maybeUrl = normalizeUrl(query);
  const destination = /^(https?:\/\/|www\.)/i.test(query) && maybeUrl ? maybeUrl : `${ENGINES[state.engine].url}${encodeURIComponent(query)}`;
  window.location.href = destination;
}

function bindEvents() {
  $("#search-form").addEventListener("submit", submitSearch);
  $("#engine-toggle").addEventListener("click", () => {
    const menu = $("#engine-menu");
    menu.hidden = !menu.hidden;
    $("#engine-toggle").setAttribute("aria-expanded", String(!menu.hidden));
  });
  $("#engine-menu").addEventListener("click", async (event) => {
    const option = event.target.closest("[data-engine]");
    if (!option) return;
    state.engine = option.dataset.engine;
    await storageSet({ engine: state.engine });
    renderEngine();
    $("#engine-menu").hidden = true;
    $("#engine-toggle").setAttribute("aria-expanded", "false");
    $("#query").focus();
  });
  $("#open-settings").addEventListener("click", openSettings);
  $("#close-settings").addEventListener("click", closeSettings);
  $("#cancel-settings").addEventListener("click", closeSettings);
  $("#settings-backdrop").addEventListener("click", closeSettings);
  $("#editor-add").addEventListener("click", addDraftShortcut);
  $("#save-settings").addEventListener("click", saveSettings);
  $("#reset-shortcuts").addEventListener("click", () => {
    state.draftShortcuts = DEFAULT_SHORTCUTS.map((item) => ({ ...item }));
    renderEditor();
  });
  $("#reset-background").addEventListener("click", async () => {
    applyBackground("");
    await storageSet({ customBackground: "" });
  });
  $("#background-blur").addEventListener("input", (event) => {
    applyBackgroundBlur(event.target.value);
  });
  $("#background-file").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    optimizeBackgroundImage(file).then(async (value) => {
      if (value) {
        applyBackground(value);
        await storageSet({ customBackground: value });
      }
    }).catch(() => {}).finally(() => {
      event.target.value = "";
    });
  });
  $("#dock").addEventListener("click", (event) => {
    if (event.target.closest("[data-action='open-settings']")) openSettings();
  });
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      $("#query").focus();
    }
    if (event.key === "Escape") {
      if (!$("#engine-menu").hidden) {
        $("#engine-menu").hidden = true;
        $("#engine-toggle").setAttribute("aria-expanded", "false");
      } else if (!$("#settings-modal").hidden) {
        closeSettings();
      }
    }
  });
  bindDragAndDrop();
}

function bindDragAndDrop() {
  const editor = $("#shortcut-editor");
  editor.addEventListener("dragstart", (event) => {
    const row = event.target.closest(".shortcut-row");
    if (!row) return;
    row.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", row.dataset.index);
  });
  editor.addEventListener("dragend", (event) => event.target.closest(".shortcut-row")?.classList.remove("dragging"));
  editor.addEventListener("dragover", (event) => {
    if (event.target.closest(".shortcut-row")) event.preventDefault();
  });
  editor.addEventListener("drop", (event) => {
    event.preventDefault();
    const target = event.target.closest(".shortcut-row");
    if (!target) return;
    const sourceIndex = Number(event.dataTransfer.getData("text/plain"));
    const targetIndex = Number(target.dataset.index);
    if (sourceIndex === targetIndex || Number.isNaN(sourceIndex) || Number.isNaN(targetIndex)) return;
    const [moved] = state.draftShortcuts.splice(sourceIndex, 1);
    state.draftShortcuts.splice(targetIndex, 0, moved);
    renderEditor();
  });
  editor.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".row-delete");
    if (!deleteButton) return;
    const row = deleteButton.closest(".shortcut-row");
    state.draftShortcuts.splice(Number(row.dataset.index), 1);
    renderEditor();
  });
}

async function initialize() {
  const stored = await storageGet(["shortcuts", "engine", "customBackground", "backgroundBlur", "storageVersion"]);
  const shouldClearExistingShortcuts = stored.storageVersion !== STORAGE_VERSION;
  state.shortcuts = shouldClearExistingShortcuts ? [] : (Array.isArray(stored.shortcuts) ? stored.shortcuts : DEFAULT_SHORTCUTS.map((item) => ({ ...item })));
  state.engine = ENGINES[stored.engine] ? stored.engine : "google";
  state.customBackground = typeof stored.customBackground === "string" ? stored.customBackground : "";
  state.backgroundBlur = clampBackgroundBlur(stored.backgroundBlur);
  if (shouldClearExistingShortcuts) {
    await storageSet({ shortcuts: [], storageVersion: STORAGE_VERSION });
  }
  formatClock();
  window.setInterval(formatClock, 1000);
  renderDock();
  renderEngine();
  applyBackground(state.customBackground);
  applyBackgroundBlur(state.backgroundBlur);
  bindEvents();
}

initialize();
