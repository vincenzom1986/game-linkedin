# Office Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-architect and redesign the office locations on the career map to match the user's scenarios (windmill with rotating blades, Dentsu with cherry trees, Punt e Mes building with door and hippo outside, SG Company stage with crowd).

**Architecture:** Use `generate_image` to generate black-background asset sources. Scale and downsample them using the `pixelate-assets.mjs` pipeline. Preload and register animations in `PreloadScene.ts`. Update positions, collisions, tweens, and spotlight overlays in `WorldScene.ts`.

**Tech Stack:** TypeScript, Phaser 3.90, Node.js, pngjs, Vitest

## Global Constraints
- Proportions of all generated buildings and icons must be preserved during downsampling.
- Windmill blades must rotate seamlessly at runtime without clipping or warping.
- Dentsu garden must remain accessible to the player (stepping stones walkable, collisions only on trees/buildings).
- Armando Testa Punt e Mes building entrance must align with the physics interaction zone.
- SG Company stage must be surrounded by a lively, animated crowd.
- All code must build cleanly and pass all 34 unit tests.

---

### Task 1: Generate Raw Asset Graphics
**Files:**
- Create: `public/assets/logos/cherry-tree.png`
- Create: `public/assets/logos/windmill-body.png`
- Create: `public/assets/logos/windmill-blades.png`
- Create: `public/assets/logos/punt-e-mes-building.png`
- Create: `public/assets/logos/event-stage.png`

**Interfaces:**
- Consumes: None
- Produces: Raw asset files with solid black backgrounds.

- [ ] **Step 1: Generate Cherry Tree**
  Use `generate_image` with prompt:
  "A 16-bit retro RPG style cherry blossom tree (sakura) with pink leaves in full bloom, isolated on a solid black background, single object centered, pixel art"
  Save as: `cherry_tree`

- [ ] **Step 2: Generate Windmill Body**
  Use `generate_image` with prompt:
  "A 16-bit retro RPG style windmill house body made of stone and wood, isolated on a solid black background, single object centered, pixel art, front view"
  Save as: `windmill_body`

- [ ] **Step 3: Generate Windmill Blades**
  Use `generate_image` with prompt:
  "A 16-bit retro RPG style set of four windmill sails or blades connected at a central hub, isolated on a solid black background, single object centered, pixel art"
  Save as: `windmill_blades`

- [ ] **Step 4: Generate Punt e Mes Building**
  Use `generate_image` with prompt:
  "A 16-bit retro RPG style office building shaped like a large red sphere floating directly over a red half-sphere cup, with a wooden door at the base of the cup, isolated on a solid black background, pixel art"
  Save as: `punt_e_mes_building`

- [ ] **Step 5: Generate Event Stage**
  Use `generate_image` with prompt:
  "A 16-bit retro RPG style outdoor music or event stage with metal truss columns, stage platform, spotlights, and black hanging banners, isolated on a solid black background, pixel art"
  Save as: `event_stage`

- [ ] **Step 6: Move generated assets to destination**
  Copy the generated files from the artifacts directory to `public/assets/logos/` renaming them to:
  - `public/assets/logos/cherry-tree.png`
  - `public/assets/logos/windmill-body.png`
  - `public/assets/logos/windmill-blades.png`
  - `public/assets/logos/punt-e-mes-building.png`
  - `public/assets/logos/event-stage.png`

---

### Task 2: Configure & Run Pixelation Pipeline
**Files:**
- Modify: `scripts/pixelate-assets.mjs`

**Interfaces:**
- Consumes: Raw PNG files on disk.
- Produces: Downsampled pixel-art assets with clean transparency.

