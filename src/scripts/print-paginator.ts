import { flattenIngredients, flattenSteps } from "../lib/print";
import type { PrintPayload } from "../lib/print";

type Side = "left" | "right";

interface Sheet {
  root: HTMLDivElement;
  cols: HTMLElement;
  left: HTMLElement;
  right: HTMLElement;
  page: HTMLElement;
  seeded: Record<Side, boolean>;
}

interface LastBlock {
  node: HTMLElement;
  ul: HTMLUListElement | null;
}

const SHEET_WIDTH = 794;
const FOOT_RESERVE = 16;
const OVERFLOW_TOLERANCE = 2;
const COMPACT_PASSES = 10;
const MOVE_GUARD = 40;
const RESIZE_DELAY = 250;
const SETTLE_DELAY = 150;
const META_DELAY = 300;
const SETTINGS_KEY = "print-settings-v1";

interface PrintSettings {
  qr: boolean;
  cover: boolean;
  excerpt: boolean;
  checkboxes: boolean;
  url: boolean;
  metabar: boolean;
  conthead: boolean;
  narrow: boolean;
}

const DEFAULT_SETTINGS: PrintSettings = {
  qr: true,
  cover: true,
  excerpt: true,
  checkboxes: false,
  url: true,
  metabar: true,
  conthead: true,
  narrow: false,
};

function loadSettings(): PrintSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<PrintSettings>;
    return {
      qr: parsed.qr ?? DEFAULT_SETTINGS.qr,
      cover: parsed.cover ?? DEFAULT_SETTINGS.cover,
      excerpt: parsed.excerpt ?? DEFAULT_SETTINGS.excerpt,
      checkboxes: parsed.checkboxes ?? DEFAULT_SETTINGS.checkboxes,
      url: parsed.url ?? DEFAULT_SETTINGS.url,
      metabar: parsed.metabar ?? DEFAULT_SETTINGS.metabar,
      conthead: parsed.conthead ?? DEFAULT_SETTINGS.conthead,
      narrow: parsed.narrow ?? DEFAULT_SETTINGS.narrow,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

let settings = loadSettings();

function saveSettings(): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    return;
  }
}

/** Remove do topo da primeira folha os blocos desligados nas definições. */
function applySettingsToTop(body: HTMLElement): void {
  if (!settings.qr) body.querySelector(".qr")?.remove();
  if (!settings.cover) body.querySelector(".imgwrap")?.remove();
  if (!settings.excerpt) body.querySelector(".standfirst")?.remove();
  if (!settings.metabar) body.querySelector(".metabar")?.remove();
  body.querySelectorAll("[data-meta]").forEach((cell) => {
    const key = (cell as HTMLElement).dataset.meta ?? "";
    if (key && key in metaOverrides) {
      if (!metaOverrides[key].trim()) {
        cell.remove();
      } else {
        const val = cell.querySelector(".val");
        if (val) val.textContent = metaOverrides[key];
      }
    }
  });
  const total = body.querySelector("[data-total]");
  if (total && "totaltime" in metaOverrides) {
    if (!metaOverrides.totaltime.trim()) {
      total.remove();
    } else {
      total.textContent = metaOverrides.totaltime;
    }
  }
}

const META_KEY = "print-meta:" + window.location.pathname;

function loadMetaOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === "string") out[k] = v;
      }
      return out;
    }
  } catch {
    /* sem overrides guardados */
  }
  return {};
}

let metaOverrides = loadMetaOverrides();

function saveMetaOverrides(): void {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(metaOverrides));
  } catch {
    return;
  }
}

function syncMetaFieldsVisibility(): void {
  const box = document.getElementById("print-meta-fields");
  if (box) box.hidden = !settings.metabar;
}

function syncMetaUI(): void {
  document.querySelectorAll<HTMLInputElement>("input[data-meta-field]").forEach((input) => {
    const key = input.dataset.metaField ?? "";
    if (key && key in metaOverrides) input.value = metaOverrides[key];
  });
  syncMetaFieldsVisibility();
}

