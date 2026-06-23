# Aesthetic Office Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct stretched logo proportions, replace low-res/tiny crowd with 1:1 scale pixel-art party guests, and compose a unified Zen garden at Dentsu with stepping stones.

**Architecture:** Use the `generate_image` tool to create clean black-background assets. Modify the script `pixelate-assets.mjs` to scale proportional to aspect ratios. Programmatically render guests on a canvas spritesheet in `PreloadScene.ts` to ensure perfect pixel-art quality. Draw stepping stones dynamically in `WorldScene.ts`.

**Tech Stack:** TypeScript, Phaser 3.90, Node.js, pngjs, Vitest

## Global Constraints
- Proportions of logos and sculptures must be preserved.
- SG Company party guests must be scale-proportional to the player character.
- The Dentsu koi pond must not overlap pathway or sign tiles.
- All code must build cleanly and pass all 34 unit tests.

---

### Task 1: Generate Clean Assets on Black Background
**Files:**
- Create: `public/assets/logos/stone-lantern.png`
- Create: `public/assets/logos/japanese-maple.png`
- Create: `public/assets/logos/koi-pond.png`
- Create: `public/assets/logos/punt-e-mes.png`
- Create: `public/assets/logos/blue-hippo.png`

**Interfaces:**
- Consumes: None
- Produces: Clean pixel-art asset files with solid black backgrounds.

- [ ] **Step 1: Generate Stone Lantern**
  Use `generate_image` with prompt:
  "A 16-bit pixel art traditional Japanese stone lantern (toro), isolated on a solid black background, no rulers, no grids, no scales, single object centered, retro top-down RPG style"
  Save as: `stone_lantern`

- [ ] **Step 2: Generate Japanese Maple Tree**
  Use `generate_image` with prompt:
  "A 16-bit pixel art red-leafed Japanese maple tree, isolated on a solid black background, no white borders, single object centered, retro top-down RPG style"
  Save as: `japanese_maple`

- [ ] **Step 3: Generate Koi Pond**
  Use `generate_image` with prompt:
  "A 16-bit pixel art small koi pond with stones and water, top-down view, isolated on a solid black background, single object centered, retro top-down RPG style"
  Save as: `koi_pond`

- [ ] **Step 4: Generate Punt e Mes Sculpture**
  Use `generate_image` with prompt:
  "A 16-bit pixel art sculpture of a solid red sphere floating directly above a red half-sphere bowl, isolated on a solid black background, single object centered"
  Save as: `punt_e_mes`

- [ ] **Step 5: Generate Blue Hippo Sculpture**
  Use `generate_image` with prompt:
  "A 16-bit pixel art cute blue hippo statue standing, isolated on a solid black background, single object centered, retro top-down RPG style"
  Save as: `blue_hippo`

- [ ] **Step 6: Move generated assets to destination**
  Copy the generated files from the artifacts directory to `public/assets/logos/` overwriting the current ones.

---

### Task 2: Update Aspect Ratio Scaling & Black Keying in pixelate-assets.mjs
**Files:**
- Modify: `scripts/pixelate-assets.mjs`

**Interfaces:**
- Consumes: PNG files on disk.
- Produces: Proportional pixelated assets with clean transparency.

- [ ] **Step 1: Update scripts/pixelate-assets.mjs**
  Replace content of `scripts/pixelate-assets.mjs` to parse aspect ratios and use black background keying for newly generated assets. Use the following code replacement block:
  ```javascript
  // Target max boundaries
  const targets = {
    'flying-cow.png': { maxW: 64, maxH: 64 },
    'punt-e-mes.png': { maxW: 48, maxH: 63 },
    'blue-hippo.png': { maxW: 72, maxH: 72 },
    'japanese-maple.png': { maxW: 64, maxH: 64 },
    'stone-lantern.png': { maxW: 24, maxH: 36 },
    'koi-pond.png': { maxW: 64, maxH: 64 },
    'ey-skyscraper.png': { maxW: 378, maxH: 298 },
    'the-big-now.png': { maxW: 50, maxH: 22 },
    'armando-testa.png': { maxW: 50, maxH: 22 },
    'sg-holding.png': { maxW: 50, maxH: 22 },
    'wunderman-thompson.png': { maxW: 50, maxH: 22 }
  };

  // Black background keying rules for regenerated assets
  const blackBackgroundAssets = [
    'stone-lantern.png',
    'japanese-maple.png',
    'koi-pond.png',
    'punt-e-mes.png',
    'blue-hippo.png'
  ];

  // In cleanBackground, check:
  const isBg = a === 0 || (isBlackAsset ? (r <= 10 && g <= 10 && b <= 10) : isBgRule(r, g, b));
  ```
  Ensure the full script compiles and processes all files.

- [ ] **Step 2: Run the pixelate script**
  Run: `PATH=/opt/homebrew/bin:$PATH node scripts/pixelate-assets.mjs`
  Expected: Success output showing processed assets and correct pixel scale dimensions.