- [ ] **Step 1: Add new rules and targets in pixelate-assets.mjs**
  Open [pixelate-assets.mjs](file:///Users/vincenzoalbertomarrari/AppAI/Game-LinkedIn/scripts/pixelate-assets.mjs) and append rules for transparency keying (black color keying):
  ```javascript
  'cherry-tree.png': (r, g, b) => r <= 10 && g <= 10 && b <= 10,
  'windmill-body.png': (r, g, b) => r <= 10 && g <= 10 && b <= 10,
  'windmill-blades.png': (r, g, b) => r <= 10 && g <= 10 && b <= 10,
  'punt-e-mes-building.png': (r, g, b) => r <= 10 && g <= 10 && b <= 10,
  'event-stage.png': (r, g, b) => r <= 10 && g <= 10 && b <= 10,
  ```
  And add them to the `targets` object:
  ```javascript
  'cherry-tree.png': { maxW: 64, maxH: 64 },
  'windmill-body.png': { maxW: 120, maxH: 150 },
  'windmill-blades.png': { maxW: 100, maxH: 100 },
  'punt-e-mes-building.png': { maxW: 150, maxH: 200 },
  'event-stage.png': { maxW: 180, maxH: 120 },
  ```
  Ensure these files do NOT get outline styling except for `cherry-tree.png` and `windmill-blades.png`:
  ```javascript
  // Apply outline for actual game assets, but NOT for building facades
  if (file !== 'ey-skyscraper.png' && file !== 'dentsu-building.png' && file !== 'wunderman-thompson-building.png' && file !== 'windmill-body.png' && file !== 'punt-e-mes-building.png' && file !== 'event-stage.png' && !['the-big-now.png', 'armando-testa.png', 'sg-holding.png', 'wunderman-thompson.png'].includes(file)) {
  ```

- [ ] **Step 2: Run the pixelate script**
  Run: `node scripts/pixelate-assets.mjs`
  Expected: Success output showing processed assets and correct pixel scale dimensions.

- [ ] **Step 3: Commit**
  ```bash
  git add scripts/pixelate-assets.mjs public/assets/logos/
  git commit -m "feat: configure and downsample redesigned assets"
  ```

---

### Task 3: Load Assets & Create Sprite Animations
**Files:**
- Modify: `src/scenes/PreloadScene.ts`

**Interfaces:**
- Consumes: Assets on disk.
- Produces: Loaded textures in Phaser, and customized character spritesheet.

- [ ] **Step 1: Update Preload Scene**
  Modify [PreloadScene.ts](file:///Users/vincenzoalbertomarrari/AppAI/Game-LinkedIn/src/scenes/PreloadScene.ts) to load the new assets, replacing `wunderman-thompson-building.png` and adding others:
  ```typescript
  this.load.image('cherry-tree', 'assets/logos/cherry-tree.png')
  this.load.image('windmill-body', 'assets/logos/windmill-body.png')
  this.load.image('windmill-blades', 'assets/logos/windmill-blades.png')
  this.load.image('punt-e-mes-building', 'assets/logos/punt-e-mes-building.png')
  this.load.image('event-stage', 'assets/logos/event-stage.png')
  ```

- [ ] **Step 2: Expand programmatic party-guests spritesheet**
  In `createPartyGuestsSpritesheet()`, draw 6 guests instead of 3 by increasing canvas width to `288` pixels and adding 3 new characters (Diana, Enzo, Francesca):
  ```typescript
  const canvas = document.createElement('canvas')
  canvas.width = 288
  canvas.height = 28
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Guest 1 (Alex) - Frame 0 & 1
  this.drawGuest(ctx, 0, 0, '#f7d0b5', '#2d5380', '#8a5a36', '#111111', false)
  this.drawGuest(ctx, 24, 0, '#f7d0b5', '#2d5380', '#8a5a36', '#111111', true)

  // Guest 2 (Beatrice) - Frame 0 & 1
  this.drawGuest(ctx, 48, 0, '#f1c2a2', '#8a1c14', '#8a1c14', '#e6c280', false)
  this.drawGuest(ctx, 72, 0, '#f1c2a2', '#8a1c14', '#8a1c14', '#e6c280', true)

  // Guest 3 (Carlo) - Frame 0 & 1
  this.drawGuest(ctx, 96, 0, '#e5b290', '#2d3b2d', '#5a5c5a', '#222222', false)
  this.drawGuest(ctx, 120, 0, '#e5b290', '#2d3b2d', '#5a5c5a', '#222222', true)

  // Guest 4 (Diana) - Frame 0 & 1
  this.drawGuest(ctx, 144, 0, '#f9c3a6', '#6b356b', '#2d3b2d', '#8a1c14', false)
  this.drawGuest(ctx, 168, 0, '#f9c3a6', '#6b356b', '#2d3b2d', '#8a1c14', true)

  // Guest 5 (Enzo) - Frame 0 & 1
  this.drawGuest(ctx, 192, 0, '#ecd0b3', '#d98b51', '#222222', '#68573e', false)
  this.drawGuest(ctx, 216, 0, '#ecd0b3', '#d98b51', '#222222', '#68573e', true)

  // Guest 6 (Francesca) - Frame 0 & 1
  this.drawGuest(ctx, 240, 0, '#f7d0b5', '#2d5380', '#8a1c14', '#f5cc4a', false)
  this.drawGuest(ctx, 264, 0, '#f7d0b5', '#2d5380', '#8a1c14', '#f5cc4a', true)
  ```

- [ ] **Step 3: Define talk & dance animations**
  In `createAnimations()`, define the additional talk and dance animations:
  ```typescript
  this.anims.create({
    key: 'diana-talk',
    frames: this.anims.generateFrameNumbers('party-guests', { start: 6, end: 7 }),
    frameRate: 3,
    repeat: -1,
    yoyo: true
  })
  this.anims.create({
    key: 'enzo-talk',
    frames: this.anims.generateFrameNumbers('party-guests', { start: 8, end: 9 }),
    frameRate: 4,
    repeat: -1,
    yoyo: true
  })
  this.anims.create({
    key: 'francesca-talk',
    frames: this.anims.generateFrameNumbers('party-guests', { start: 10, end: 11 }),
    frameRate: 3,
    repeat: -1,
    yoyo: true
  })
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add src/scenes/PreloadScene.ts
  git commit -m "feat: load redesigned images and generate expanded guests spritesheet"
  ```

---

### Task 4: Layout Redesigned Offices in WorldScene
**Files:**
- Modify: `src/scenes/WorldScene.ts`

**Interfaces:**
- Consumes: Loaded textures (`event-stage`, `windmill-body`, `windmill-blades`, `cherry-tree`, `punt-e-mes-building`, `party-guests`, etc.)
- Produces: Completed scene with animated overlays, collisions, and spotlights.

- [ ] **Step 1: Clean up old layout**
  Remove the old `wunderman-thompson-building` overlay, old `punt-e-mes` and `blue-hippo` positioning, and the old three-guest party layout from [WorldScene.ts](file:///Users/vincenzoalbertomarrari/AppAI/Game-LinkedIn/src/scenes/WorldScene.ts).

- [ ] **Step 2: Implement Wunderman Thompson Windmill & Rotation**
  Add the windmill body and rotating blades:
  ```typescript
  const windmillBody = this.physics.add.image(1352, 191, 'windmill-body').setOrigin(0.5).setDepth(5)
  windmillBody.setDisplaySize(120, 150)
  obstacleGroup.add(windmillBody)
  windmillBody.refreshBody()
  const wmBody = windmillBody.body as Phaser.Physics.Arcade.Body
  wmBody.setSize(80, 50).setOffset(20, 100)

  const windmillBlades = this.add.image(1352, 116, 'windmill-blades').setOrigin(0.5).setDepth(6)
  windmillBlades.setDisplaySize(100, 100)
  this.tweens.add({
    targets: windmillBlades,
    angle: 360,
    duration: 6000,
    repeat: -1,
    ease: 'Linear'
  })
  ```

- [ ] **Step 3: Implement Dentsu Building & Cherry Trees**
  Maintain `dentsu-building.png` and add multiple `cherry-tree` sprites around it:
  ```typescript
  // Place cherry trees around Dentsu garden
  const cherryTrees = [
    { x: 670, y: 730 },
    { x: 810, y: 690 },
    { x: 920, y: 730 },
    { x: 910, y: 810 }
  ]
  cherryTrees.forEach(({ x, y }) => {
    const tree = this.physics.add.image(x, y, 'cherry-tree').setDepth(15)
    tree.setDisplaySize(64, 64)
    obstacleGroup.add(tree)
    tree.refreshBody()
    const treeBody = tree.body as Phaser.Physics.Arcade.Body
    treeBody.setSize(24, 16).setOffset(20, 48)
  })
  ```

- [ ] **Step 4: Implement Armando Testa Punt e Mes Building & Hippo**
  Place the custom building shape and the welcoming hippo:
  ```typescript
  const puntEMesBuilding = this.physics.add.image(260, 680, 'punt-e-mes-building').setDepth(12)
  puntEMesBuilding.setDisplaySize(150, 200)
  obstacleGroup.add(puntEMesBuilding)
  puntEMesBuilding.refreshBody()
  const pemBBody = puntEMesBuilding.body as Phaser.Physics.Arcade.Body
  pemBBody.setSize(110, 80).setOffset(20, 120)

  const hippo = this.physics.add.image(350, 750, 'blue-hippo').setDepth(12)
  hippo.setDisplaySize(72, 72)
  obstacleGroup.add(hippo)
  hippo.refreshBody()
  const hippoBody = hippo.body as Phaser.Physics.Arcade.Body
  hippoBody.setSize(54, 30).setOffset(9, 42)

  this.tweens.add({
    targets: hippo,
    angle: { from: -2, to: 2 },
    scaleX: { from: 0.98, to: 1.02 },
    duration: 1500,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  })
  ```

- [ ] **Step 5: Implement SG Company Event Stage, Spotlights & Crowd**
  Overlay the stage at SG Company area:
  ```typescript
  const stage = this.physics.add.image(750, 240, 'event-stage').setDepth(5)
  stage.setDisplaySize(180, 120)
  obstacleGroup.add(stage)
  stage.refreshBody()
  const stageBody = stage.body as Phaser.Physics.Arcade.Body
  stageBody.setSize(160, 80).setOffset(10, 40)

  // Draw 2 rotating spotlight beams
  const spotlight1 = this.add.graphics().setDepth(21).setAlpha(0.3)
  const spotlight2 = this.add.graphics().setDepth(21).setAlpha(0.3)

  this.tweens.add({
    targets: { angle: -15 },
    angle: 15,
    duration: 2500,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
    onUpdate: (tween) => {
      const val1 = tween.getValue()
      spotlight1.clear().fillStyle(0xfff59e, 1)
      spotlight1.slice(680, 190, 120, Phaser.Math.DegToRad(75 + val1), Phaser.Math.DegToRad(105 + val1), false).fillPath()

      const val2 = -val1
      spotlight2.clear().fillStyle(0x9ee0ff, 1)
      spotlight2.slice(820, 190, 120, Phaser.Math.DegToRad(75 + val2), Phaser.Math.DegToRad(105 + val2), false).fillPath()
    }
  })

  // Spawn 6 animated guests dancing/talking
  const guestConfigs = [
    { x: 690, y: 320, anim: 'alex-talk' },
    { x: 715, y: 310, anim: 'beatrice-talk' },
    { x: 740, y: 325, anim: 'carlo-talk' },
    { x: 765, y: 315, anim: 'diana-talk' },
    { x: 790, y: 330, anim: 'enzo-talk' },
    { x: 815, y: 310, anim: 'francesca-talk' }
  ]
  guestConfigs.forEach(({ x, y, anim }, index) => {
    const guest = this.physics.add.sprite(x, y, 'party-guests').setDepth(12)
    guest.anims.play(anim)
    obstacleGroup.add(guest)
    guest.refreshBody()
    const gBody = guest.body as Phaser.Physics.Arcade.Body
    gBody.setSize(18, 12).setOffset(3, 16)

    // Add a dancing/bobbing tween for half of the crowd
    if (index % 2 === 0) {
      this.tweens.add({
        targets: guest,
        y: y - 3,
        duration: 350 + (index * 40),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
    }
  })
  ```

- [ ] **Step 6: Commit**
  ```bash
  git add src/scenes/WorldScene.ts
  git commit -m "feat: layout redesigned offices, windmill animation, spotlights, and event crowd"
  ```

---

### Task 5: Compilation & Test Verification
- [ ] **Step 1: Verify TypeScript & Build**
  Run: `npm run build`
  Expected: Successful compilation without errors.

- [ ] **Step 2: Verify Unit Tests**
  Run: `npm test`
  Expected: All 34 tests pass successfully.
