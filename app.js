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

reportBtn.addEventListener("click", async () => {
  if (!JAM_RECORDING_ID) {
    show("JAM_RECORDING_ID v config.js nie je vyplnené", "warn");
    return;
  }
  try {
    const recorder = await jam.loadRecorder();
    recorder.open(JAM_RECORDING_ID, {
      jamParams: {
        "jam-mic-enabled": "enabled",
        "jam-reference": DOC_ID,
      },
    });
    show("Recorder otvorený cez tlačidlo", "ok");
  } catch (e) {
    show(`Recorder sa neotvoril: ${e.message}`, "error");
  }
});
