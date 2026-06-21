# First Playable Location Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consegnare la prima vertical slice giocabile di Game-LinkedIn: il visitatore si muove in una mappa top-down, raggiunge una sede dimostrativa e apre il relativo pannello carriera.

**Architecture:** La geometria del mondo arriva da una tilemap Tiled JSON, mentre tutti i contenuti arrivano da `src/data/career.ts`. La logica pura (validazione, risoluzione `refId`, movimento, prossimità e stato del diario) resta indipendente da Phaser e viene sviluppata con TDD; le scene Phaser fanno solo da adattatori e vengono verificate anche nel browser.

**Tech Stack:** TypeScript, Phaser 3, Vite, Vitest, Tiled JSON, CSS responsive.

## Global Constraints

- Il gioco deve aprirsi nel browser senza installazioni lato visitatore, su desktop e mobile.
- Il contenuto carriera deve essere modificabile nel solo `src/data/career.ts`.
- Desktop: frecce/WASD per muoversi, Spazio/Invio per interagire, Esc per chiudere il pannello.
- Mobile: joystick virtuale a sinistra e tasto azione a destra.
- Nessun asset Nintendo; questa vertical slice usa grafica originale generata a runtime e documenta la provenienza in `public/assets/CREDITS.md`.
- Interni, combattimento, audio, salvataggio e multilingua restano fuori da questo incremento.
- La vertical slice contiene una sede dimostrativa completa; i dati reali sostituiranno il record demo quando l'utente fornirà CV/LinkedIn.

## File Structure

```text
index.html                         shell HTML e mount del canvas
package.json                       script dev, test, build e dipendenze
tsconfig.json                      TypeScript strict
vite.config.ts                     configurazione Vite/Vitest
src/main.ts                        bootstrap del gioco
src/style.css                      canvas, HUD e comportamento responsive
src/game/createGameConfig.ts       configurazione Phaser testabile
src/scenes/BootScene.ts            ingresso minimo
src/scenes/PreloadScene.ts         tilemap e texture originali generate a runtime
src/scenes/WorldScene.ts           mappa, player, collisioni e interazione sede
src/scenes/UIScene.ts              prompt e pannello informazioni
src/data/types.ts                  modello dati carriera
src/data/career.ts                 unico file con contenuti modificabili
src/data/validateCareerData.ts      validazione runtime dei contenuti
src/systems/JournalState.ts         scoperte e skill raccolte
src/systems/InteractionSystem.ts    prossimità e selezione interazione
src/systems/MovementSystem.ts       normalizzazione input desktop/touch
src/systems/WorldResolver.ts        refId Tiled -> contenuto carriera
src/ui/formatLocationPanel.ts       view model del pannello sede
src/ui/TouchControls.ts             joystick e tasto azione mobile
public/maps/first-location.json     geometria e object layer Tiled
public/assets/CREDITS.md            fonti/licenze visuali
tests/**/*.test.ts                 test Vitest della logica pura
```

---

### Task 1: Toolchain e modello dati carriera

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/data/types.ts`
- Create: `src/data/validateCareerData.ts`
- Test: `tests/data/validateCareerData.test.ts`

**Interfaces:**
- Consumes: nessuna interfaccia applicativa precedente.
- Produces: `CareerData`, `Location`, `Skill`, `assertCareerData(value: unknown): asserts value is CareerData`.

- [ ] **Step 1: Inizializzare il toolchain senza codice di produzione**

Run:

```bash
npm init -y
npm install phaser@3
npm install -D vite@7 typescript@5 vitest@3
```

Aggiornare gli script di `package.json` a:

```json
{
  "scripts": {
    "dev": "vite",
    "test": "vitest run",
    "test:watch": "vitest",
    "build": "tsc --noEmit && vite build"
  }
}
```

Creare `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vitest/globals"]
  },
  "include": ["src", "tests", "vite.config.ts"]
}
```

Creare `vite.config.ts`:

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
```

Creare `index.html`:

```html
<!doctype html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#172a1f" />
    <title>Game-LinkedIn</title>
  </head>
  <body>
    <main id="game" aria-label="Game-LinkedIn"></main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 2: Scrivere il test fallente del contratto dati**

Creare `tests/data/validateCareerData.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { assertCareerData } from '../../src/data/validateCareerData'