function bindMetaFields(): void {
  let metaTimer: ReturnType<typeof setTimeout> | null = null;
  document.querySelectorAll<HTMLInputElement>("input[data-meta-field]").forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.dataset.metaField ?? "";
      if (!key) return;
      metaOverrides[key] = input.value;
      saveMetaOverrides();
      if (metaTimer) clearTimeout(metaTimer);
      metaTimer = setTimeout(() => {
        try {
          paginate();
          lastKey = layoutKey();
        } catch {
          return;
        }
      }, META_DELAY);
    });
  });
}

const wrap = document.getElementById("sheets") as HTMLElement;
const dataEl = document.getElementById("recipe-data") as HTMLElement;
const topEl = document.getElementById("tpl-top") as HTMLTemplateElement;
const DATA = JSON.parse(dataEl.textContent ?? "") as PrintPayload;
const topHTML = topEl.innerHTML;
const fitBox = document.getElementById("fit") as HTMLElement | null;
const fitView = document.getElementById("fit-viewport") as HTMLElement | null;

let sheets: Sheet[] = [];
let cur: Record<Side, Sheet | null> = { left: null, right: null };

function esc(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[c] ?? c;
  });
}

function colOf(sheet: Sheet, side: Side): HTMLElement {
  return side === "left" ? sheet.left : sheet.right;
}

function colCapacity(sheet: Sheet): number {
  const foot = sheet.root.querySelector(".sfoot");
  const footH = foot instanceof HTMLElement ? foot.offsetHeight : 0;
  return sheet.root.clientHeight - sheet.cols.offsetTop - footH - FOOT_RESERVE;
}

function colOver(sheet: Sheet, side: Side): boolean {
  return colOf(sheet, side).scrollHeight > colCapacity(sheet) + OVERFLOW_TOLERANCE;
}

function blocks(col: Element): number {
  return col.querySelectorAll("li, .step, .grp").length;
}

function fromHTML(html: string): HTMLElement {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstChild as HTMLElement;
}

function secHead(title: string, continued: boolean): HTMLElement {
  return fromHTML(
    '<h2 class="sec"><span>' +
      esc(title) +
      "</span>" +
      (continued ? '<span class="cont"></span>' : "") +
      "</h2>",
  );
}

function newSheet(first: boolean): Sheet {
  const root = document.createElement("div");
  root.className = "sheet";
  const body = document.createElement("div");
  body.className = "sheet-body";
  if (first) {
    body.innerHTML = topHTML;
    applySettingsToTop(body);
  } else if (settings.conthead) {
    body.appendChild(
      fromHTML(
        '<div class="conthead"><span class="t">' +
          esc(DATA.title) +
          '</span><span class="c">(continuação)</span></div>',
      ),
    );
  }
  const cols = fromHTML(
    '<div class="cols"><aside class="col left"></aside><div class="col right"></div></div>',
  );
  body.appendChild(cols);
  root.appendChild(body);
  // O número real ("Pág. 1 de 2") só é conhecido no finish(); pré-preencher
  // com o mesmo calibre reserva a altura final do rodapé desde o início.
  // Sem isto, sem URL o rodapé media 28px a paginar e 49px no fim.
  const foot = fromHTML(
    '<div class="sfoot"><span>' +
      esc(DATA.shortUrl) +
      '</span><span class="spage">Pág. 0 de 0</span></div>',
  );
  root.appendChild(foot);
  wrap.appendChild(root);
  const sheet: Sheet = {
    root,
    cols,
    left: cols.children[0] as HTMLElement,
    right: cols.children[1] as HTMLElement,
    page: foot.querySelector(".spage") as HTMLElement,
    seeded: { left: false, right: false },
  };
  sheets.push(sheet);
  return sheet;
}

function seed(sheet: Sheet, side: Side): void {
  if (sheet.seeded[side]) return;
  sheet.seeded[side] = true;
  const first = sheets[0] === sheet;
  colOf(sheet, side).appendChild(secHead(side === "left" ? "Ingredientes" : "Preparação", !first));
}

function openUL(sheet: Sheet, side: Side): HTMLUListElement {
  const col = colOf(sheet, side);
  const last = col.lastElementChild;
  if (last && last.tagName === "UL") return last as HTMLUListElement;
  const ul = document.createElement("ul");
  ul.className = "check";
  col.appendChild(ul);
  return ul;
}

