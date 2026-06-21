# Six Career Districts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the demo location with a playable top-down pixel-art city containing all six work experiences, period-correct logos, paginated first-person stories, visit progress, and public contact links.

**Architecture:** Keep `src/data/career.ts` as the single source of professional content and use a generated Tiled-compatible object map only for positions, collisions, and `refId` links. Render one original pixel-art city background, overlay sourced company logos, resolve interactions in `WorldScene`, and keep pagination, journal progress, and contact presentation in pure view-model helpers plus `UIScene`.

**Tech Stack:** TypeScript 5, Phaser 3.90, Vite 7, Vitest 3, Tiled-compatible JSON object layers, original pixel-art PNG, SVG/PNG logo assets.

## Global Constraints

- The world contains exactly six work locations in this order: The Big Now, SG Holding, Wunderman Thompson, Armando Testa, Dentsu, EY.
- Exploration is free from the beginning; chronology is suggested by the road layout and `order`, never by locks.
- The camera and all art use one fixed top-down orthographic viewpoint; no frontal cards, isometric districts, or perspective changes.
- Buildings are exterior-only. Every company has one outdoor entrance interaction.
- Every location includes a period-correct company logo. No company may be skipped.
- Content is first-person, concise, and derived only from the supplied CV.
- Public contact data is allowlisted to LinkedIn, email, and optional public CV URL. Phone, address, and birth date are forbidden.
- Desktop controls remain arrows/WASD, Space/Enter, and Esc. Touch controls remain joystick plus action button.
- No Nintendo assets, copied game UI, interiors, NPCs, combat, audio, mini-games, education locations, or persistent save data.
- Every third-party or trademark asset is recorded in `public/assets/CREDITS.md`.

## File Structure