const validCareer = {
  player: { name: 'Vincenzo', sprite: 'hero' },
  locations: [
    {
      id: 'demo-studio',
      name: 'Sede dimostrativa',
      kind: 'work',
      building: 'studio',
      period: '2026',
      role: 'Product Builder',
      summary: 'Una prima tappa giocabile.',
      skills: [{ id: 'typescript', name: 'TypeScript' }],
    },
  ],
  contact: { linkedin: 'https://www.linkedin.com/', email: 'hello@example.com' },
}

describe('assertCareerData', () => {
  it('accetta una carriera completa', () => {
    expect(() => assertCareerData(validCareer)).not.toThrow()
  })

  it('rifiuta identificativi di sede duplicati', () => {
    const duplicate = {
      ...validCareer,
      locations: [validCareer.locations[0], validCareer.locations[0]],
    }

    expect(() => assertCareerData(duplicate)).toThrow('Duplicate location id: demo-studio')
  })

  it('rifiuta una sede priva di riepilogo', () => {
    const invalid = structuredClone(validCareer)
    delete (invalid.locations[0] as Partial<(typeof invalid.locations)[number]>).summary

    expect(() => assertCareerData(invalid)).toThrow('locations[0].summary must be a non-empty string')
  })
})
```

- [ ] **Step 3: Eseguire il test e verificare RED**

Run: `npm test -- tests/data/validateCareerData.test.ts`

Expected: FAIL perché `src/data/validateCareerData.ts` non esiste.

- [ ] **Step 4: Implementare tipi e validazione minima**

Creare `src/data/types.ts`:

```ts
export interface CareerData {
  player: { name: string; sprite: string }
  locations: Location[]
  contact: Contact
}

export interface Location {
  id: string
  name: string
  kind: 'education' | 'work'
  building: string
  period: string
  role?: string
  summary: string
  projects?: InfoEntry[]
  skills?: Skill[]
  npcs?: Npc[]
  objects?: InteractiveObject[]
}

export interface InfoEntry { label: string; body: string }
export interface Skill { id: string; name: string; icon?: string }
export interface Npc { id: string; name: string; sprite: string; lines: string[] }
export interface InteractiveObject {
  id: string
  label: string
  type: 'project' | 'role' | 'education' | 'achievement' | 'note'
  body: string
}
export interface Contact { linkedin: string; email: string; cvUrl?: string }
```

Creare `src/data/validateCareerData.ts`:

```ts
import type { CareerData } from './types'

function object(value: unknown, path: string): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${path} must be an object`)
  }
}

function text(value: unknown, path: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${path} must be a non-empty string`)
  }
}

export function assertCareerData(value: unknown): asserts value is CareerData {
  object(value, 'career')
  object(value.player, 'player')
  text(value.player.name, 'player.name')
  text(value.player.sprite, 'player.sprite')
  if (!Array.isArray(value.locations) || value.locations.length === 0) {
    throw new Error('locations must be a non-empty array')
  }

  const ids = new Set<string>()
  value.locations.forEach((entry, index) => {
    object(entry, `locations[${index}]`)
    text(entry.id, `locations[${index}].id`)
    if (ids.has(entry.id)) throw new Error(`Duplicate location id: ${entry.id}`)
    ids.add(entry.id)
    text(entry.name, `locations[${index}].name`)
    if (entry.kind !== 'education' && entry.kind !== 'work') {
      throw new Error(`locations[${index}].kind must be education or work`)
    }
    text(entry.building, `locations[${index}].building`)
    text(entry.period, `locations[${index}].period`)
    text(entry.summary, `locations[${index}].summary`)
  })

  object(value.contact, 'contact')
  text(value.contact.linkedin, 'contact.linkedin')
  text(value.contact.email, 'contact.email')
}
```

- [ ] **Step 5: Verificare GREEN e committare**

Run: `npm test -- tests/data/validateCareerData.test.ts`

Expected: 3 test PASS.

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html src/data tests/data
git commit -m "build: scaffold Game-LinkedIn data layer"
```

---

### Task 2: Contenuto demo e stato del diario

**Files:**
- Create: `src/data/career.ts`
- Create: `src/systems/JournalState.ts`
- Test: `tests/data/career.test.ts`
- Test: `tests/systems/JournalState.test.ts`

**Interfaces:**
- Consumes: `CareerData`, `assertCareerData`.
- Produces: `careerData: CareerData`, `JournalState.discoverLocation(id)`, `JournalState.collectSkill(id)`, snapshot immutabile.