function pullOrphan(fromSheet: Sheet, side: Side, node: HTMLElement): void {
  const col = colOf(fromSheet, side);
  const last = col.lastElementChild;
  if (last && last.classList && last.classList.contains("grp")) {
    col.removeChild(last);
    const dest =
      node.tagName === "LI" ? (node.parentNode as HTMLElement) : colOf(cur[side] as Sheet, side);
    dest.parentNode?.insertBefore(last, dest);
  }
}

function place(side: Side, node: HTMLElement, isLi: boolean): HTMLElement {
  const start = (side === "left" ? cur.left : cur.right) as Sheet;
  const i0 = sheets.indexOf(start);
  for (let i = i0; i < sheets.length; i++) {
    const s = sheets[i];
    seed(s, side);
    const box: HTMLElement = isLi ? openUL(s, side) : colOf(s, side);
    box.appendChild(node);
    if (!colOver(s, side)) {
      if (side === "left") cur.left = s;
      else cur.right = s;
      if (isLi && s !== start) pullOrphan(start, side, node);
      return node;
    }
  }
  const ns = newSheet(false);
  seed(ns, side);
  if (isLi) openUL(ns, side).appendChild(node);
  else colOf(ns, side).appendChild(node);
  pullOrphan(start, side, node);
  if (side === "left") cur.left = ns;
  else cur.right = ns;
  if (colOver(ns, side) && blocks(colOf(ns, side)) <= 1) {
    ns.root.classList.add("flow");
  }
  return node;
}

function placeLi(side: Side, liHTML: string): void {
  place(side, fromHTML(liHTML), true);
}

function placeNode(side: Side, node: HTMLElement): void {
  place(side, node, false);
}

function lastBlock(sheet: Sheet, side: Side): LastBlock | null {
  const col = colOf(sheet, side);
  const last = col.lastElementChild as HTMLElement | null;
  if (!last || last.tagName === "H2") return null;
  if (last.tagName === "UL") {
    const li = last.lastElementChild as HTMLElement | null;
    return li ? { node: li, ul: last as HTMLUListElement } : null;
  }
  return { node: last, ul: null };
}

function moveBack(i: number, side: Side): boolean {
  const s = sheets[i];
  const b = lastBlock(s, side);
  if (!b) return false;
  let ns = sheets[i + 1];
  if (!ns) ns = newSheet(false);
  seed(ns, side);
  const col = colOf(ns, side);
  const head = col.querySelector("h2.sec");
  if (b.ul) {
    let ul = col.querySelector("ul.check");
    if (!ul) {
      ul = document.createElement("ul");
      ul.className = "check";
      if (head) head.after(ul);
      else col.prepend(ul);
    }
    ul.insertBefore(b.node, ul.firstChild);
    if (!b.ul.hasChildNodes()) b.ul.parentNode?.removeChild(b.ul);
  } else if (head) head.after(b.node);
  else col.prepend(b.node);
  const oldCol = colOf(s, side);
  const plast = oldCol.lastElementChild;
  if (plast && plast.classList && plast.classList.contains("grp")) {
    oldCol.removeChild(plast);
    const ref = col.querySelector("h2.sec");
    if (ref) ref.after(plast);
    else col.prepend(plast);
  }
  return true;
}

function compact(): void {
  for (let pass = 0; pass < COMPACT_PASSES; pass++) {
    let moved = false;
    for (let i = 0; i < sheets.length; i++) {
      const s = sheets[i];
      if (s.root.classList.contains("flow")) continue;
      if (blocks(s.left) + blocks(s.right) <= 1 && (colOver(s, "left") || colOver(s, "right"))) {
        s.root.classList.add("flow");
        continue;
      }
      let guard = 0;
      while ((colOver(s, "left") || colOver(s, "right")) && guard++ < MOVE_GUARD) {
        const side: Side = colOver(s, "left") ? "left" : "right";
        if (!moveBack(i, side)) break;
        moved = true;
      }
    }
    if (!moved) break;
  }
}

function fit(): void {
  if (!fitBox || !fitView) return;
  const avail = fitView.clientWidth;
  const s = avail >= SHEET_WIDTH ? 1 : avail / SHEET_WIDTH;
  if (s >= 1) {
    fitBox.style.transform = "";
    fitBox.style.height = "";
    fitView.style.height = "";
    return;
  }
  fitBox.style.transform = "scale(" + s + ")";
  fitBox.style.height = "auto";
  fitView.style.height = fitBox.scrollHeight * s + "px";
}

