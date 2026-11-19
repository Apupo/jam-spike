# Jam Recording Links – spike

Testovacie stránky na overenie, či sa dá Jam zapojiť do RIA editora, ktorý
Nextcloud vkladá ako cross-origin iframe.

- `editor.html` – simulácia editora: npm SDK `@jam.dev/recording-links` 0.4.0
  (lazy loading), sanitizery, tlačidlo „Nahlásiť chybu", CSP ako v editore
  plus hosty Jamu.
- `editor-nocsp.html` – to isté bez CSP (na porovnanie, či niečo blokuje CSP).
- `editor-tags.html` – záložný variant so statickými HTML tagmi.
- `host.html` – simulácia Nextcloudu. Spúšťa sa **lokálne**, aby bol editor
  v cross-origin iframe.

Adresa: https://apupo.github.io/jam-spike/

## Rozdiel oproti produkcii

V produkcii sú editor (`rita.alistiq.com`) aj Nextcloud (`ria.alistiq.com`)
pod `alistiq.com`, teda rovnaký site. V teste sú `localhost` a `github.io`
rôzne sites, čo je pre prehliadač prísnejšie (oddelené úložisko a cookies).
Čo funguje tu, bude fungovať aj v produkcii. Ak niečo zlyhá na úložisku,
treba to zopakovať na dvoch subdoménach `alistiq.com`.

## Príprava

1. Jam účet a workspace. Team ID: Settings → Jam SDK.
2. Recording Link v dashboarde (`jam.dev/s/recording-links`), z neho ID.
3. Doplniť `JAM_TEAM_ID` a `JAM_RECORDING_ID` do `config.js` a Team ID do
   `editor-tags.html` (`__JAM_TEAM_ID__`), nasadiť.
4. Lokálne spustiť host: `python3 -m http.server 8787 --bind 127.0.0.1`
   v priečinku repozitára, otvoriť http://localhost:8787/host.html.

## Testy

| # | Test | Postup | Očakávanie |
|---|---|---|---|
| T1 | Overenie domény so SDK | Jam → Settings → Jam SDK → Verify domain → `apupo.github.io/jam-spike/editor.html` | „Domain successfully verified" |
| T1b | Overenie so statickými tagmi | len ak T1 zlyhá: overiť `apupo.github.io/jam-spike/editor-tags.html` | „Domain successfully verified" |
| T2 | Recording Link bez iframe | otvoriť Recording Link z Jamu (mal by smerovať na overenú stránku s `?jam-recording=`) | recorder sa otvorí, nahrávka obsahuje logy |
| T3 | Recorder v iframe, Chrome | host.html, `allow` zapnuté, „SDK + CSP editora" → Nahlásiť chybu → zdieľať kartu „Nextcloud host" + mikrofón → klikať tlačidlá aktivity → nahovoriť pár viet → odoslať | nahrávka s videom, hlasom a logmi editora |
| T4 | Recorder v iframe bez `allow` | ako T3, `allow` vypnuté → Načítať iframe | očakávame, že zdieľanie obrazovky zlyhá |
| T5 | Variant s odkazom | http://localhost:8787/host.html?jam-recording=ehZhhj3&jam-mic-enabled=enabled&jam-reference=spike-doc-1 | recorder sa v iframe otvorí sám |
| T6 | Safari | zopakovať T3 v Safari | ako T3 |
| T7 | CSP | pri T3 sledovať panel logov v editore (červené riadky „CSP blokuje…"), porovnať s „SDK bez CSP" | žiadne CSP blokovanie, inak zapísať hosty |
| T8 | Dve karty (záložný variant) | len ak T3 zlyhá: Recording Link v karte 1, host.html v karte 2, pracovať v karte 2 | v teste pravdepodobne zlyhá kvôli rôznym sites, nie je smerodajné |

## Čo skontrolovať v nahrávke v Jame (T3, T5, T6)

- [ ] video zachytáva celú kartu vrátane „Nextcloud" lišty
- [ ] hlas testera je v nahrávke
- [ ] konzola: `[spike] heartbeat` z editora áno, `[host] heartbeat` z hostu nie
- [ ] konzola: e-mail `tester@example.com` je nahradený `[email]`
- [ ] konzola: nezachytená výnimka je zaznamenaná
- [ ] sieť: `data.json` aj s telom odpovede
- [ ] sieť: `api/secret.json` bez tela odpovede (sanitizer)
- [ ] sieť: 404 na `neexistuje.json`
- [ ] WebSocket: je `?token=SPIKE-JWT-…` v URL zredigovaný?
- [ ] pole s heslom je rozmazané
- [ ] pri nahrávke je referencia `spike-doc-1`

## Výsledky

| # | Chrome | Safari | Poznámka |
|---|---|---|---|
| T1 | | – | |
| T1b | | – | |
| T2 | | | |
| T3 | | – | |
| T4 | | – | |
| T5 | | | |
| T6 | – | | |
| T7 | | | |
| T8 | | | |