- [ ] **Step 1: Scrivere i test fallenti**

Creare `tests/data/career.test.ts`:

```ts
import { expect, it } from 'vitest'
import { careerData } from '../../src/data/career'
import { assertCareerData } from '../../src/data/validateCareerData'

it('espone dati demo validi per la prima sede', () => {
  expect(() => assertCareerData(careerData)).not.toThrow()
  expect(careerData.locations.map(({ id }) => id)).toEqual(['demo-studio'])
})
```

Creare `tests/systems/JournalState.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { JournalState } from '../../src/systems/JournalState'

describe('JournalState', () => {
  it('registra una scoperta una sola volta', () => {
    const journal = new JournalState()
    journal.discoverLocation('demo-studio')
    journal.discoverLocation('demo-studio')
    expect(journal.snapshot().discoveredLocationIds).toEqual(['demo-studio'])
  })

  it('calcola il progresso delle skill senza duplicati', () => {
    const journal = new JournalState(2)
    journal.collectSkill('typescript')
    journal.collectSkill('typescript')
    expect(journal.snapshot()).toMatchObject({ collectedSkillIds: ['typescript'], skillProgress: 0.5 })
  })
})
```

- [ ] **Step 2: Verificare RED**

Run: `npm test -- tests/data/career.test.ts tests/systems/JournalState.test.ts`

Expected: FAIL perché entrambi i moduli non esistono.

- [ ] **Step 3: Implementare contenuto e stato minimo**

Creare `src/data/career.ts`:

```ts
import type { CareerData } from './types'

export const careerData: CareerData = {
  player: { name: 'Vincenzo', sprite: 'hero' },
  locations: [{
    id: 'demo-studio',
    name: 'Sede dimostrativa',
    kind: 'work',
    building: 'studio',
    period: '2026',
    role: 'Product Builder',
    summary: 'Questa prima sede verifica il flusso esplorazione → interazione → racconto professionale.',
    projects: [{ label: 'Game-LinkedIn', body: 'Un portfolio esplorabile costruito come gioco top-down.' }],
    skills: [{ id: 'typescript', name: 'TypeScript' }, { id: 'game-design', name: 'Game design' }],
  }],
  contact: {
    linkedin: 'https://www.linkedin.com/',
    email: 'hello@example.com',
  },
}
```

Creare `src/systems/JournalState.ts`:

```ts
export interface JournalSnapshot {
  discoveredLocationIds: readonly string[]
  collectedSkillIds: readonly string[]
  skillProgress: number
}

export class JournalState {
  readonly #locations = new Set<string>()
  readonly #skills = new Set<string>()

  constructor(private readonly totalSkills = 0) {}

  discoverLocation(id: string): void { this.#locations.add(id) }
  collectSkill(id: string): void { this.#skills.add(id) }

  snapshot(): JournalSnapshot {
    return {
      discoveredLocationIds: [...this.#locations],
      collectedSkillIds: [...this.#skills],
      skillProgress: this.totalSkills === 0 ? 0 : this.#skills.size / this.totalSkills,
    }
  }
}
```

- [ ] **Step 4: Verificare GREEN e committare**

Run: `npm test -- tests/data/career.test.ts tests/systems/JournalState.test.ts`

Expected: 3 test PASS.

```bash
git add src/data/career.ts src/systems/JournalState.ts tests/data/career.test.ts tests/systems/JournalState.test.ts
git commit -m "feat: add demo career and journal state"
```

---

### Task 3: Risoluzione Tiled e prossimità

**Files:**
- Create: `src/systems/WorldResolver.ts`
- Create: `src/systems/InteractionSystem.ts`
- Test: `tests/systems/WorldResolver.test.ts`
- Test: `tests/systems/InteractionSystem.test.ts`

**Interfaces:**
- Consumes: `CareerData`, Tiled property `{ name: 'refId', value: string }`.
- Produces: `resolveLocationRef(object, careerData): Location`, `nearestInteraction(origin, targets, maxDistance)`.

- [ ] **Step 1: Scrivere i test fallenti**

Creare `tests/systems/WorldResolver.test.ts`:

```ts
import { expect, it } from 'vitest'
import { careerData } from '../../src/data/career'
import { resolveLocationRef } from '../../src/systems/WorldResolver'

it('risolve il refId Tiled nella sede carriera', () => {
  const object = { properties: [{ name: 'refId', value: 'demo-studio' }] }
  expect(resolveLocationRef(object, careerData).name).toBe('Sede dimostrativa')
})

it('segnala un refId senza contenuto associato', () => {
  const object = { properties: [{ name: 'refId', value: 'missing' }] }
  expect(() => resolveLocationRef(object, careerData)).toThrow('Unknown location refId: missing')
})
```

Creare `tests/systems/InteractionSystem.test.ts`:

```ts
import { expect, it } from 'vitest'
import { nearestInteraction } from '../../src/systems/InteractionSystem'

it('sceglie il bersaglio più vicino entro la distanza massima', () => {
  const result = nearestInteraction(
    { x: 0, y: 0 },
    [{ id: 'far', x: 60, y: 0 }, { id: 'near', x: 20, y: 0 }],
    48,
  )
  expect(result?.id).toBe('near')
})

it('non propone bersagli fuori portata', () => {
  expect(nearestInteraction({ x: 0, y: 0 }, [{ id: 'far', x: 60, y: 0 }], 48)).toBeUndefined()
})
```

- [ ] **Step 2: Verificare RED**

Run: `npm test -- tests/systems/WorldResolver.test.ts tests/systems/InteractionSystem.test.ts`

Expected: FAIL per moduli mancanti.

- [ ] **Step 3: Implementare i due sistemi puri**

Creare `src/systems/WorldResolver.ts`:

```ts
import type { CareerData, Location } from '../data/types'

interface TiledObjectLike { properties?: Array<{ name: string; value: unknown }> }

export function resolveLocationRef(object: TiledObjectLike, career: CareerData): Location {
  const refId = object.properties?.find(({ name }) => name === 'refId')?.value
  if (typeof refId !== 'string') throw new Error('Location object is missing string refId')
  const location = career.locations.find(({ id }) => id === refId)
  if (!location) throw new Error(`Unknown location refId: ${refId}`)
  return location
}
```

Creare `src/systems/InteractionSystem.ts`:

```ts
export interface Point { x: number; y: number }
export interface InteractionTarget extends Point { id: string }

export function nearestInteraction<T extends InteractionTarget>(
  origin: Point,
  targets: readonly T[],
  maxDistance: number,
): T | undefined {
  return targets
    .map((target) => ({ target, distance: Math.hypot(target.x - origin.x, target.y - origin.y) }))
    .filter(({ distance }) => distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)[0]?.target
}
```

- [ ] **Step 4: Verificare GREEN e committare**

Run: `npm test -- tests/systems/WorldResolver.test.ts tests/systems/InteractionSystem.test.ts`

Expected: 4 test PASS.

```bash
git add src/systems tests/systems
git commit -m "feat: resolve map references and interactions"
```

---

### Task 4: Movimento unificato desktop/touch

**Files:**
- Create: `src/systems/MovementSystem.ts`
- Test: `tests/systems/MovementSystem.test.ts`

**Interfaces:**
- Consumes: assi grezzi `x`, `y` nell'intervallo `[-1, 1]`.
- Produces: `movementVector(x, y, speed)` con velocità diagonale normalizzata.

- [ ] **Step 1: Scrivere il test fallente**

```ts
import { expect, it } from 'vitest'
import { movementVector } from '../../src/systems/MovementSystem'

it('mantiene la stessa velocità in diagonale', () => {
  const vector = movementVector(1, 1, 160)
  expect(Math.hypot(vector.x, vector.y)).toBeCloseTo(160)
})

it('restituisce zero senza input', () => {
  expect(movementVector(0, 0, 160)).toEqual({ x: 0, y: 0 })
})
```

- [ ] **Step 2: Verificare RED**

Run: `npm test -- tests/systems/MovementSystem.test.ts`

Expected: FAIL per modulo mancante.

- [ ] **Step 3: Implementare e verificare GREEN**

```ts
export function movementVector(x: number, y: number, speed: number): { x: number; y: number } {
  const length = Math.hypot(x, y)
  if (length === 0) return { x: 0, y: 0 }
  return { x: (x / length) * speed, y: (y / length) * speed }
}
```

Run: `npm test -- tests/systems/MovementSystem.test.ts`

Expected: 2 test PASS.

```bash
git add src/systems/MovementSystem.ts tests/systems/MovementSystem.test.ts
git commit -m "feat: normalize player movement"
```