function finish(): void {
  wrap.querySelectorAll("ul.check").forEach((ul) => {
    if (!ul.hasChildNodes()) ul.parentNode?.removeChild(ul);
  });
  sheets.forEach((s) => {
    (["left", "right"] as Side[]).forEach((side) => {
      const col = colOf(s, side);
      const h = col.querySelector("h2.sec");
      if (h && blocks(col) === 0) h.parentNode?.removeChild(h);
    });
  });
  for (let i = sheets.length - 1; i >= 0; i--) {
    const s = sheets[i];
    const hasL = !!s.left.querySelector("li, .step, .grp");
    const hasR = !!s.right.querySelector("li, .step, .grp");
    if (i > 0 && !hasL && !hasR) {
      wrap.removeChild(s.root);
      sheets.splice(i, 1);
    }
  }
  sheets.forEach((s, i) => {
    s.page.textContent = "Pág. " + (i + 1) + " de " + sheets.length;
  });
  wrap.setAttribute("aria-busy", "false");
}

function paginate(): void {
  wrap.innerHTML = "";
  wrap.classList.toggle("no-check", !settings.checkboxes);
  wrap.classList.toggle("no-url", !settings.url);
  wrap.classList.toggle("narrow", settings.narrow);
  sheets = [];
  newSheet(true);
  cur.left = sheets[0];
  cur.right = sheets[0];
  const iblocks = flattenIngredients(DATA.ingredients);
  const sblocks = flattenSteps(DATA.directions);
  let ii = 0;
  let si = 0;
  while (ii < iblocks.length || si < sblocks.length) {
    if (ii < iblocks.length) {
      const b = iblocks[ii++];
      if (b.kind === "group") {
        const g = document.createElement("div");
        g.className = "grp";
        g.textContent = b.text;
        placeNode("left", g);
      } else {
        placeLi("left", '<li><span class="box"></span><span>' + esc(b.text) + "</span></li>");
      }
    }
    if (si < sblocks.length) {
      const sb = sblocks[si++];
      const d = document.createElement("div");
      d.className = "step";
      const head = sb.head ? "<h4>" + esc(sb.head) + "</h4>" : "";
      d.innerHTML =
        '<div class="num">' +
        String(sb.n).padStart(2, "0") +
        "</div><div>" +
        head +
        "<p>" +
        esc(sb.text) +
        "</p></div>";
      placeNode("right", d);
    }
  }
  compact();
  finish();
  fit();
}

function layoutKey(): string {
  return (
    window.innerWidth +
    "x" +
    (document.fonts && document.fonts.status ? document.fonts.status : "noapi")
  );
}

function bindPrint(): void {
  const action = document.getElementById("print-action");
  if (action) {
    action.addEventListener("click", () => {
      window.print();
    });
  }
  const mobileAction = document.getElementById("print-action-mobile");
  if (mobileAction) {
    mobileAction.addEventListener("click", () => {
      window.print();
    });
  }
}

function syncSettingsUI(): void {
  document.querySelectorAll<HTMLInputElement>("input[data-setting]").forEach((input) => {
    const key = input.dataset.setting as keyof PrintSettings;
    if (key in settings) input.checked = settings[key];
  });
}

function bindSettings(): void {
  document.querySelectorAll<HTMLInputElement>("input[data-setting]").forEach((input) => {
    input.addEventListener("change", () => {
      const key = input.dataset.setting as keyof PrintSettings;
      if (!(key in settings)) return;
      settings[key] = input.checked;
      saveSettings();
      syncMetaFieldsVisibility();
      try {
        paginate();
        lastKey = layoutKey();
      } catch {
        return;
      }
    });
  });
  const reset = document.getElementById("print-settings-reset");
  if (reset) {
    reset.addEventListener("click", () => {
      settings = { ...DEFAULT_SETTINGS };
      metaOverrides = {};
      saveSettings();
      saveMetaOverrides();
      syncSettingsUI();
      document.querySelectorAll<HTMLInputElement>("input[data-meta-field]").forEach((input) => {
        input.value = input.dataset.default ?? "";
      });
      syncMetaFieldsVisibility();
      try {
        paginate();
        lastKey = layoutKey();
      } catch {
        return;
      }
    });
  }
}

let lastKey = "";

