// Zapojenie Jamu tak, ako ho navrhujeme pre editor (src/lib/jam.ts):
// npm SDK s lazy loadingom, sanitizer, tlačidlo „Nahlásiť chybu".
import * as jam from "./vendor/jam-sdk-0.4.0.js";
import { JAM_TEAM_ID, JAM_RECORDING_ID, DOC_ID } from "./config.js";
import { setupActivity, show } from "./activity.js";

setupActivity();

jam.addEventListener("loaded", (e) => show(`Jam skript načítaný: ${e.detail.name}.js`, "ok"));

const reportBtn = document.getElementById("report");

if (!JAM_TEAM_ID) {
  show("JAM_TEAM_ID v config.js nie je vyplnené, Jam je vypnutý", "warn");
  reportBtn.disabled = true;
} else {
  jam.initialize({
    teamId: JAM_TEAM_ID,
    network: {
      // Rovnaké pravidlo ako v návrhu: telá odpovedí /api/ sa do Jamu neposielajú.
      responseSanitizer: (response) => {
        if (response.url.includes("/api/")) response.body = undefined;
        return response;
      },
    },
    console: {
      logSanitizer: (log) => {
        log.args = log.args.map((a) =>
          typeof a === "string" ? a.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]") : a,
        );
        return log;
      },
    },
  });
  show(`Jam SDK inicializované (team ${JAM_TEAM_ID})`, "ok");
  if (new URLSearchParams(location.search).has("jam-recording")) {
    show("URL obsahuje jam-recording, SDK otvára recorder samo");
  }
}

// Možnosť B z návrhu: recorder sa otvára v novej karte na doméne editora,
// tester pracuje ďalej v karte s Nextcloudom (capture v iframe sa zapne sám).
reportBtn.addEventListener("click", () => {
  if (!JAM_RECORDING_ID) {
    show("JAM_RECORDING_ID v config.js nie je vyplnené", "warn");
    return;
  }
  const url = new URL("./editor.html", location.href);
  url.searchParams.set("jam-recording", JAM_RECORDING_ID);
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox"
    : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "?";
  url.searchParams.set("jam-title", `Nahlásenie z tlačidla (${browser})`);
  url.searchParams.set("jam-reference", DOC_ID);
  url.searchParams.set("jam-mic-enabled", "enabled");
  window.open(url, "_blank", "noopener");
  show("Recorder otvorený v novej karte", "ok");
});