---

### Task 5: Tilemap e bootstrap Phaser

**Files:**
- Create: `public/maps/first-location.json`
- Create: `public/assets/CREDITS.md`
- Create: `src/game/createGameConfig.ts`
- Create: `src/scenes/BootScene.ts`
- Create: `src/scenes/PreloadScene.ts`
- Create: `src/main.ts`
- Create: `src/style.css`
- Test: `tests/game/createGameConfig.test.ts`

**Interfaces:**
- Consumes: chiavi scena `boot`, `preload`, `world`, `ui`; mount DOM `#game`.
- Produces: `createGameConfig(parent): Phaser.Types.Core.GameConfig`, tilemap `first-location` e texture `hero`/`studio`.

- [ ] **Step 1: Scrivere il test fallente della configurazione**

```ts
import { expect, it } from 'vitest'
import { createGameConfig } from '../../src/game/createGameConfig'

it('crea un gioco responsive con fisica arcade', () => {
  const config = createGameConfig('game')
  expect(config.parent).toBe('game')
  expect(config.physics).toMatchObject({ default: 'arcade' })
  expect(config.scale).toMatchObject({ width: 960, height: 540 })
})
```

- [ ] **Step 2: Verificare RED**

Run: `npm test -- tests/game/createGameConfig.test.ts`

Expected: FAIL per modulo mancante.

- [ ] **Step 3: Creare mappa Tiled e crediti**

`public/maps/first-location.json` deve essere JSON Tiled 1.10 con dimensione `30x20`, tile `32x32` e due object layer:

```json
{
  "compressionlevel": -1,
  "height": 20,
  "infinite": false,
  "layers": [
    { "id": 1, "name": "entities", "type": "objectgroup", "objects": [
      { "id": 1, "name": "spawn", "type": "spawn", "point": true, "x": 128, "y": 448 },
      { "id": 2, "name": "demo-studio", "type": "location", "x": 512, "y": 192, "width": 160, "height": 128,
        "properties": [{ "name": "refId", "type": "string", "value": "demo-studio" }] },
      { "id": 3, "name": "studio-door", "type": "interaction", "point": true, "x": 592, "y": 336,
        "properties": [{ "name": "refId", "type": "string", "value": "demo-studio" }] }
    ], "opacity": 1, "visible": true, "x": 0, "y": 0 },
    { "id": 2, "name": "collisions", "type": "objectgroup", "objects": [
      { "id": 4, "name": "north", "x": 0, "y": 0, "width": 960, "height": 32 },
      { "id": 5, "name": "south", "x": 0, "y": 608, "width": 960, "height": 32 },
      { "id": 6, "name": "west", "x": 0, "y": 0, "width": 32, "height": 640 },
      { "id": 7, "name": "east", "x": 928, "y": 0, "width": 32, "height": 640 },
      { "id": 8, "name": "studio", "x": 512, "y": 192, "width": 160, "height": 128 }
    ], "opacity": 1, "visible": true, "x": 0, "y": 0 }
  ],
  "nextlayerid": 3,
  "nextobjectid": 9,
  "orientation": "orthogonal",
  "renderorder": "right-down",
  "tiledversion": "1.10.2",
  "tileheight": 32,
  "tilewidth": 32,
  "type": "map",
  "version": "1.10",
  "width": 30
}
```

`public/assets/CREDITS.md`:

```md
# Asset credits

La prima vertical slice non incorpora asset di terze parti. Terreno, edificio e personaggio
sono forme pixel-art originali generate a runtime da Phaser. Nessun asset Nintendo viene usato.
```

- [ ] **Step 4: Implementare configurazione e scene di avvio**

`createGameConfig` deve impostare `Phaser.AUTO`, sfondo `#172a1f`, `FIT`, `CENTER_BOTH`, pixel art, Arcade senza gravità e le quattro scene in ordine. `BootScene.create()` avvia `preload`. `PreloadScene.preload()` carica `/maps/first-location.json`; `create()` genera con `Graphics.generateTexture` un eroe `24x28` e un edificio `160x128`, poi avvia `world` e lancia `ui` in parallelo.

`src/main.ts`:

```ts
import Phaser from 'phaser'
import './style.css'
import { careerData } from './data/career'
import { assertCareerData } from './data/validateCareerData'
import { createGameConfig } from './game/createGameConfig'

assertCareerData(careerData)
new Phaser.Game(createGameConfig('game'))
```

