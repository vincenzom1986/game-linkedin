# Game-LinkedIn — Design

**Data:** 2026-06-21
**Stato:** Approvato dall'utente; pronto per l'implementazione
**Autore:** Emiliano Narducci (con Claude Code)

## 1. Obiettivo e contesto

Un gioco 2D in stile *Zelda* (vista dall'alto, top-down) che racconta il percorso di
carriera dell'utente, pensato come **pezzo di portfolio pubblicabile**: un link
condivisibile su LinkedIn o sul CV che recruiter e contatti possono giocare nel browser,
sia da desktop sia da mobile.

Il progetto vive in `~/AppAI/Game-LinkedIn`, in linea con gli altri progetti web della
cartella `AppAI` (Vite/TypeScript/Node).

### Criteri di successo
- Si apre e si gioca nel browser senza installazioni, da desktop e da mobile.
- In ~2 minuti un visitatore capisce chi è l'utente e il suo percorso.
- Aspetto curato (estetica 16-bit "Zelda-like") e nessun problema di licenza.
- I contenuti di carriera sono aggiornabili modificando un solo file dati, senza toccare
  il codice di gioco.

## 2. Decisioni chiave (dal brainstorming)

| Tema | Decisione |
|------|-----------|
| Obiettivo | Portfolio pubblicabile e condivisibile |
| Genere | Esplorazione top-down stile Zelda |
| Contenuti | File dati modificabile (`src/data/career.ts`), separato dal codice |
| Stack | Phaser 3 + Vite + TypeScript; mappe in Tiled |
| Grafica | Asset **CC0** in stile 16-bit che evocano Zelda (no asset Nintendo) |
| Sedi reali | La mappa riproduce gli **edifici** di scuole/università/aziende; avvicinandosi alla porta si apre un **pannello info** (ruolo, periodo, cosa fai/facevi lì). Niente interni esplorabili in V1 |

> **Nota legale:** gli sprite e le musiche originali di *The Legend of Zelda* sono di
> Nintendo e non possono essere pubblicati. Usiamo asset CC0/liberi (es. Sprout Lands,
> pacchetti RPG top-down) scelti per evocare quello stile.

## 3. Esperienza di gioco

Il giocatore controlla un avatar (l'utente) in un mondo dall'alto e:
- si muove con frecce/WASD su desktop e con un **joystick touch** su mobile;
- **parla con gli NPC** (Spazio / tap) che raccontano ruoli e aneddoti;
- **legge oggetti interattivi** (computer, libri, trofei) che rivelano progetti e skill;
- **raccoglie "orb di competenza"**, con una barra "competenze raccolte / totali";
- si avvicina alle **sedi reali** (scuole/università/aziende): alla porta si apre un
  pannello con nome della sede, ruolo, periodo e cosa fa/faceva lì (più progetti e skill);
- consulta un **diario / quest log** che si riempie man mano — di fatto il CV che si
  compone giocando.

**Obiettivo del giocatore:** esplorare le zone, scoprire i contenuti, raggiungere l'area finale **"Presente / Contatti"** con i link (LinkedIn, email,
download CV).

## 4. Struttura del mondo

Un unico mondo connesso e percorribile a piedi, organizzato attorno alle **sedi reali**
dove l'utente ha studiato e lavorato. Ogni sede è un **edificio** sulla mappa (scuola,
università, azienda…). Gli edifici sono disposti lungo un percorso che segue grosso modo
la **cronologia**, raggruppati in due grandi zone visive — un **quartiere "Studi"** e un
**quartiere "Lavoro"** — pur restando liberamente esplorabili. Una terza area finale,
**"Presente / Contatti"**, chiude il percorso con i link.

**Interazione con una sede:** avvicinandosi alla porta compare il prompt "premi per info";
all'azione si apre un **pannello info** con: nome della sede, ruolo/titolo, periodo, cosa
fai/facevi lì, progetti principali e skill associate. Nei pressi degli edifici possono
esserci NPC (colleghi/mentori) e oggetti leggibili che aggiungono aneddoti e fanno
raccogliere gli "orb di competenza".