~~~text
src/data/types.ts                         focused career, logo, district, contact types
src/data/career.ts                        all six approved CV records and public contact data
src/data/validateCareerData.ts             runtime allowlist and completeness validation
src/scenes/PreloadScene.ts                 city background and six logo loaders
src/scenes/WorldScene.ts                   multi-location world, collisions, logo overlays, interactions
src/scenes/UIScene.ts                      prompt, paginated story, journal HUD, contact panel
src/systems/JournalState.ts                unique visits and location completion progress
src/ui/fitWithin.ts                        aspect-ratio-safe logo sizing
src/ui/locationPanelPages.ts               pure location-to-pages formatter
src/ui/formatContactPanel.ts               pure public contact view model
scripts/create-career-city-map.mjs         deterministic object-map generator
public/maps/career-city.json               generated spawn, locations, entrances, contact, collisions
public/assets/world/career-city.png         approved original top-down city background
public/assets/logos/*                       six sourced period-correct company marks
public/assets/CREDITS.md                    source URL, retrieval date, license/trademark note
tests/data/*                                contract, content, privacy, and asset completeness
tests/maps/careerCityMap.test.ts            map structure and refId coverage
tests/systems/JournalState.test.ts          visit idempotency and progress
tests/ui/fitWithin.test.ts                  logo sizing
tests/ui/locationPanelPages.test.ts         story pagination
tests/ui/formatContactPanel.test.ts          contact allowlist formatting
~~~

---

### Task 1: Real CV data contract and privacy allowlist

**Files:**
- Modify: `src/data/types.ts`
- Modify: `src/data/career.ts`
- Modify: `src/data/validateCareerData.ts`
- Modify: `tests/data/career.test.ts`
- Modify: `tests/data/validateCareerData.test.ts`

**Interfaces:**
- Consumes: no new application interface.
- Produces: `CareerData`, `Location`, `LogoAsset`, `DistrictTheme`, and `assertCareerData(value: unknown): asserts value is CareerData`.

- [ ] **Step 1: Replace the demo assertions with failing six-location and privacy tests**

Replace `tests/data/career.test.ts` with:

~~~ts
import { expect, it } from 'vitest'
import { careerData } from '../../src/data/career'
import { assertCareerData } from '../../src/data/validateCareerData'

const expectedIds = [
  'the-big-now',
  'sg-holding',
  'wunderman-thompson',
  'armando-testa',
  'dentsu',
  'ey',
]

it('espone tutte e sei le esperienze lavorative in ordine cronologico', () => {
  expect(() => assertCareerData(careerData)).not.toThrow()
  expect(careerData.locations.map(({ id }) => id)).toEqual(expectedIds)
  expect(careerData.locations.map(({ order }) => order)).toEqual([1, 2, 3, 4, 5, 6])
  expect(careerData.locations.every(({ kind }) => kind === 'work')).toBe(true)
})

it('non conserva placeholder o dati personali esclusi', () => {
  const serialized = JSON.stringify(careerData)
  expect(serialized).not.toContain('demo-studio')
  expect(serialized).not.toContain('hello@example.com')
  expect(Object.keys(careerData.contact).sort()).toEqual(['email', 'linkedin'])
  expect(careerData.contact).toEqual({
    linkedin: 'https://www.linkedin.com/in/vincenzoalbertomarrari/',
    email: 'vincenzoalbertomarrari@gmail.com',
  })
})

it('assegna a ogni sede logo, racconto e tema completi', () => {
  for (const location of careerData.locations) {
    expect(location.logo.key).toBe('logo-' + location.id)
    expect(location.logo.path).toMatch(/^assets\/logos\//)
    expect(location.activities.length).toBeGreaterThanOrEqual(2)
    expect(location.experience.length).toBeGreaterThan(40)
    expect(location.skills.length).toBeGreaterThanOrEqual(2)
    expect(location.district.palette).toHaveLength(3)
  }
})
~~~

Replace `tests/data/validateCareerData.test.ts` with a fixture containing the new fields and these cases:

~~~ts
import { describe, expect, it } from 'vitest'
import { assertCareerData } from '../../src/data/validateCareerData'

const validCareer = {
  player: { name: 'Vincenzo', sprite: 'hero' },
  locations: [{
    id: 'the-big-now',
    name: 'The Big Now',
    kind: 'work',
    order: 1,
    building: 'creative-studio',
    logo: {
      key: 'logo-the-big-now',
      path: 'assets/logos/the-big-now.png',
      alt: 'The Big Now',
    },
    period: '2016–2017',
    role: 'Digital Strategist',
    summary: 'Strategia digitale e contenuti.',
    activities: ['Ricerca trend', 'Piani editoriali'],
    experience: 'Ho costruito le basi del mio approccio strategico ai contenuti.',
    skills: [
      { id: 'digital-strategy', name: 'Digital strategy' },
      { id: 'trend-research', name: 'Trend research' },
    ],
    district: {
      id: 'creative-district',
      label: 'Distretto creativo',
      palette: ['#e95f78', '#45c7d4', '#f0c163'],
      landmark: 'Murales e studio digitale',
    },
  }],
  contact: {
    linkedin: 'https://www.linkedin.com/in/vincenzoalbertomarrari/',
    email: 'vincenzoalbertomarrari@gmail.com',
  },
}

describe('assertCareerData', () => {
  it('accetta una carriera completa', () => {
    expect(() => assertCareerData(validCareer)).not.toThrow()
  })

  it('rifiuta identificativi di sede duplicati', () => {
    const duplicate = { ...validCareer, locations: [validCareer.locations[0], validCareer.locations[0]] }
    expect(() => assertCareerData(duplicate)).toThrow('Duplicate location id: the-big-now')
  })

  it('rifiuta ordini cronologici duplicati', () => {
    const second = structuredClone(validCareer.locations[0])
    second.id = 'second'
    second.logo.key = 'logo-second'
    expect(() => assertCareerData({ ...validCareer, locations: [validCareer.locations[0], second] }))
      .toThrow('Duplicate location order: 1')
  })

  it('rifiuta una sede priva di esperienza', () => {
    const invalid = structuredClone(validCareer)
    delete (invalid.locations[0] as Partial<(typeof invalid.locations)[number]>).experience
    expect(() => assertCareerData(invalid))
      .toThrow('locations[0].experience must be a non-empty string')
  })

  it('rifiuta campi contatto non inclusi nella allowlist', () => {
    const invalid = { ...validCareer, contact: { ...validCareer.contact, phone: '+39 000' } }
    expect(() => assertCareerData(invalid)).toThrow('contact contains forbidden field: phone')
  })
})
~~~

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

~~~bash
npm test -- tests/data/career.test.ts tests/data/validateCareerData.test.ts
~~~

Expected: FAIL because `order`, `logo`, `activities`, `experience`, and `district` do not exist and the data still contains `demo-studio`.

- [ ] **Step 3: Replace the career types with the approved contract**

Replace `src/data/types.ts` with:

~~~ts
export interface CareerData {
  player: { name: string; sprite: string }
  locations: Location[]
  contact: Contact
}

export interface LogoAsset {
  key: string
  path: string
  alt: string
}

export interface DistrictTheme {
  id: string
  label: string
  palette: [string, string, string]
  landmark: string
}

export interface Location {
  id: string
  name: string
  kind: 'work'
  order: number
  building: string
  logo: LogoAsset
  period: string
  role: string
  summary: string
  activities: string[]
  experience: string
  skills: Skill[]
  tools?: string[]
  district: DistrictTheme
}

export interface Skill {
  id: string
  name: string
  icon?: string
}

export interface Contact {
  linkedin: string
  email: string
  cvUrl?: string
}
~~~

- [ ] **Step 4: Populate all six approved CV records**

Replace `src/data/career.ts` with:

~~~ts
import type { CareerData } from './types'

export const careerData: CareerData = {
  player: { name: 'Vincenzo', sprite: 'hero' },
  locations: [
    {
      id: 'the-big-now',
      name: 'The Big Now',
      kind: 'work',
      order: 1,
      building: 'creative-studio',
      logo: { key: 'logo-the-big-now', path: 'assets/logos/the-big-now.png', alt: 'The Big Now' },
      period: '2016–2017',
      role: 'Digital Strategist',
      summary: 'Trend, strategie digitali e contenuti costruiti attorno a target e posizionamento.',
      activities: [
        'Ricerca di trend e segnali culturali',
        'Sviluppo di strategie digitali e piani editoriali',
        'Creazione di contenuti coerenti con target e posizionamento',
      ],
      experience: 'Ho iniziato trasformando trend, target e obiettivi di marca in strategie digitali e piani editoriali. Qui ho costruito le basi del mio approccio strategico ai contenuti.',
      skills: [
        { id: 'trend-research', name: 'Trend research' },
        { id: 'digital-strategy', name: 'Digital strategy' },
        { id: 'content-strategy', name: 'Content strategy' },
      ],
      district: {
        id: 'creative-district',
        label: 'Distretto creativo',
        palette: ['#e95f78', '#45c7d4', '#f0c163'],
        landmark: 'Murales e studio digitale',
      },
    },
    {
      id: 'sg-holding',
      name: 'SG Holding',
      kind: 'work',
      order: 2,
      building: 'events-hall',
      logo: { key: 'logo-sg-holding', path: 'assets/logos/sg-holding.png', alt: 'SG Holding' },
      period: '2017–2018',
      role: 'Creative Strategist',
      summary: 'Insight culturali trasformati in strategie creative, eventi e branded content.',
      activities: [
        'Sviluppo di strategie creative da insight culturali e trend',
        'Ideazione di eventi e formati di branded content',
        'Traduzione della ricerca in concept di comunicazione',
      ],
      experience: 'Ho imparato a trasformare insight culturali in idee, eventi e formati concreti, collegando strategia creativa ed esperienza del pubblico.',
      skills: [
        { id: 'cultural-insight', name: 'Cultural insight' },
        { id: 'creative-strategy', name: 'Creative strategy' },
        { id: 'branded-content', name: 'Branded content' },
      ],
      district: {
        id: 'events-plaza',
        label: 'Piazza degli eventi',
        palette: ['#6b356b', '#f5cc4a', '#d98b51'],
        landmark: 'Palco, banner e luci',
      },
    },
    {
      id: 'wunderman-thompson',
      name: 'Wunderman Thompson',
      kind: 'work',
      order: 3,
      building: 'insight-observatory',
      logo: { key: 'logo-wunderman-thompson', path: 'assets/logos/wunderman-thompson.png', alt: 'Wunderman Thompson' },
      period: '2018–2021',
      role: 'Research & Insight Analyst',
      summary: 'Social analytics, reputazione e scenari di crisi tradotti in insight operativi.',
      activities: [
        'Social analytics e monitoraggio della reputazione',
        'Analisi di scenari di crisi con le PR',
        'Report e insight per media e contenuti',
      ],
      experience: 'Ho consolidato il mio metodo di ricerca lavorando su reputazione, segnali social e scenari di crisi, trasformando i dati in indicazioni utili per media, contenuti e PR.',
      skills: [
        { id: 'social-analytics', name: 'Social analytics' },
        { id: 'reputation-monitoring', name: 'Reputation monitoring' },
        { id: 'crisis-analysis', name: 'Crisis analysis' },
      ],
      district: {
        id: 'insight-garden',
        label: 'Giardino degli insight',
        palette: ['#5a53a8', '#87bde4', '#8cf0e1'],
        landmark: 'Osservatorio e flussi dati',
      },
    },
    {
      id: 'armando-testa',
      name: 'Armando Testa',
      kind: 'work',
      order: 4,
      building: 'communication-house',
      logo: { key: 'logo-armando-testa', path: 'assets/logos/armando-testa.svg', alt: 'Armando Testa' },
      period: '2021',
      role: 'Data Analyst Supervisor',
      summary: 'Text analytics e KPI per leggere reputazione, contenuti social e performance.',
      activities: [
        'Analisi della reputazione e dei contenuti social',
        'Text analytics, sentiment, trend e benchmark',
        'Costruzione di KPI dashboard',
      ],
      experience: 'Ho unito analisi testuale e misurazione delle performance, rendendo sentiment, trend e benchmark leggibili attraverso KPI e dashboard operative.',
      skills: [
        { id: 'text-analytics', name: 'Text analytics' },
        { id: 'sentiment-analysis', name: 'Sentiment analysis' },
        { id: 'kpi-dashboard', name: 'KPI dashboard' },
      ],
      district: {
        id: 'communication-quarter',
        label: 'Quartiere della comunicazione',
        palette: ['#d94242', '#f4dfaa', '#e96b39'],
        landmark: 'Affissioni e forme grafiche',
      },
    },
    {
      id: 'dentsu',
      name: 'Dentsu',
      kind: 'work',
      order: 5,
      building: 'research-lab',
      logo: { key: 'logo-dentsu', path: 'assets/logos/dentsu.svg', alt: 'Dentsu' },
      period: '2021–2022',
      role: 'Research Insight Supervisor',
      summary: 'Consumer research e neuroscienze trasformate in insight per creatività e stakeholder.',
      activities: [
        'Consumer research a supporto della creatività',
        'Neuroscienze e analisi data-driven',
        'Sintesi degli insight per stakeholder e team',
      ],
      experience: 'Ho approfondito consumer research e neuroscienze, traducendo analisi complesse in insight chiari per creatività, stakeholder e decisioni di progetto.',
      skills: [
        { id: 'consumer-research', name: 'Consumer research' },
        { id: 'neuroscience', name: 'Neuroscience' },
        { id: 'stakeholder-insight', name: 'Stakeholder insight' },
      ],
      district: {
        id: 'media-research-district',
        label: 'Distretto media e ricerca',
        palette: ['#302c70', '#e9539d', '#e8edf3'],
        landmark: 'Schermi e laboratorio',
      },
    },
    {
      id: 'ey',
      name: 'EY',
      kind: 'work',
      order: 6,
      building: 'ai-citadel',
      logo: { key: 'logo-ey', path: 'assets/logos/ey.svg', alt: 'EY' },
      period: '2022–oggi',
      role: 'Manager, Research & Insight',
      summary: 'Research & Insight guidati da reputazione, dati, GenAI, automazione e innovazione.',
      activities: [
        'Gestione di social listening, reputation analysis e progetti data-driven',
        'Applicazione di GenAI e automazione ai processi di ricerca',
        'Sviluppo di dashboard, modelli strategici e data strategy',
      ],
      experience: 'Oggi guido progetti di Research & Insight che integrano reputazione, dati, GenAI e automazione. Trasformo l’analisi in modelli strategici e strumenti utili alle decisioni.',
      skills: [
        { id: 'research-leadership', name: 'Research leadership' },
        { id: 'genai-automation', name: 'GenAI & automation' },
        { id: 'data-strategy', name: 'Data strategy' },
      ],
      district: {
        id: 'ai-leadership-citadel',
        label: 'Cittadella AI e leadership',
        palette: ['#222b35', '#ffe23f', '#d8dde2'],
        landmark: 'Data hub e torre luminosa',
      },
    },
  ],
  contact: {
    linkedin: 'https://www.linkedin.com/in/vincenzoalbertomarrari/',
    email: 'vincenzoalbertomarrari@gmail.com',
  },
}
~~~

- [ ] **Step 5: Expand runtime validation**

Replace `src/data/validateCareerData.ts` with validation that checks every field and rejects extra contact keys:

~~~ts
import type { CareerData } from './types'

function object(value: unknown, path: string): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(path + ' must be an object')
  }
}

function text(value: unknown, path: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(path + ' must be a non-empty string')
  }
}

function textArray(value: unknown, path: string): asserts value is string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(path + ' must be a non-empty array')
  }
  value.forEach((entry, index) => text(entry, path + '[' + index + ']'))
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
  const orders = new Set<number>()
  value.locations.forEach((entry, index) => {
    const path = 'locations[' + index + ']'
    object(entry, path)
    text(entry.id, path + '.id')
    if (ids.has(entry.id)) throw new Error('Duplicate location id: ' + entry.id)
    ids.add(entry.id)
    if (entry.kind !== 'work') throw new Error(path + '.kind must be work')
    if (!Number.isInteger(entry.order) || Number(entry.order) < 1) {
      throw new Error(path + '.order must be a positive integer')
    }
    const order = Number(entry.order)
    if (orders.has(order)) throw new Error('Duplicate location order: ' + order)
    orders.add(order)

    text(entry.name, path + '.name')
    text(entry.building, path + '.building')
    text(entry.period, path + '.period')
    text(entry.role, path + '.role')
    text(entry.summary, path + '.summary')
    textArray(entry.activities, path + '.activities')
    text(entry.experience, path + '.experience')

    object(entry.logo, path + '.logo')
    text(entry.logo.key, path + '.logo.key')
    text(entry.logo.path, path + '.logo.path')
    text(entry.logo.alt, path + '.logo.alt')

    if (!Array.isArray(entry.skills) || entry.skills.length === 0) {
      throw new Error(path + '.skills must be a non-empty array')
    }
    entry.skills.forEach((skill, skillIndex) => {
      object(skill, path + '.skills[' + skillIndex + ']')
      text(skill.id, path + '.skills[' + skillIndex + '].id')
      text(skill.name, path + '.skills[' + skillIndex + '].name')
    })

    object(entry.district, path + '.district')
    text(entry.district.id, path + '.district.id')
    text(entry.district.label, path + '.district.label')
    text(entry.district.landmark, path + '.district.landmark')
    if (!Array.isArray(entry.district.palette) || entry.district.palette.length !== 3) {
      throw new Error(path + '.district.palette must contain three colors')
    }
    entry.district.palette.forEach((color, colorIndex) =>
      text(color, path + '.district.palette[' + colorIndex + ']'),
    )
  })

  object(value.contact, 'contact')
  const allowed = new Set(['linkedin', 'email', 'cvUrl'])
  for (const key of Object.keys(value.contact)) {
    if (!allowed.has(key)) throw new Error('contact contains forbidden field: ' + key)
  }
  text(value.contact.linkedin, 'contact.linkedin')
  text(value.contact.email, 'contact.email')
  if (!String(value.contact.linkedin).startsWith('https://www.linkedin.com/')) {
    throw new Error('contact.linkedin must be a LinkedIn URL')
  }
  if (!String(value.contact.email).includes('@')) {
    throw new Error('contact.email must be an email address')
  }
  if (value.contact.cvUrl !== undefined) text(value.contact.cvUrl, 'contact.cvUrl')
}
~~~

- [ ] **Step 6: Run tests and commit**

Run:

~~~bash
npm test -- tests/data/career.test.ts tests/data/validateCareerData.test.ts
~~~

Expected: both files PASS.

~~~bash
git add src/data/types.ts src/data/career.ts src/data/validateCareerData.ts tests/data
git commit -m "feat: add six real career locations"
~~~

---

### Task 2: Original city background, six logos, and asset provenance

**Files:**
- Create: `public/assets/world/career-city.png`
- Create: `public/assets/logos/the-big-now.png`
- Create: `public/assets/logos/sg-holding.png`
- Create: `public/assets/logos/wunderman-thompson.png`
- Create: `public/assets/logos/armando-testa.svg`
- Create: `public/assets/logos/dentsu.svg`
- Create: `public/assets/logos/ey.svg`
- Modify: `public/assets/CREDITS.md`
- Modify: `.gitignore`
- Create: `tests/data/assets.test.ts`

**Interfaces:**
- Consumes: every `location.logo.path` from Task 1.
- Produces: one 1680×941 original world image and six local logo files addressable through Vite `public/` paths.

- [ ] **Step 1: Write the failing asset completeness test**

Create `tests/data/assets.test.ts`:

~~~ts
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { careerData } from '../../src/data/career'

describe('career assets', () => {
  it('include lo sfondo top-down approvato', () => {
    const path = join(process.cwd(), 'public/assets/world/career-city.png')
    expect(existsSync(path)).toBe(true)
    const png = readFileSync(path)
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1680, 941])
  })

  it('include un logo locale per ogni azienda', () => {
    for (const location of careerData.locations) {
      expect(
        existsSync(join(process.cwd(), 'public', location.logo.path)),
        location.logo.path,
      ).toBe(true)
    }
  })

  it('documenta tutte le aziende nei credits', async () => {
    const credits = await import('node:fs/promises').then(({ readFile }) =>
      readFile(join(process.cwd(), 'public/assets/CREDITS.md'), 'utf8'),
    )
    for (const location of careerData.locations) {
      expect(credits).toContain(location.name)
    }
  })
})
~~~

- [ ] **Step 2: Run the test and verify RED**

Run:

~~~bash
npm test -- tests/data/assets.test.ts
~~~

Expected: FAIL because the city and logo files do not exist.

- [ ] **Step 3: Generate the final world background from the approved concept**

Use the image-generation skill with the approved reference image:

`/Users/vincenzoalbertomarrari/.codex/generated_images/019ee8dd-c888-74e0-bd44-aa178f105253/exec-030756a6-6e10-4423-b132-f994b7d6e0c2.png`

Use this exact edit prompt:

~~~text
Create the final browser-game world background from this approved concept.
Keep one fixed top-down orthographic 16-bit pixel-art camera and the same rich outdoor density.
Keep exactly six exterior office districts arranged as three across the top and three across the bottom.
Keep broad continuous walkable roads linking every district.
Remove the baked-in player character completely.
Keep one blank high-contrast sign plaque at the entrance of every building for later logo overlays.
Do not include readable text, company marks, UI, hearts, inventory, labels, characters, or watermarks.
Keep entrances visible and collision silhouettes simple.
The six areas must remain visually distinct but part of one coherent city.
~~~

Copy the selected output to `public/assets/world/career-city.png`. Preserve the returned source under `$CODEX_HOME/generated_images`. If the generated dimensions differ, crop once to the approved 1680×941 composition without changing the camera angle; do not stretch the image.

- [ ] **Step 4: Acquire and normalize every period-correct logo**

Create the exact paths listed above. Preserve aspect ratio and transparent backgrounds.

Use these verified sources:

| Output | Source | Retrieval rule |
|---|---|---|
| `the-big-now.png` | https://www.behance.net/gallery/23303521/THE-BIG-NOW-Brand-Image | Download the 2015 identity logo image; crop only surrounding whitespace |
| `sg-holding.png` | https://www.adcgroup.it/e20-express/news/industry/agenzie/sinergie.html | Download the March 2017 rebrand image showing the line above “SG Holding”; do not substitute Japanese SG Holdings |
| `wunderman-thompson.png` | https://commons.wikimedia.org/wiki/Special:Redirect/file/Wunderman_thompson_logo.png | Preserve the 2019 blue plus-sign identity |
| `armando-testa.svg` | https://www.armandotesta.it/ | Use the official header logo asset |
| `dentsu.svg` | https://commons.wikimedia.org/wiki/Special:Redirect/file/Dentsu-logo_black.svg | Preserve the official black wordmark |
| `ey.svg` | https://commons.wikimedia.org/wiki/Special:Redirect/file/EY_logo_2019.svg | Preserve the 2019 mark used during the employment period |

For the three Commons files, run:

~~~bash
curl -L "https://commons.wikimedia.org/wiki/Special:Redirect/file/Wunderman_thompson_logo.png" -o public/assets/logos/wunderman-thompson.png
curl -L "https://commons.wikimedia.org/wiki/Special:Redirect/file/Dentsu-logo_black.svg" -o public/assets/logos/dentsu.svg
curl -L "https://commons.wikimedia.org/wiki/Special:Redirect/file/EY_logo_2019.svg" -o public/assets/logos/ey.svg
~~~

For The Big Now, SG Holding, and Armando Testa, use the in-app browser page-assets inspector to save the actual image resource from the listed page. Do not redraw a wordmark and do not use screenshots containing article text.

- [ ] **Step 5: Record provenance and ignore companion artifacts**

Append `.superpowers/` to `.gitignore`.

Replace `public/assets/CREDITS.md` with:

~~~markdown
# Asset credits

## World

- Career city background — original AI-assisted pixel-art concept generated for this project from a user-approved prompt on 2026-06-21. No Nintendo or third-party game assets are embedded.

## Company marks

Company names and marks are shown only to identify factual employment history. Their appearance does not imply endorsement of this portfolio.

| Company | Local file | Source | Retrieved | Note |
|---|---|---|---|---|
| The Big Now | logos/the-big-now.png | https://www.behance.net/gallery/23303521/THE-BIG-NOW-Brand-Image | 2026-06-21 | Historical 2015 identity; trademark remains with its owner |
| SG Holding | logos/sg-holding.png | https://www.adcgroup.it/e20-express/news/industry/agenzie/sinergie.html | 2026-06-21 | March 2017 rebrand; not SG Holdings Japan |
| Wunderman Thompson | logos/wunderman-thompson.png | https://commons.wikimedia.org/wiki/File:Wunderman_thompson_logo.png | 2026-06-21 | Historical 2019 identity; Commons page records CC BY-SA 4.0 |
| Armando Testa | logos/armando-testa.svg | https://www.armandotesta.it/ | 2026-06-21 | Official site asset; trademark remains with its owner |
| Dentsu | logos/dentsu.svg | https://commons.wikimedia.org/wiki/File:Dentsu-logo_black.svg | 2026-06-21 | Source attributes the mark to Dentsu; Commons page records CC BY-SA 4.0 |
| EY | logos/ey.svg | https://commons.wikimedia.org/wiki/File:EY_logo_2019.svg | 2026-06-21 | 2019 mark; Commons classifies the simple text logo as public domain, trademark restrictions still apply |
~~~

- [ ] **Step 6: Run tests and commit**

Run:

~~~bash
npm test -- tests/data/assets.test.ts
~~~

Expected: PASS for the background, all six logos, and credits.

~~~bash
git add .gitignore public/assets tests/data/assets.test.ts
git commit -m "assets: add career city and company marks"
~~~

---

### Task 3: Deterministic six-district object map

**Files:**
- Create: `scripts/create-career-city-map.mjs`
- Create: `public/maps/career-city.json`
- Create: `tests/maps/careerCityMap.test.ts`
- Delete: `public/maps/first-location.json`
- Delete: `tests/maps/firstLocationMap.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: location IDs from Task 1 and the approved 1680×941 city composition from Task 2.
- Produces: Tiled-compatible `entities` and `collisions` layers with six `location` objects, six `interaction` points, one `spawn`, and one `contact` point.

- [ ] **Step 1: Write the failing map contract test**

Create `tests/maps/careerCityMap.test.ts`:

~~~ts
import { expect, it } from 'vitest'
import { careerData } from '../../src/data/career'
import map from '../../public/maps/career-city.json'

type MapObject = {
  type: string
  properties?: Array<{ name: string; value: unknown }>
}

const layer = (name: string) => map.layers.find((entry) => entry.name === name)

it('contiene sei sedi e sei ingressi risolvibili', () => {
  const entities = (layer('entities')?.objects ?? []) as MapObject[]
  const locations = entities.filter(({ type }) => type === 'location')
  const interactions = entities.filter(({ type }) => type === 'interaction')
  const refIds = locations.map(({ properties }) =>
    properties?.find(({ name }) => name === 'refId')?.value,
  )

  expect(locations).toHaveLength(6)
  expect(interactions).toHaveLength(6)
  expect(refIds).toEqual(careerData.locations.map(({ id }) => id))
})

it('dichiara spawn, contatti e collisioni', () => {
  const entities = (layer('entities')?.objects ?? []) as MapObject[]
  expect(entities.filter(({ type }) => type === 'spawn')).toHaveLength(1)
  expect(entities.filter(({ type }) => type === 'contact')).toHaveLength(1)
  expect(layer('collisions')?.objects.length).toBeGreaterThanOrEqual(10)
})

it('usa le dimensioni dello sfondo approvato', () => {
  expect(map).toMatchObject({
    width: 1680,
    height: 941,
    tilewidth: 1,
    tileheight: 1,
    orientation: 'orthogonal',
  })
})
~~~

- [ ] **Step 2: Run the test and verify RED**

Run:

~~~bash
npm test -- tests/maps/careerCityMap.test.ts
~~~

Expected: FAIL because `public/maps/career-city.json` does not exist.

- [ ] **Step 3: Create the deterministic map generator**

Create `scripts/create-career-city-map.mjs`:

~~~js
import { mkdirSync, writeFileSync } from 'node:fs'

const locations = [
  { refId: 'the-big-now', x: 90, y: 48, width: 390, height: 340, doorX: 286, doorY: 344 },
  { refId: 'sg-holding', x: 646, y: 34, width: 360, height: 340, doorX: 826, doorY: 334 },
  { refId: 'wunderman-thompson', x: 1138, y: 42, width: 430, height: 350, doorX: 1352, doorY: 346 },
  { refId: 'armando-testa', x: 70, y: 486, width: 450, height: 330, doorX: 296, doorY: 760 },
  { refId: 'dentsu', x: 610, y: 484, width: 430, height: 326, doorX: 826, doorY: 754 },
  { refId: 'ey', x: 1118, y: 454, width: 470, height: 390, doorX: 1352, doorY: 786 },
]

let objectId = 1
const point = (name, type, x, y, properties = []) => ({
  id: objectId++, name, type, point: true, x, y, properties,
})
const rectangle = (name, type, x, y, width, height, properties = []) => ({
  id: objectId++, name, type, x, y, width, height, properties,
})
const ref = (value) => [{ name: 'refId', type: 'string', value }]

const entities = [
  point('spawn', 'spawn', 118, 420),
  ...locations.flatMap((entry) => [
    rectangle(
      entry.refId,
      'location',
      entry.x,
      entry.y,
      entry.width,
      entry.height,
      ref(entry.refId),
    ),
    point(entry.refId + '-door', 'interaction', entry.doorX, entry.doorY, ref(entry.refId)),
  ]),
  point('public-contact', 'contact', 254, 868),
]

const collisions = [
  rectangle('north', 'boundary', 0, 0, 1680, 24),
  rectangle('south', 'boundary', 0, 917, 1680, 24),
  rectangle('west', 'boundary', 0, 0, 24, 941),
  rectangle('east', 'boundary', 1656, 0, 24, 941),
  ...locations.map((entry) =>
    rectangle(
      entry.refId + '-building',
      'building',
      entry.x + 46,
      entry.y + 20,
      entry.width - 92,
      entry.height - 92,
    ),
  ),
  rectangle('top-water', 'water', 1010, 22, 112, 260),
  rectangle('left-canal', 'water', 520, 274, 74, 430),
  rectangle('bottom-water', 'water', 0, 884, 1680, 57),
]

const map = {
  compressionlevel: -1,
  width: 1680,
  height: 941,
  infinite: false,
  layers: [
    { id: 1, name: 'entities', type: 'objectgroup', objects: entities, opacity: 1, visible: true, x: 0, y: 0 },
    { id: 2, name: 'collisions', type: 'objectgroup', objects: collisions, opacity: 1, visible: true, x: 0, y: 0 },
  ],
  nextlayerid: 3,
  nextobjectid: objectId,
  orientation: 'orthogonal',
  renderorder: 'right-down',
  tiledversion: '1.10.2',
  tileheight: 1,
  tilewidth: 1,
  tilesets: [],
  type: 'map',
  version: '1.10',
}

mkdirSync('public/maps', { recursive: true })
writeFileSync('public/maps/career-city.json', JSON.stringify(map, null, 2) + '\n')
~~~

Add to `package.json` scripts:

~~~json
{
  "map:build": "node scripts/create-career-city-map.mjs"
}
~~~

- [ ] **Step 4: Generate the map and verify GREEN**

Run:

~~~bash
npm run map:build
npm test -- tests/maps/careerCityMap.test.ts
~~~

Expected: the map is regenerated deterministically and all three tests PASS.

- [ ] **Step 5: Remove the old demo map and commit**

Delete `public/maps/first-location.json` and `tests/maps/firstLocationMap.test.ts`.

~~~bash
git add package.json scripts/create-career-city-map.mjs public/maps tests/maps
git commit -m "feat: add six-district career map"
~~~

---

### Task 4: Load and render the top-down city with logo overlays

**Files:**
- Create: `src/ui/fitWithin.ts`
- Create: `tests/ui/fitWithin.test.ts`
- Modify: `src/scenes/PreloadScene.ts`
- Modify: `src/scenes/WorldScene.ts`
- Modify: `tests/systems/WorldResolver.test.ts`

**Interfaces:**
- Consumes: `careerData.locations`, `career-city` map objects, logo keys and paths.
- Produces: `fitWithin(sourceWidth, sourceHeight, maxWidth, maxHeight)` and a world that emits `location:show`, `contact:show`, and `journal:update`.

- [ ] **Step 1: Write the failing aspect-ratio and resolver tests**

Create `tests/ui/fitWithin.test.ts`:

~~~ts
import { expect, it } from 'vitest'
import { fitWithin } from '../../src/ui/fitWithin'

it('ridimensiona un logo largo senza deformarlo', () => {
  expect(fitWithin(400, 100, 112, 40)).toEqual({ width: 112, height: 28 })
})

it('non ingrandisce un logo già piccolo', () => {
  expect(fitWithin(60, 30, 112, 40)).toEqual({ width: 60, height: 30 })
})
~~~

Update `tests/systems/WorldResolver.test.ts` to resolve a real ID:

~~~ts
import { expect, it } from 'vitest'
import { careerData } from '../../src/data/career'
import { resolveLocationRef } from '../../src/systems/WorldResolver'

it('risolve il refId Tiled nella sede carriera', () => {
  const object = { properties: [{ name: 'refId', value: 'wunderman-thompson' }] }
  expect(resolveLocationRef(object, careerData).name).toBe('Wunderman Thompson')
})

it('segnala un refId senza contenuto associato', () => {
  const object = { properties: [{ name: 'refId', value: 'missing' }] }
  expect(() => resolveLocationRef(object, careerData)).toThrow('Unknown location refId: missing')
})
~~~

- [ ] **Step 2: Run the tests and verify RED**

Run:

~~~bash
npm test -- tests/ui/fitWithin.test.ts tests/systems/WorldResolver.test.ts
~~~

Expected: `fitWithin` FAILS because it does not exist; resolver test passes only after Task 1 data exists.

- [ ] **Step 3: Implement aspect-ratio-safe sizing**

Create `src/ui/fitWithin.ts`:

~~~ts
export function fitWithin(
  sourceWidth: number,
  sourceHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight, 1)
  return {
    width: Math.round(sourceWidth * scale),
    height: Math.round(sourceHeight * scale),
  }
}
~~~

- [ ] **Step 4: Replace preload with city and dynamic logo loading**

Replace `src/scenes/PreloadScene.ts` with:

~~~ts
import Phaser from 'phaser'
import { careerData } from '../data/career'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  preload(): void {
    this.load.tilemapTiledJSON('career-city', 'maps/career-city.json')
    this.load.image('career-city-background', 'assets/world/career-city.png')
    for (const location of careerData.locations) {
      this.load.image(location.logo.key, location.logo.path)
    }
  }

  create(): void {
    this.createHeroTexture()
    this.scene.start('world')
  }

  private createHeroTexture(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false)
    graphics.fillStyle(0xf2d07a).fillRect(6, 0, 12, 8)
    graphics.fillStyle(0x315c45).fillRect(3, 8, 18, 14)
    graphics.fillStyle(0x19352a).fillRect(4, 22, 6, 6).fillRect(14, 22, 6, 6)
    graphics.generateTexture('hero', 24, 28)
    graphics.destroy()
  }
}
~~~

- [ ] **Step 5: Replace WorldScene with multi-location rendering**

Replace `src/scenes/WorldScene.ts` with:

~~~ts
import Phaser from 'phaser'
import { careerData } from '../data/career'
import type { Location } from '../data/types'
import { nearestInteraction } from '../systems/InteractionSystem'
import { JournalState } from '../systems/JournalState'
import { movementVector } from '../systems/MovementSystem'
import { resolveLocationRef } from '../systems/WorldResolver'
import { fitWithin } from '../ui/fitWithin'

interface DirectionKeys {
  W: Phaser.Input.Keyboard.Key
  A: Phaser.Input.Keyboard.Key
  S: Phaser.Input.Keyboard.Key
  D: Phaser.Input.Keyboard.Key
}

interface TiledObject {
  id: number
  name: string
  type: string
  x?: number
  y?: number
  width?: number
  height?: number
  properties?: Array<{ name: string; value: unknown }>
}

type WorldInteraction =
  | { id: string; x: number; y: number; kind: 'location'; location: Location }
  | { id: string; x: number; y: number; kind: 'contact' }

const PLAYER_SPEED = 160
const INTERACTION_DISTANCE = 72

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private directionKeys!: DirectionKeys
  private actionKeys: Phaser.Input.Keyboard.Key[] = []
  private interactions: WorldInteraction[] = []
  private readonly journal = new JournalState(careerData.locations.length)

  constructor() {
    super('world')
  }

  create(): void {
    const map = this.make.tilemap({ key: 'career-city' })
    const entities = (map.getObjectLayer('entities')?.objects ?? []) as TiledObject[]
    const worldWidth = map.widthInPixels
    const worldHeight = map.heightInPixels

    this.add.image(0, 0, 'career-city-background').setOrigin(0).setDepth(0)

    for (const object of entities.filter(({ type }) => type === 'location')) {
      this.renderLocationLogo(object, resolveLocationRef(object, careerData))
    }

    const spawn = entities.find(({ type }) => type === 'spawn')
    if (!spawn?.x || !spawn.y) throw new Error('Tilemap is missing a spawn object')

    this.player = this.physics.add.sprite(spawn.x, spawn.y, careerData.player.sprite)
    this.player.setDepth(20).setCollideWorldBounds(true)
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setSize(18, 22).setOffset(3, 6)

    this.createColliders(map)
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight)
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight)
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12)

    const locations: WorldInteraction[] = entities
      .filter(({ type }) => type === 'interaction')
      .map((object) => ({
        id: object.name,
        x: object.x ?? 0,
        y: object.y ?? 0,
        kind: 'location',
        location: resolveLocationRef(object, careerData),
      }))
    const contact = entities.find(({ type }) => type === 'contact')
    this.interactions = contact
      ? [...locations, { id: contact.name, x: contact.x ?? 0, y: contact.y ?? 0, kind: 'contact' }]
      : locations

    const keyboard = this.input.keyboard
    if (!keyboard) throw new Error('Keyboard input is unavailable')
    this.cursors = keyboard.createCursorKeys()
    this.directionKeys = keyboard.addKeys('W,A,S,D') as DirectionKeys
    this.actionKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
    ]

    this.registry.set('panel-open', false)
    this.registry.set('touch-vector', { x: 0, y: 0 })
    this.registry.set('touch-action', false)
    this.scene.launch('ui')
    this.game.events.emit('journal:update', this.journal.snapshot())
  }

  update(): void {
    if (this.registry.get('panel-open') === true) {
      this.player.setVelocity(0, 0)
      return
    }

    const touch = this.registry.get('touch-vector') as { x: number; y: number } | undefined
    const horizontal =
      Number(this.cursors.right.isDown || this.directionKeys.D.isDown) -
      Number(this.cursors.left.isDown || this.directionKeys.A.isDown) +
      (touch?.x ?? 0)
    const vertical =
      Number(this.cursors.down.isDown || this.directionKeys.S.isDown) -
      Number(this.cursors.up.isDown || this.directionKeys.W.isDown) +
      (touch?.y ?? 0)
    const velocity = movementVector(horizontal, vertical, PLAYER_SPEED)
    this.player.setVelocity(velocity.x, velocity.y)

    const target = nearestInteraction(
      { x: this.player.x, y: this.player.y },
      this.interactions,
      INTERACTION_DISTANCE,
    )
    this.game.events.emit('interaction:prompt', Boolean(target))

    const keyboardAction = this.actionKeys.some((key) => Phaser.Input.Keyboard.JustDown(key))
    const touchAction = this.registry.get('touch-action') === true
    if (touchAction) this.registry.set('touch-action', false)
    if (!target || (!keyboardAction && !touchAction)) return

    if (target.kind === 'contact') {
      this.game.events.emit('contact:show', careerData.contact)
      return
    }

    this.journal.discoverLocation(target.location.id)
    this.game.events.emit('journal:update', this.journal.snapshot())
    this.game.events.emit('location:show', target.location)
  }

  private renderLocationLogo(object: TiledObject, location: Location): void {
    const x = (object.x ?? 0) + (object.width ?? 0) / 2
    const y = (object.y ?? 0) + 52
    if (!this.textures.exists(location.logo.key)) {
      this.add.text(x, y, location.name.toUpperCase(), {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#172036',
        backgroundColor: '#fff6d8',
        padding: { x: 8, y: 5 },
      }).setOrigin(0.5).setDepth(10)
      return
    }

    const logo = this.add.image(x, y, location.logo.key).setDepth(10)
    const size = fitWithin(logo.width, logo.height, 112, 40)
    logo.setDisplaySize(size.width, size.height)
  }

  private createColliders(map: Phaser.Tilemaps.Tilemap): void {
    const collisions = map.getObjectLayer('collisions')?.objects ?? []
    collisions.forEach((object) => {
      const rectangle = this.add.rectangle(
        object.x! + object.width! / 2,
        object.y! + object.height! / 2,
        object.width!,
        object.height!,
      )
      rectangle.setVisible(false)
      this.physics.add.existing(rectangle, true)
      this.physics.add.collider(this.player, rectangle)
    })
  }
}
~~~

- [ ] **Step 6: Run tests and commit**

Run:

~~~bash
npm test -- tests/ui/fitWithin.test.ts tests/systems/WorldResolver.test.ts tests/systems/InteractionSystem.test.ts tests/systems/MovementSystem.test.ts
~~~

Expected: all targeted tests PASS.

~~~bash
git add src/scenes src/ui/fitWithin.ts tests/ui/fitWithin.test.ts tests/systems/WorldResolver.test.ts
git commit -m "feat: render six-district career city"
~~~

---

### Task 5: Paginated first-person location stories

**Files:**
- Create: `src/ui/locationPanelPages.ts`
- Create: `tests/ui/locationPanelPages.test.ts`
- Delete: `src/ui/formatLocationPanel.ts`
- Delete: `tests/ui/formatLocationPanel.test.ts`

**Interfaces:**
- Consumes: `Location` from Task 1.
- Produces: `locationPanelPages(location: Location): LocationPanelPage[]` where every page has `eyebrow`, `title`, and `body`.

- [ ] **Step 1: Write the failing pagination test**

Create `tests/ui/locationPanelPages.test.ts`:

~~~ts
import { expect, it } from 'vitest'
import { careerData } from '../../src/data/career'
import { locationPanelPages } from '../../src/ui/locationPanelPages'

it('crea quattro pagine senza perdere contenuti', () => {
  const location = careerData.locations[0]!
  const pages = locationPanelPages(location)

  expect(pages).toHaveLength(4)
  expect(pages[0]).toEqual({
    eyebrow: 'THE BIG NOW · 2016–2017',
    title: 'Digital Strategist',
    body: location.summary,
  })
  expect(pages[1]?.title).toBe('Cosa facevo')
  expect(pages[1]?.body).toContain('• Ricerca di trend e segnali culturali')
  expect(pages[2]).toEqual({
    eyebrow: 'LA MIA ESPERIENZA',
    title: 'Cosa ho imparato',
    body: location.experience,
  })
  expect(pages[3]?.body).toContain('Trend research')
  expect(pages[3]?.body).toContain('Digital strategy')
})
~~~

- [ ] **Step 2: Run the test and verify RED**

Run:

~~~bash
npm test -- tests/ui/locationPanelPages.test.ts
~~~

Expected: FAIL because `locationPanelPages` does not exist.

- [ ] **Step 3: Implement the pure page builder**

Create `src/ui/locationPanelPages.ts`:

~~~ts
import type { Location } from '../data/types'

export interface LocationPanelPage {
  eyebrow: string
  title: string
  body: string
}

export function locationPanelPages(location: Location): LocationPanelPage[] {
  const tools = location.tools?.length ? '\n\nSTRUMENTI\n' + location.tools.join('  •  ') : ''
  return [
    {
      eyebrow: location.name.toUpperCase() + ' · ' + location.period,
      title: location.role,
      body: location.summary,
    },
    {
      eyebrow: location.name.toUpperCase(),
      title: 'Cosa facevo',
      body: location.activities.map((activity) => '• ' + activity).join('\n'),
    },
    {
      eyebrow: 'LA MIA ESPERIENZA',
      title: 'Cosa ho imparato',
      body: location.experience,
    },
    {
      eyebrow: location.district.label.toUpperCase(),
      title: 'Competenze',
      body: location.skills.map(({ name }) => name).join('  •  ') + tools,
    },
  ]
}
~~~

- [ ] **Step 4: Remove the obsolete one-page formatter and verify GREEN**

Delete `src/ui/formatLocationPanel.ts` and `tests/ui/formatLocationPanel.test.ts`.

Run:

~~~bash
npm test -- tests/ui/locationPanelPages.test.ts
~~~

Expected: PASS.

- [ ] **Step 5: Commit**

~~~bash
git add src/ui tests/ui
git commit -m "feat: paginate career location stories"
~~~

---

### Task 6: Visit journal, pixel dialogue UI, and public contacts

**Files:**
- Modify: `src/systems/JournalState.ts`
- Modify: `tests/systems/JournalState.test.ts`
- Create: `src/ui/formatContactPanel.ts`
- Create: `tests/ui/formatContactPanel.test.ts`
- Modify: `src/scenes/UIScene.ts`

**Interfaces:**
- Consumes: `JournalSnapshot` events from `WorldScene`, `locationPanelPages`, and allowlisted `Contact`.
- Produces: `locationProgress`, `formatContactPanel(contact)`, a four-page lower-third story panel, a `SEDI x / 6` HUD, and LinkedIn/email actions.

- [ ] **Step 1: Write failing journal and contact tests**

Replace `tests/systems/JournalState.test.ts` with:

~~~ts
import { describe, expect, it } from 'vitest'
import { JournalState } from '../../src/systems/JournalState'

describe('JournalState', () => {
  it('registra una sede una sola volta e calcola il progresso', () => {
    const journal = new JournalState(6)
    journal.discoverLocation('the-big-now')
    journal.discoverLocation('the-big-now')
    journal.discoverLocation('sg-holding')

    expect(journal.snapshot()).toEqual({
      discoveredLocationIds: ['the-big-now', 'sg-holding'],
      locationCount: 2,
      totalLocations: 6,
      locationProgress: 2 / 6,
    })
  })
})
~~~

Create `tests/ui/formatContactPanel.test.ts`:

~~~ts
import { expect, it } from 'vitest'
import { careerData } from '../../src/data/career'
import { formatContactPanel } from '../../src/ui/formatContactPanel'

it('espone solo LinkedIn e mailto', () => {
  expect(formatContactPanel(careerData.contact)).toEqual({
    title: 'Restiamo in contatto',
    linkedinLabel: 'LinkedIn',
    linkedinUrl: 'https://www.linkedin.com/in/vincenzoalbertomarrari/',
    emailLabel: 'vincenzoalbertomarrari@gmail.com',
    emailUrl: 'mailto:vincenzoalbertomarrari@gmail.com',
  })
})
~~~

- [ ] **Step 2: Run tests and verify RED**

Run:

~~~bash
npm test -- tests/systems/JournalState.test.ts tests/ui/formatContactPanel.test.ts
~~~

Expected: FAIL because the journal still models skills and the contact formatter does not exist.

- [ ] **Step 3: Simplify JournalState to location completion**

Replace `src/systems/JournalState.ts` with:

~~~ts
export interface JournalSnapshot {
  discoveredLocationIds: readonly string[]
  locationCount: number
  totalLocations: number
  locationProgress: number
}

export class JournalState {
  readonly #locations = new Set<string>()

  constructor(private readonly totalLocations: number) {}

  discoverLocation(id: string): void {
    this.#locations.add(id)
  }

  snapshot(): JournalSnapshot {
    return {
      discoveredLocationIds: [...this.#locations],
      locationCount: this.#locations.size,
      totalLocations: this.totalLocations,
      locationProgress: this.totalLocations === 0 ? 0 : this.#locations.size / this.totalLocations,
    }
  }
}
~~~

Create `src/ui/formatContactPanel.ts`:

~~~ts
import type { Contact } from '../data/types'

export interface ContactPanelViewModel {
  title: string
  linkedinLabel: string
  linkedinUrl: string
  emailLabel: string
  emailUrl: string
}

export function formatContactPanel(contact: Contact): ContactPanelViewModel {
  return {
    title: 'Restiamo in contatto',
    linkedinLabel: 'LinkedIn',
    linkedinUrl: contact.linkedin,
    emailLabel: contact.email,
    emailUrl: 'mailto:' + contact.email,
  }
}
~~~

- [ ] **Step 4: Replace UIScene with the paginated pixel dialogue and contact panel**

Replace `src/scenes/UIScene.ts` with:

~~~ts
import Phaser from 'phaser'
import type { Contact, Location } from '../data/types'
import type { JournalSnapshot } from '../systems/JournalState'
import { formatContactPanel, type ContactPanelViewModel } from '../ui/formatContactPanel'
import { fitWithin } from '../ui/fitWithin'
import { locationPanelPages, type LocationPanelPage } from '../ui/locationPanelPages'
import { TouchControls } from '../ui/TouchControls'

export class UIScene extends Phaser.Scene {
  private prompt!: Phaser.GameObjects.Text
  private progress!: Phaser.GameObjects.Text
  private panel!: Phaser.GameObjects.Container
  private eyebrow!: Phaser.GameObjects.Text
  private title!: Phaser.GameObjects.Text
  private body!: Phaser.GameObjects.Text
  private pageLabel!: Phaser.GameObjects.Text
  private panelLogo!: Phaser.GameObjects.Image
  private contactActions!: Phaser.GameObjects.Container
  private touchControls!: TouchControls
  private pages: LocationPanelPage[] = []
  private pageIndex = 0
  private contactView?: ContactPanelViewModel

  constructor() {
    super('ui')
  }

  create(): void {
    this.prompt = this.add.text(480, 494, 'SPAZIO / INVIO — ESPLORA', {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#fff4cc',
      backgroundColor: '#172a1fee',
      padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setVisible(false)

    this.progress = this.add.text(24, 20, 'SEDI 0 / 6', {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#fff4cc',
      backgroundColor: '#172a1fee',
      padding: { x: 12, y: 8 },
    }).setScrollFactor(0).setDepth(100)

    this.panel = this.createPanel()
    this.touchControls = new TouchControls(this)

    this.game.events.on('interaction:prompt', this.onPrompt, this)
    this.game.events.on('location:show', this.showLocation, this)
    this.game.events.on('contact:show', this.showContact, this)
    this.game.events.on('journal:update', this.updateJournal, this)
    this.input.keyboard?.on('keydown-ESC', this.hidePanel, this)
    this.input.keyboard?.on('keydown-RIGHT', this.nextPage, this)
    this.input.keyboard?.on('keydown-LEFT', this.previousPage, this)
    this.input.keyboard?.on('keydown-ENTER', this.nextPage, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.removeListeners, this)
  }

  private createPanel(): Phaser.GameObjects.Container {
    const background = this.add.graphics()
    background.fillStyle(0x0d1813, 0.97).fillRect(0, 0, 888, 244)
    background.lineStyle(4, 0xe2b86b).strokeRect(0, 0, 888, 244)

    this.eyebrow = this.add.text(28, 22, '', {
      fontFamily: 'monospace', fontSize: '14px', color: '#9ed8cc', fontStyle: 'bold',
    })
    this.title = this.add.text(28, 48, '', {
      fontFamily: 'monospace', fontSize: '25px', color: '#f6d889', fontStyle: 'bold',
    })
    this.body = this.add.text(28, 88, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#f5edd6',
      lineSpacing: 6,
      wordWrap: { width: 820 },
    })
    this.pageLabel = this.add.text(770, 206, '', {
      fontFamily: 'monospace', fontSize: '14px', color: '#9ed8cc',
    })
    this.panelLogo = this.add.image(790, 58, 'hero').setVisible(false)

    const linkedin = this.add.text(0, 0, '[ LINKEDIN ]', {
      fontFamily: 'monospace', fontSize: '16px', color: '#9ed8cc', fontStyle: 'bold',
    }).setInteractive({ useHandCursor: true }).on('pointerup', () => {
      if (this.contactView) {
        window.open(this.contactView.linkedinUrl, '_blank', 'noopener,noreferrer')
      }
    })
    const email = this.add.text(170, 0, '[ EMAIL ]', {
      fontFamily: 'monospace', fontSize: '16px', color: '#f6d889', fontStyle: 'bold',
    }).setInteractive({ useHandCursor: true }).on('pointerup', () => {
      if (this.contactView) window.location.href = this.contactView.emailUrl
    })
    this.contactActions = this.add.container(28, 160, [linkedin, email]).setVisible(false)

    const previous = this.add.text(28, 202, '◀', {
      fontFamily: 'monospace', fontSize: '22px', color: '#fff4cc',
    }).setInteractive({ useHandCursor: true }).on('pointerup', this.previousPage, this)
    const next = this.add.text(72, 202, '▶', {
      fontFamily: 'monospace', fontSize: '22px', color: '#fff4cc',
    }).setInteractive({ useHandCursor: true }).on('pointerup', this.nextPage, this)
    const close = this.add.text(842, 16, '×', {
      fontFamily: 'monospace', fontSize: '30px', color: '#fff4cc',
    }).setInteractive({ useHandCursor: true }).on('pointerup', this.hidePanel, this)

    return this.add.container(36, 276, [
      background,
      this.eyebrow,
      this.title,
      this.body,
      this.pageLabel,
      this.panelLogo,
      this.contactActions,
      previous,
      next,
      close,
    ]).setScrollFactor(0).setDepth(200).setVisible(false)
  }

  private onPrompt(visible: boolean): void {
    if (this.registry.get('panel-open') !== true) this.prompt.setVisible(visible)
  }

  private showLocation(location: Location): void {
    this.pages = locationPanelPages(location)
    this.pageIndex = 0
    this.contactView = undefined
    this.contactActions.setVisible(false)
    if (this.textures.exists(location.logo.key)) {
      this.panelLogo.setTexture(location.logo.key)
      const size = fitWithin(this.panelLogo.width, this.panelLogo.height, 88, 42)
      this.panelLogo.setDisplaySize(size.width, size.height).setVisible(true)
    } else {
      this.panelLogo.setVisible(false)
    }
    this.openPanel()
    this.renderPage()
  }

  private showContact(contact: Contact): void {
    const view = formatContactPanel(contact)
    this.contactView = view
    this.panelLogo.setVisible(false)
    this.contactActions.setVisible(true)
    this.pages = [{
      eyebrow: 'CONTATTI PUBBLICI',
      title: view.title,
      body: 'Scegli un canale pubblico.\n\n' + view.linkedinUrl + '\n' + view.emailLabel,
    }]
    this.pageIndex = 0
    this.openPanel()
    this.renderPage()
  }

  private openPanel(): void {
    this.registry.set('panel-open', true)
    this.prompt.setVisible(false)
    this.panel.setVisible(true)
    this.touchControls.setSuppressed(true)
  }

  private renderPage(): void {
    const page = this.pages[this.pageIndex]
    if (!page) return
    this.eyebrow.setText(page.eyebrow)
    this.title.setText(page.title)
    this.body.setText(page.body)
    this.pageLabel.setText(String(this.pageIndex + 1) + ' / ' + String(this.pages.length))
  }

  private nextPage(): void {
    if (!this.panel.visible) return
    if (this.pageIndex < this.pages.length - 1) {
      this.pageIndex += 1
      this.renderPage()
    }
  }

  private previousPage(): void {
    if (!this.panel.visible) return
    if (this.pageIndex > 0) {
      this.pageIndex -= 1
      this.renderPage()
    }
  }

  private updateJournal(snapshot: JournalSnapshot): void {
    this.progress.setText('SEDI ' + snapshot.locationCount + ' / ' + snapshot.totalLocations)
    this.progress.setColor(snapshot.locationProgress === 1 ? '#ffe23f' : '#fff4cc')
  }

  private hidePanel(): void {
    this.registry.set('panel-open', false)
    this.panel.setVisible(false)
    this.contactActions.setVisible(false)
    this.contactView = undefined
    this.touchControls.setSuppressed(false)
  }

  private removeListeners(): void {
    this.game.events.off('interaction:prompt', this.onPrompt, this)
    this.game.events.off('location:show', this.showLocation, this)
    this.game.events.off('contact:show', this.showContact, this)
    this.game.events.off('journal:update', this.updateJournal, this)
    this.input.keyboard?.off('keydown-ESC', this.hidePanel, this)
    this.input.keyboard?.off('keydown-RIGHT', this.nextPage, this)
    this.input.keyboard?.off('keydown-LEFT', this.previousPage, this)
    this.input.keyboard?.off('keydown-ENTER', this.nextPage, this)
    this.touchControls.destroy()
  }
}
~~~

- [ ] **Step 5: Run tests and commit**

Run:

~~~bash
npm test -- tests/systems/JournalState.test.ts tests/ui/locationPanelPages.test.ts tests/ui/formatContactPanel.test.ts
~~~

Expected: all targeted tests PASS.

~~~bash
git add src/systems/JournalState.ts src/scenes/UIScene.ts src/ui/formatContactPanel.ts tests
git commit -m "feat: add career journal and contact panel"
~~~

---

### Task 7: Integration cleanup, full verification, and browser QA

**Files:**
- Modify: `src/style.css` only if the canvas fails the viewport checks below
- Modify: `src/scenes/WorldScene.ts` only for coordinate corrections found during QA
- Modify: `scripts/create-career-city-map.mjs` only for collision corrections found during QA
- Regenerate: `public/maps/career-city.json` after any map correction
- Verify: all files changed in Tasks 1–6

**Interfaces:**
- Consumes: the complete feature from Tasks 1–6.
- Produces: a production build that satisfies every acceptance criterion in the approved spec.

- [ ] **Step 1: Run the complete automated suite**

Run:

~~~bash
npm run map:build
npm test
~~~

Expected: all tests PASS; no test or source file references `demo-studio`, `first-location`, `studio`, or `hello@example.com` except negative assertions.

Run the explicit stale-reference scan:

~~~bash
rg -n "demo-studio|first-location|hello@example.com|Sede dimostrativa" src public tests --glob '!tests/data/career.test.ts'
~~~

Expected: no matches.

- [ ] **Step 2: Build the production bundle**

Run:

~~~bash
npm run build
~~~

Expected: TypeScript and Vite complete successfully. The existing Phaser chunk-size warning is acceptable; compile errors and missing-asset errors are not.

- [ ] **Step 3: Verify the desktop journey in the browser**

Run:

~~~bash
npm run dev -- --host 127.0.0.1
~~~

Use the in-app browser at the printed localhost URL and verify:

1. The first frame is a strict top-down pixel-art city with no modern map UI.
2. The player starts near The Big Now and can reach all six districts.
3. Roads remain walkable; water, buildings, and world boundaries collide.
4. Each blank plaque is covered by the correct logo with preserved aspect ratio.
5. If one logo texture is temporarily renamed, its textual company fallback appears and the location remains usable.
6. Space/Enter opens every entrance story; Right/Left paginate; Esc closes.
7. The story includes role, period, activities, first-person experience, and skills.
8. Revisiting one company does not increase the counter twice.
9. The HUD reaches `SEDI 6 / 6` and changes to the completion color.
10. The contact point shows only LinkedIn and `vincenzoalbertomarrari@gmail.com`.

- [ ] **Step 4: Verify touch and responsive behavior**

In browser device emulation, test one landscape viewport and one portrait viewport:

~~~text
Landscape: 844 × 390
Portrait: 390 × 844
~~~

Verify joystick movement, touch action, panel suppression of controls, next/previous buttons, close button, readable wrapping, integer-looking pixel scaling, and no clipped contact content.

If a collision correction is required, edit only the numeric rectangle in `scripts/create-career-city-map.mjs`, run `npm run map:build`, and rerun `tests/maps/careerCityMap.test.ts`. If UI fit is required, change only canvas/container sizing in `src/style.css`; do not alter the 960×540 logical game size.

- [ ] **Step 5: Re-run final evidence commands**

Run:

~~~bash
npm test
npm run build
git status --short
~~~

Expected: tests and build succeed. `git status --short` shows only the intentional QA corrections, if any.

- [ ] **Step 6: Commit verified integration**

~~~bash
git add src public scripts tests package.json .gitignore
git commit -m "feat: complete six-district career journey"
~~~

After the commit, confirm `git status --short` is empty.