`src/style.css`:

```css
:root { color-scheme: dark; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #0b1710; }
* { box-sizing: border-box; }
html, body, #game { width: 100%; height: 100%; margin: 0; overflow: hidden; }
#game { display: grid; place-items: center; background: radial-gradient(circle at center, #203d2a, #08110c 72%); }
canvas { image-rendering: pixelated; max-width: 100%; max-height: 100%; }
```

- [ ] **Step 5: Verificare GREEN e committare**

Run: `npm test -- tests/game/createGameConfig.test.ts`

Expected: 1 test PASS.

```bash
git add public src/game src/scenes/BootScene.ts src/scenes/PreloadScene.ts src/main.ts src/style.css tests/game
git commit -m "feat: boot first Phaser world"
```

---

### Task 6: Mondo giocabile e pannello sede

**Files:**
- Create: `src/scenes/WorldScene.ts`
- Create: `src/scenes/UIScene.ts`
- Create: `src/ui/formatLocationPanel.ts`
- Test: `tests/ui/formatLocationPanel.test.ts`

**Interfaces:**
- Consumes: tilemap `first-location`, `careerData`, `movementVector`, `nearestInteraction`, `resolveLocationRef`.
- Produces: evento Phaser `location:show` con `Location`; pannello con titolo, ruolo/periodo, riepilogo, progetto e skill.

- [ ] **Step 1: Scrivere il test fallente del view model**

```ts
import { expect, it } from 'vitest'
import { careerData } from '../../src/data/career'
import { formatLocationPanel } from '../../src/ui/formatLocationPanel'

it('formatta tutti i contenuti della sede', () => {
  expect(formatLocationPanel(careerData.locations[0]!)).toEqual({
    title: 'Sede dimostrativa',
    meta: 'Product Builder · 2026',
    summary: 'Questa prima sede verifica il flusso esplorazione → interazione → racconto professionale.',
    projects: ['Game-LinkedIn — Un portfolio esplorabile costruito come gioco top-down.'],
    skills: ['TypeScript', 'Game design'],
  })
})
```

- [ ] **Step 2: Verificare RED, implementare e verificare GREEN**

Run: `npm test -- tests/ui/formatLocationPanel.test.ts`

Expected: FAIL per modulo mancante.

```ts
import type { Location } from '../data/types'

export function formatLocationPanel(location: Location) {
  return {
    title: location.name,
    meta: [location.role, location.period].filter(Boolean).join(' · '),
    summary: location.summary,
    projects: (location.projects ?? []).map(({ label, body }) => `${label} — ${body}`),
    skills: (location.skills ?? []).map(({ name }) => name),
  }
}
```

Run: `npm test -- tests/ui/formatLocationPanel.test.ts`

Expected: 1 test PASS.

- [ ] **Step 3: Implementare `WorldScene` come adattatore Phaser**

In `create()`: creare la tilemap, disegnare prato/sentieri con `Graphics`, leggere spawn e sede dall'object layer, mostrare la texture edificio, creare il player Arcade, trasformare i rettangoli di `collisions` in body statici e seguire il player con la camera. Registrare frecce/WASD e Spazio/Invio.

In `update()`: combinare input tastiera e `registry.get('touch-vector')`, applicare `movementVector(..., 160)` al body, calcolare la porta più vicina con `nearestInteraction(..., 72)`, emettere `interaction:prompt` quando è raggiungibile e `location:show` quando viene premuta l'azione. Al primo accesso chiamare `JournalState.discoverLocation`.

- [ ] **Step 4: Implementare `UIScene`**

Creare un prompt basso `Spazio / Invio — scopri la sede`. Su `location:show`, usare `formatLocationPanel`, mostrare un pannello scuro con bordo chiaro e testo a capo; Esc e il pulsante `×` chiudono. Il pannello usa `setScrollFactor(0)` e profondità superiore al mondo.

- [ ] **Step 5: Verificare test e committare**

Run: `npm test`

Expected: tutti i test PASS.

```bash
git add src/scenes/WorldScene.ts src/scenes/UIScene.ts src/ui tests/ui
git commit -m "feat: make first career location interactive"
```

---

### Task 7: Controlli touch e verifica responsive