> V1 implementa un sottoinsieme di sedi (≈3–5 edifici significativi); la struttura
> supporta l'aggiunta delle altre semplicemente aggiungendo voci al file dati e segnaposto
> nella mappa Tiled.

## 5. Architettura tecnica

**Stack:** Phaser 3, Vite, TypeScript. Mappe disegnate con **Tiled** (export JSON).

Scene Phaser a responsabilità singola:
- `BootScene` — config iniziale, avvio del preload.
- `PreloadScene` — carica spritesheet, tileset e tilemap, barra di caricamento.
- `WorldScene` — costruisce la tilemap, gestisce player, NPC, collisioni, camera,
  rilevamento delle interazioni (trigger di prossimità).
- `UIScene` — eseguita **in parallelo** a `WorldScene`: HUD (barra skill), riquadri di
  dialogo, pannelli info degli oggetti, diario/quest log, schermata contatti.
- `InteriorScene` — stanze/"dungeon" per approfondimenti (**fuori V1**, predisposizione
  architetturale prevista).

**Dati ↔ mondo:** la geometria, le collisioni e i punti di spawn vengono da Tiled. Un
*object layer* contiene entità (location/building, npc, object, skill, spawn, zone-label) con una
proprietà `refId` che fa da chiave verso il file dati. `WorldScene` legge gli oggetti
Tiled, risolve i `refId` su `career.ts` e istanzia le entità con i testi corretti. Così
**geometria** (Tiled) e **contenuti** (career.ts) restano disaccoppiati.

### Moduli/file principali (indicativo)
```
src/
  main.ts                # bootstrap Phaser
  scenes/
    BootScene.ts
    PreloadScene.ts
    WorldScene.ts
    UIScene.ts
  entities/
    Player.ts
    LocationBuilding.ts  # edificio = sede reale, apre il pannello info all'ingresso
    Npc.ts
    InteractiveObject.ts
    SkillOrb.ts
  systems/
    InteractionSystem.ts # prossimità + prompt "premi per interagire"
    DialogueSystem.ts    # coda righe di dialogo
    JournalState.ts      # stato diario + skill raccolte (logica pura, testabile)
  data/
    career.ts            # CONTENUTI (vedi sez. 6)
    types.ts             # tipi del modello dati
  ui/
    DialogueBox.ts
    InfoPanel.ts
    Journal.ts
    HUD.ts
    TouchControls.ts     # joystick + tasto azione su mobile
public/
  assets/                # tileset, spritesheet (CC0)
  maps/                  # tilemap esportate da Tiled
```

## 6. Modello dati (file contenuti)

File tipizzato `src/data/career.ts`, separato dal codice di gioco. Forma indicativa
(i tipi vivono in `src/data/types.ts`):

```ts
interface CareerData {
  player: { name: string; sprite: string }
  locations: Location[]   // sedi reali = edifici sulla mappa
  contact: Contact
}

// Una sede reale dove l'utente ha studiato o lavorato.
interface Location {
  id: string
  name: string          // es. "Università di X", "Azienda Y"
  kind: 'education' | 'work'
  building: string       // sprite/tipo di edificio
  period: string        // es. "2016–2019"
  role?: string         // ruolo/titolo ricoperto
  summary: string       // pannello info: cosa fai/facevi lì
  projects?: InfoEntry[] // progetti principali svolti nella sede
  skills?: Skill[]      // skill (orb) ottenibili qui
  npcs?: Npc[]          // NPC nei pressi (colleghi/mentori), opzionale
  objects?: InteractiveObject[] // oggetti leggibili nei pressi, opzionale
}

interface InfoEntry { label: string; body: string }
interface Npc { id: string; name: string; sprite: string; lines: string[] }
interface InteractiveObject {
  id: string
  label: string
  type: 'project' | 'role' | 'education' | 'achievement' | 'note'
  body: string          // testo mostrato nel pannello info
}
interface Skill { id: string; name: string; icon?: string }
interface Contact { linkedin: string; email: string; cvUrl?: string }
```