/** Drawer de definições sobre a página, como a navbar (sem repaginar). */
function isSettingsOpen(): boolean {
  return document.documentElement.classList.contains("has-print-settings-open");
}

function setSettingsOpen(open: boolean, focusPanel = false): void {
  document.documentElement.classList.toggle("has-print-settings-open", open);
  const menuBtn = document.getElementById("print-settings-fab");
  if (menuBtn instanceof HTMLButtonElement) {
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Fechar configurações" : "Abrir configurações");
  }
  if (open && focusPanel) {
    const closeBtn = document.getElementById("print-settings-close");
    if (closeBtn instanceof HTMLButtonElement) closeBtn.focus();
    else document.getElementById("print-settings-panel")?.focus();
  }
}

function bindSidebar(): void {
  const menuBtn = document.getElementById("print-settings-fab");
  const mobilePrintBtn = document.getElementById("print-action-mobile");
  const closeBtn = document.getElementById("print-settings-close");
  const scrim = document.getElementById("print-scrim");
  if (menuBtn instanceof HTMLButtonElement) {
    menuBtn.hidden = false;
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.addEventListener("click", () => {
      const nextOpen = !isSettingsOpen();
      setSettingsOpen(nextOpen, nextOpen);
      if (!nextOpen) menuBtn.focus();
    });
  }
  if (mobilePrintBtn instanceof HTMLButtonElement) {
    mobilePrintBtn.hidden = false;
  }
  if (closeBtn instanceof HTMLButtonElement) {
    closeBtn.hidden = false;
    closeBtn.addEventListener("click", () => {
      setSettingsOpen(false);
      if (menuBtn instanceof HTMLButtonElement) menuBtn.focus();
    });
  }
  scrim?.addEventListener("click", () => {
    setSettingsOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !isSettingsOpen()) return;
    setSettingsOpen(false);
    if (menuBtn instanceof HTMLButtonElement) menuBtn.focus();
  });
  // O drawer só existe sem espaço (<=960px): ao alargar para desktop a
  // lateral volta a ser fixa e o estado de drawer fecha-se sozinho.
  try {
    const wide = window.matchMedia("(min-width: 961px)");
    const closeOnWide = (event: MediaQueryListEvent | MediaQueryList): void => {
      if (event.matches && isSettingsOpen()) setSettingsOpen(false);
    };
    if (wide.addEventListener) wide.addEventListener("change", closeOnWide);
    else wide.addListener(closeOnWide);
  } catch {
    return;
  }
}

setSettingsOpen(false);
try {
  paginate();
  lastKey = layoutKey();
} catch {
  wrap.innerHTML = "";
  sheets = [];
  const fallback = newSheet(true);
  fallback.root.classList.add("flow");
  fallback.left.innerHTML = "<p>Ver receita original.</p>";
}
bindPrint();
bindSettings();
bindSidebar();
bindMetaFields();
syncSettingsUI();
syncMetaUI();

// A primeira paginação corre ainda com fontes de fallback (métricas maiores
// e menos blocos por coluna). O `fonts.ready` pode já ter disparado antes de
// as fontes Web chegarem, por isso voltamos a paginar de forma debounced
// sempre que assentarem recursos tardios (fontes, imagens).
let settleTimer: ReturnType<typeof setTimeout> | null = null;
function repaginateSoon(): void {
  if (settleTimer) clearTimeout(settleTimer);
  settleTimer = setTimeout(() => {
    try {
      paginate();
      lastKey = layoutKey();
    } catch {
      return;
    }
  }, SETTLE_DELAY);
}
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    repaginateSoon();
  });
  try {
    document.fonts.addEventListener("loadingdone", () => {
      repaginateSoon();
    });
  } catch {
    /* sem suporte a loadingdone: fica o fonts.ready + load */
  }
}
window.addEventListener("load", () => {
  repaginateSoon();
});
let resizeTimer: ReturnType<typeof setTimeout> | null = null;
window.addEventListener("resize", () => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    try {
      paginate();
      lastKey = layoutKey();
    } catch {
      return;
    }
  }, RESIZE_DELAY);
});
window.addEventListener("beforeprint", () => {
  try {
    if (layoutKey() !== lastKey) {
      paginate();
      lastKey = layoutKey();
    }
  } catch {
    return;
  }
});