- [ ] **Step 3: Verify build**
  Run: `npm run build && npm test`
  Expected: Success

- [ ] **Step 4: Commit**
  ```bash
  git add scripts/pixelate-assets.mjs public/assets/logos/
  git commit -m "fix: downsample and clean assets with correct aspect ratios"
  ```

---

### Task 3: Create Party Guests & Table in PreloadScene
**Files:**
- Modify: `src/scenes/PreloadScene.ts`

**Interfaces:**
- Consumes: Canvas drawing context.
- Produces: Programmatic spritesheets `party-guests` and `party-table`, and talk animations.

- [ ] **Step 1: Implement spritesheet generation in PreloadScene**
  Add the following helper methods to `src/scenes/PreloadScene.ts` inside `create()`:
  ```typescript
  // Call inside create()
  this.createPartyGuestsSpritesheet()
  this.createPartyTableTexture()
  ```
  Implement the methods in the class:
  ```typescript
  private createPartyGuestsSpritesheet(): void {
    const canvas = this.textures.createCanvas('party-guests', 144, 28)
    const ctx = canvas?.getContext()
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

    canvas?.refresh()
    this.textures.addSpriteSheet('party-guests', canvas as any, { frameWidth: 24, frameHeight: 28 })
  }

  private drawGuest(
    ctx: CanvasRenderingContext2D,
    fx: number,
    fy: number,
    skin: string,
    shirt: string,
    pants: string,
    hair: string,
    bob: boolean
  ): void {
    const yOffset = bob ? 1 : 0
    
    // Hair
    ctx.fillStyle = hair
    ctx.fillRect(fx + 7, fy + 0 + yOffset, 10, 3)
    
    // Head
    ctx.fillStyle = skin
    ctx.fillRect(fx + 7, fy + 3 + yOffset, 10, 7)
    
    // Glasses
    ctx.fillStyle = '#0d0d0d'
    ctx.fillRect(fx + 9, fy + 5 + yOffset, 2, 2)
    ctx.fillRect(fx + 13, fy + 5 + yOffset, 2, 2)

    // Shirt/Dress
    ctx.fillStyle = shirt
    ctx.fillRect(fx + 5, fy + 10, 14, 12)

    // Legs
    ctx.fillStyle = pants
    ctx.fillRect(fx + 7, fy + 22, 4, 6)
    ctx.fillRect(fx + 13, fy + 22, 4, 6)
  }

  private createPartyTableTexture(): void {
    let tableCanvas = this.textures.createCanvas('party-table', 24, 28)
    let tCtx = tableCanvas?.getContext()
    if (tCtx) {
      tCtx.fillStyle = '#68573e' // brown legs
      tCtx.fillRect(11, 14, 2, 14)
      tCtx.fillStyle = '#d98b51' // tabletop border
      tCtx.fillRect(4, 8, 16, 6)
      tCtx.fillStyle = '#f5cc4a' // tablecloth
      tCtx.fillRect(6, 6, 12, 4)
      tCtx.fillStyle = '#8a1c14' // red drink cup
      tCtx.fillRect(9, 3, 2, 3)
      tCtx.fillStyle = '#2d5380' // blue drink cup
      tCtx.fillRect(13, 3, 2, 3)
      tableCanvas?.refresh()
    }
  }
  ```

- [ ] **Step 2: Add Guest Animations**
  Modify `createAnimations()` in `PreloadScene.ts` to register animations for talking guests:
  ```typescript
  this.anims.create({
    key: 'alex-talk',
    frames: this.anims.generateFrameNumbers('party-guests', { start: 0, end: 1 }),
    frameRate: 3,
    repeat: -1,
    yoyo: true
  })
  this.anims.create({
    key: 'beatrice-talk',
    frames: this.anims.generateFrameNumbers('party-guests', { start: 2, end: 3 }),
    frameRate: 4,
    repeat: -1,
    yoyo: true
  })
  this.anims.create({
    key: 'carlo-talk',
    frames: this.anims.generateFrameNumbers('party-guests', { start: 4, end: 5 }),
    frameRate: 3,
    repeat: -1,
    yoyo: true
  })
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add src/scenes/PreloadScene.ts
  git commit -m "feat: draw party guests and table programmatically on canvas"
  ```

---

### Task 4: Place Cohesive Details and Scale Sculptures in WorldScene
**Files:**
- Modify: `src/scenes/WorldScene.ts`

**Interfaces:**
- Consumes: Loaded textures (`party-guests`, `party-table`, `stone-lantern`, etc.)
- Produces: Re-designed office details, stepping stones, and proportional assets.