**Files:**
- Create: `src/ui/TouchControls.ts`
- Create: `src/ui/joystickDirection.ts`
- Test: `tests/ui/joystickDirection.test.ts`
- Modify: `src/scenes/UIScene.ts`

**Interfaces:**
- Consumes: pointer Phaser e registry condiviso.
- Produces: registry `touch-vector: {x, y}` e `touch-action: boolean`.

- [ ] **Step 1: Scrivere il test fallente della dead zone**

```ts
import { expect, it } from 'vitest'
import { joystickDirection } from '../../src/ui/joystickDirection'

it('ignora movimenti dentro la dead zone', () => {
  expect(joystickDirection(4, 3, 8)).toEqual({ x: 0, y: 0 })
})

it('normalizza movimenti fuori dalla dead zone', () => {
  const direction = joystickDirection(30, 40, 8)
  expect(direction.x).toBeCloseTo(0.6)
  expect(direction.y).toBeCloseTo(0.8)
})
```

- [ ] **Step 2: Verificare RED, implementare e verificare GREEN**

```ts
export function joystickDirection(x: number, y: number, deadZone: number) {
  const length = Math.hypot(x, y)
  if (length <= deadZone) return { x: 0, y: 0 }
  return { x: x / length, y: y / length }
}
```

Run: `npm test -- tests/ui/joystickDirection.test.ts`

Expected: 2 test PASS.

- [ ] **Step 3: Implementare i controlli touch**

`TouchControls` crea una base circolare semitrasparente a sinistra e un pulsante `A` a destra, entrambi `setScrollFactor(0)`. Il trascinamento aggiorna `touch-vector` tramite `joystickDirection`; `pointerup` lo azzera. Il pulsante azione imposta `touch-action` solo sul fronte di pressione. I controlli sono visibili quando `navigator.maxTouchPoints > 0` o la viewport è larga meno di `760px`.

- [ ] **Step 4: Verificare manualmente desktop e mobile**

Run: `npm run dev -- --host 127.0.0.1`

Verificare nel browser:

1. Desktop `960x540`: frecce e WASD muovono alla stessa velocità anche in diagonale.
2. Avvicinandosi alla porta compare il prompt; Spazio e Invio aprono il pannello corretto.
3. Esc e `×` chiudono senza muovere il giocatore sotto il pannello.
4. Mobile `390x844`: joystick e tasto `A` sono raggiungibili e non coprono il pannello.
5. Rotazione `844x390`: canvas e controlli restano interamente visibili.

- [ ] **Step 5: Committare**

```bash
git add src/ui src/scenes/UIScene.ts tests/ui/joystickDirection.test.ts
git commit -m "feat: add responsive touch controls"
```

---

### Task 8: Verifica finale della vertical slice

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-06-21-first-playable-location.md`

**Interfaces:**
- Consumes: tutti i deliverable precedenti.
- Produces: istruzioni riproducibili e checklist completata.

- [ ] **Step 1: Documentare avvio e contenuti**

Creare `README.md` con: requisiti Node/npm, `npm install`, `npm run dev`, `npm test`, `npm run build`, controlli desktop/mobile e indicazione che i contenuti si cambiano esclusivamente in `src/data/career.ts`.

- [ ] **Step 2: Eseguire la suite completa**

Run: `npm test`

Expected: tutti i test PASS, zero failure.

- [ ] **Step 3: Eseguire typecheck e build**

Run: `npm run build`

Expected: TypeScript senza errori e build Vite completata in `dist/`.

- [ ] **Step 4: Ripetere lo smoke test del percorso principale**

Percorso: caricamento → movimento → porta sede → prompt → pannello → chiusura → riapertura. Verificare console browser senza errori.

- [ ] **Step 5: Aggiornare le checkbox e committare**

```bash
git add README.md docs/superpowers/plans/2026-06-21-first-playable-location.md
git commit -m "docs: document first playable location"
```

## Self-Review

- Copertura della specifica in questo incremento: bootstrap Phaser/Vite, contenuti separati, Tiled `refId`, movimento/collisioni, una sede e pannello, diario di base, desktop/mobile, build statica.
- Rimandato ai piani successivi V1: altre 2–4 sedi reali, NPC, oggetti leggibili, orb visibili, diario completo e area Contatti.
- Il piano non usa asset protetti o dipendenze da backend.
- Le firme condivise (`Location`, `resolveLocationRef`, `nearestInteraction`, `movementVector`) sono coerenti tra task e test.
