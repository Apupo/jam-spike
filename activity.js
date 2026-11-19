// Generuje aktivitu, ktorú má Jam Capture zachytiť: konzolu, fetch, WebSocket, chyby.
// Zdieľané stránkami editor*.html.

const panel = () => document.getElementById("log");

export function show(msg, kind = "info") {
  const li = document.createElement("li");
  li.className = kind;
  li.textContent = `${new Date().toLocaleTimeString()}  ${msg}`;
  panel()?.prepend(li);
}

function context() {
  const embedded = window.self !== window.top;
  return [
    `origin: ${location.origin}`,
    `v iframe: ${embedded ? "áno" : "nie"}`,
    `query: ${location.search || "(žiadne)"}`,
    `getDisplayMedia: ${navigator.mediaDevices?.getDisplayMedia ? "k dispozícii" : "nie je"}`,
  ].join("  |  ");
}

let ws = null;
let beat = 0;

const actions = {
  "console": () => {
    console.log("[spike] bežný log", { doc: "spike-doc-1", n: beat });
    console.warn("[spike] varovanie");
    console.error("[spike] chyba v konzole");
    console.log("[spike] e-mail na sanitizer: tester@example.com");
    show("console.log / warn / error odoslané");
  },
  "fetch-ok": async () => {
    const r = await fetch("./data.json?from=spike");
    show(`fetch data.json → ${r.status} (telo má byť v Jame viditeľné)`);
  },
  "fetch-api": async () => {
    const r = await fetch("./api/secret.json", { headers: { "x-ria-test": "1" } });
    show(`fetch api/secret.json → ${r.status} (telo má sanitizer zahodiť)`);
  },
  "fetch-404": async () => {
    const r = await fetch("./neexistuje.json");
    show(`fetch neexistuje.json → ${r.status}`, "warn");
  },
  "ws": () => {
    ws?.close();
    // Simuluje Yjs WebSocket editora s JWT v URL (Editor.tsx:176).
    ws = new WebSocket("wss://echo.websocket.org/?token=SPIKE-JWT-abc.def.ghi");
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "spike", text: "ahoj" }));
      show("WebSocket otvorený, správa odoslaná (URL obsahuje ?token=)");
    };
    ws.onmessage = (e) => console.log("[spike] ws prijaté", String(e.data).slice(0, 80));
    ws.onerror = () => show("WebSocket chyba (echo server nedostupný alebo CSP)", "error");
  },
  "throw": () => {
    setTimeout(() => {
      throw new Error("[spike] nezachytená výnimka");
    });
    show("nezachytená výnimka vyhodená", "warn");
  },
};

export function setupActivity() {
  document.getElementById("context").textContent = context();

  for (const [name, fn] of Object.entries(actions)) {
    document.querySelector(`[data-action="${name}"]`)?.addEventListener("click", () => {
      Promise.resolve(fn()).catch((e) => show(`${name}: ${e.message}`, "error"));
    });
  }

  // CSP porušenia ukázať priamo na stránke, aby sme videli, ktoré hosty Jam potrebuje.
  document.addEventListener("securitypolicyviolation", (e) => {
    show(`CSP blokuje ${e.effectiveDirective}: ${e.blockedURI}`, "error");
  });

  // Simulácia JWT handshake z Nextcloudu (parentBridge.ts).
  window.addEventListener("message", (e) => {
    if (e.data?.type === "ria-token") {
      console.log(`[auth] token received (len: ${String(e.data.token).length})`);
      show(`ria-token prijatý z ${e.origin}`);
    }
  });

  setInterval(() => {
    beat += 1;
    console.log(`[spike] heartbeat ${beat}`);
  }, 5000);
}