**Flusso contenuti:** l'utente fornisce **una volta** il CV / estratto LinkedIn; Claude lo
trasforma in `career.ts`. Aggiornamenti futuri = modifica del solo `career.ts`.

> Input richiesto dall'utente prima/durante l'implementazione: testo del CV o estratto
> LinkedIn, link LinkedIn, email pubblica, eventuale URL del CV in PDF.

## 7. Grafica e stile

- Asset CC0 in stile top-down 16-bit (overworld + elementi interni), palette e tema
  "Zelda-like".
- Personaggio con animazioni a 4 direzioni; NPC visivamente distinti.
- Tile per prato, sentiero, acqua, alberi, edifici, cartelli.
- Le sorgenti asset e relative licenze vengono annotate in `public/assets/CREDITS.md`.

## 8. Controlli

- **Desktop:** frecce/WASD per muoversi; Spazio/Invio per interagire; Esc/tab per il diario.
- **Mobile:** joystick virtuale a sinistra, tasto azione a destra; il diario apribile da
  un'icona dell'HUD. Layout responsive che si adatta a viewport verticali e orizzontali.

## 9. Scope

### V1 (in scope)
- Overworld con **≈3–5 sedi reali** (edifici) connesse da sentieri, movimento e collisioni.
- **Pannello info all'ingresso** di ogni sede: nome, ruolo, periodo, attività, progetti, skill.
- NPC con dialoghi a più righe; oggetti leggibili con pannello info.
- Raccolta skill con barra di progresso.
- Diario/quest log che si popola con le scoperte.
- Area finale **Contatti** con link LinkedIn/email/CV.
- **Controlli touch** per mobile; layout responsive.
- Build statica pubblicabile.

### Fuori V1 (possibile V2)
- Interni/dungeon (`InteriorScene`), combattimento/nemici, audio/musica.
- Mini-giochi, salvataggio progressi (localStorage), animazioni elaborate,
  multilingua (IT/EN).

## 10. Testing e verifica

- **Logica pura testata con Vitest:** caricamento/validazione di `career.ts`, stato del
  diario, progressione delle skill, risoluzione `refId` Tiled → dati.
- **Rendering/feel:** verificati giocando (avvio dev server, percorrere il mondo, entrare
  nel pannello info di una sede, interazione NPC/oggetto, raccolta skill, apertura diario,
  controlli touch in emulazione mobile).
- Smoke test di build (`vite build`) prima della pubblicazione.

## 11. Pubblicazione

Build statica Vite pubblicabile su Netlify / Vercel / GitHub Pages, con un link
condivisibile da inserire su LinkedIn e CV. Nessun backend richiesto.

## 12. Rischi e mitigazioni

| Rischio | Mitigazione |
|---------|-------------|
| Uso accidentale di asset coperti da copyright | Solo asset CC0/licenza libera, tracciati in `CREDITS.md` |
| Performance/controlli su mobile | Touch controls e responsive come requisito V1, testati in emulazione |
| Scope creep (combattimento, audio, dungeon…) | Confinati esplicitamente a V2 |
| Cronologia poco leggibile (genere esplorativo) | Sentieri che guidano il percorso + `period` per sede + quartieri Studi/Lavoro + diario |
| Contenuti CV mancanti all'avvio | Si parte con dati placeholder; l'utente fornisce il CV per popolare `career.ts` |

## 13. Prossimi passi

1. Review dell'utente di questo documento.
2. Stesura del piano di implementazione (skill `writing-plans`).
3. Implementazione incrementale partendo dallo scaffolding Vite + Phaser e da una prima
   sede giocabile con il suo pannello info.