- [ ] **Step 1: Replace old sg-party crowd with guests group**
  Modify `WorldScene.ts` around line 118:
  ```typescript
  // Spawn Guest 1
  const guest1 = this.physics.add.sprite(732, 325, 'party-guests').setDepth(12)
  guest1.anims.play('alex-talk')
  obstacleGroup.add(guest1)
  const g1Body = guest1.body as Phaser.Physics.Arcade.Body
  g1Body.setSize(18, 12).setOffset(3, 16)

  // Spawn Guest 2
  const guest2 = this.physics.add.sprite(768, 325, 'party-guests').setDepth(12)
  guest2.anims.play('beatrice-talk')
  obstacleGroup.add(guest2)
  const g2Body = guest2.body as Phaser.Physics.Arcade.Body
  g2Body.setSize(18, 12).setOffset(3, 16)

  // Spawn Guest 3
  const guest3 = this.physics.add.sprite(750, 340, 'party-guests').setDepth(12)
  guest3.anims.play('carlo-talk')
  obstacleGroup.add(guest3)
  const g3Body = guest3.body as Phaser.Physics.Arcade.Body
  g3Body.setSize(18, 12).setOffset(3, 16)

  // Spawn Table
  const table = this.physics.add.image(750, 320, 'party-table').setDepth(11)
  obstacleGroup.add(table)
  const tBody = table.body as Phaser.Physics.Arcade.Body
  tBody.setSize(16, 12).setOffset(4, 16)
  ```

- [ ] **Step 2: Update Dentsu Zen Garden coordinates and draw Stepping Stones**
  Position maple, lantern, and pond in grassy areas, and render stepping stones dynamically:
  ```typescript
  // Maple left
  const maple = this.physics.add.image(710, 730, 'japanese-maple').setDepth(15)
  maple.setDisplaySize(64, 64)
  obstacleGroup.add(maple)
  maple.refreshBody()
  const mapleBody = maple.body as Phaser.Physics.Arcade.Body
  mapleBody.setSize(24, 16).setOffset(20, 48)

  // Pond bottom-right
  const pond = this.physics.add.image(840, 800, 'koi-pond').setDepth(11)
  pond.setDisplaySize(64, 64)
  obstacleGroup.add(pond)
  pond.refreshBody()
  const pondBody = pond.body as Phaser.Physics.Arcade.Body
  pondBody.setSize(56, 40).setOffset(4, 12)

  // Lantern right
  const lantern = this.physics.add.image(830, 745, 'stone-lantern').setDepth(12)
  lantern.setDisplaySize(24, 36)
  obstacleGroup.add(lantern)
  lantern.refreshBody()
  const lanternBody = lantern.body as Phaser.Physics.Arcade.Body
  lanternBody.setSize(16, 12).setOffset(4, 24)

  // Draw Zen Garden Stepping Stones and Bamboo Fences
  const gardenGraphics = this.add.graphics().setDepth(10)
  gardenGraphics.fillStyle(0x8a8a8a, 1)
  gardenGraphics.fillEllipse(780, 750, 6, 4)
  gardenGraphics.fillEllipse(795, 765, 8, 5)
  gardenGraphics.fillEllipse(810, 785, 7, 4)
  gardenGraphics.fillEllipse(825, 800, 8, 5)

  gardenGraphics.lineStyle(1.5, 0x556b2f, 0.8)
  gardenGraphics.beginPath()
  gardenGraphics.moveTo(680, 715)
  gardenGraphics.lineTo(740, 715)
  gardenGraphics.lineTo(740, 765)
  gardenGraphics.moveTo(810, 735)
  gardenGraphics.lineTo(870, 735)
  gardenGraphics.lineTo(870, 770)
  gardenGraphics.strokePath()
  ```

- [ ] **Step 3: Scale Up Armando Testa sculptures**
  Adjust display sizes to be larger and proportional:
  ```typescript
  // Punt e Mes
  const pem = this.physics.add.image(180, 740, 'punt-e-mes').setDepth(12)
  pem.setDisplaySize(48, 63)
  obstacleGroup.add(pem)
  pem.refreshBody()
  const pemBody = pem.body as Phaser.Physics.Arcade.Body
  pemBody.setSize(36, 24).setOffset(6, 39)

  // Blue Hippo
  const hippo = this.physics.add.image(340, 740, 'blue-hippo').setDepth(12)
  hippo.setDisplaySize(72, 72)
  obstacleGroup.add(hippo)
  hippo.refreshBody()
  const hippoBody = hippo.body as Phaser.Physics.Arcade.Body
  hippoBody.setSize(54, 30).setOffset(9, 42)
  ```

- [ ] **Step 4: Verify build and test suite**
  Run: `npm run build && npm test`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/scenes/WorldScene.ts
  git commit -m "feat: layout unified Dentsu garden, scale up Armando Testa sculptures, and spawn party guests"
  ```

---

### Task 5: Final Verification & QA
- [ ] **Step 1: Verify compilation**
  Run: `npm run build`
  Expected: Success without TypeScript errors.

- [ ] **Step 2: Run all unit tests**
  Run: `npm test`
  Expected: 34 tests pass.
