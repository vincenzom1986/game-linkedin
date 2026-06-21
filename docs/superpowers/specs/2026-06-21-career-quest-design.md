# Career Quest — Design

**Data:** 2026-06-21
**Stato:** Approvato (in attesa di review finale dell'utente)
**Autore:** Emiliano Narducci (con Claude Code)

## 1. Obiettivo e contesto

Un gioco 2D in stile *Zelda* (vista dall'alto, top-down) che racconta il percorso di
carriera dell'utente, pensato come **pezzo di portfolio pubblicabile**: un link
condivisibile su LinkedIn o sul CV che recruiter e contatti possono giocare nel browser,
sia da desktop sia da mobile.

Il progetto vive in `~/AppAI/career-quest`, in linea con gli altri progetti web della
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

> **Nota legale:** gli sprite e le musiche originali di *The Legend of Zelda* sono di
> Nintendo e non possono essere pubblicati. Usiamo asset CC0/liberi (es. Sprout Lands,
> pacchetti RPG top-down) scelti per evocare quello stile.

## 3. Esperienza di gioco

Il giocatore controlla un avatar (l'utente) in un mondo dall'alto e:
- si muove con frecce/WASD su desktop e con un **joystick touch** su mobile;
- **parla con gli NPC** (Spazio / tap) che raccontano ruoli e aneddoti;
- **legge oggetti interattivi** (computer, libri, trofei) che rivelano progetti e skill;
- **raccoglie "orb di competenza"**, con una barra "competenze raccolte / totali";
- consulta un **diario / quest log** che si riempie man mano — di fatto il CV che si
  compone giocando.

**Obiettivo del giocatore:** esplorare le zone, scoprire i contenuti, raccogliere le skill
e raggiungere l'area finale **"Presente / Contatti"** con i link (LinkedIn, email,
download CV).

## 4. Struttura del mondo

Un unico mondo connesso, diviso in **regioni tematiche**, ciascuna = un capitolo della
carriera, collegate da sentieri così che il percorso "naturale" segua grosso modo la
cronologia pur restando liberamente esplorabile:

1. **Formazione / Studi**
2. **Prime esperienze**
3. **Aziende & Ruoli**
4. **Competenze**
5. **Progetti**
6. **Presente / Obiettivi & Contatti** (area finale)

In ogni regione: un cartello introduce il capitolo; gli NPC raccontano; gli oggetti
rivelano progetti/skill; alcuni "orb" sono da raccogliere.

> V1 implementa 3–4 regioni; la struttura supporta da subito l'aggiunta delle altre via
> dati + mappa.

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
*object layer* contiene entità (npc, object, skill, spawn, region-trigger) con una
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
  regions: Region[]
  contact: Contact
}

interface Region {
  id: string
  title: string
  year?: string         // etichetta cronologica (es. "2012–2016")
  intro: string         // testo del cartello d'ingresso
  npcs: Npc[]
  objects: InteractiveObject[]
  skills: Skill[]
}

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
- Overworld con **3–4 regioni** connesse, movimento e collisioni.
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
- **Rendering/feel:** verificati giocando (avvio dev server, percorrere una regione,
  interazione NPC/oggetto, raccolta skill, apertura diario, controlli touch in emulazione
  mobile).
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
| Cronologia poco leggibile (genere esplorativo) | Sentieri che guidano il percorso + etichette `year` per regione + diario |
| Contenuti CV mancanti all'avvio | Si parte con dati placeholder; l'utente fornisce il CV per popolare `career.ts` |
```

## 13. Prossimi passi

1. Review dell'utente di questo documento.
2. Stesura del piano di implementazione (skill `writing-plans`).
3. Implementazione incrementale partendo dallo scaffolding Vite + Phaser e da una prima
   regione giocabile.
