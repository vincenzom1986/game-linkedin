# Iconic Location Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add iconic elements, simple animations, and solid collisions to the six career offices, including a flying cow, a Dentsu Japanese garden, Armando Testa sculptures, a party at SG Company, and a skyscraper facade for EY.

**Architecture:** Load new PNG assets in `PreloadScene`, place them in `WorldScene`, use Phaser Static physics bodies for collisions, and Phaser Tweens/animations for movement.

**Tech Stack:** TypeScript, Phaser 3.90, Vite, Vitest

## Global Constraints
- The Dentsu Japanese garden, SG Company party, and Armando Testa sculptures must act as solid colliders.
- All entrance doors must remain 100% reachable (verified by BFS tests and manual play).
- The EY skyscraper must fit exactly within the current footprint of `378 x 298` px.
- All new files and code must compile without TypeScript errors.

---

### Task 1: Asset Generation
**Files:**
- Create: `public/assets/logos/flying-cow.png`
- Create: `public/assets/logos/sg-party.png`
- Create: `public/assets/logos/punt-e-mes.png`
- Create: `public/assets/logos/blue-hippo.png`
- Create: `public/assets/logos/japanese-maple.png`
- Create: `public/assets/logos/stone-lantern.png`
- Create: `public/assets/logos/koi-pond.png`
- Create: `public/assets/logos/ey-skyscraper.png`

**Interfaces:**
- Consumes: none
- Produces: PNG files for the new location details

- [ ] **Step 1: Generate Flying Cow image**
  Use `generate_image` with prompt: "A 16-bit pixel art silhouette of a flying cow with wings facing right, light brown color (#d5bb98), isolated on a transparent background"
  Save as: `flying_cow`

- [ ] **Step 2: Generate SG Party spritesheet**
  Use `generate_image` with prompt: "A 16-bit pixel art spritesheet containing 3 frames of a group of tiny people standing around high tables having an aperitif and talking, isolated on a transparent background"
  Save as: `sg_party`

- [ ] **Step 3: Generate Punt e Mes sculpture**
  Use `generate_image` with prompt: "A 16-bit pixel art sculpture of a solid red sphere floating directly above a red half-sphere bowl, isolated on a transparent background"
  Save as: `punt_e_mes`

- [ ] **Step 4: Generate Blue Hippo sculpture**
  Use `generate_image` with prompt: "A 16-bit pixel art cute blue hippo statue standing, 16-bit top-down RPG style, isolated on a transparent background"
  Save as: `blue_hippo`

- [ ] **Step 5: Generate Japanese Maple tree**
  Use `generate_image` with prompt: "A 16-bit pixel art red-leafed Japanese maple tree, 16-bit top-down RPG style, isolated on a transparent background"
  Save as: `japanese_maple`

- [ ] **Step 6: Generate Japanese Stone Lantern**
  Use `generate_image` with prompt: "A 16-bit pixel art traditional Japanese stone lantern (toro), isolated on a transparent background"
  Save as: `stone_lantern`

- [ ] **Step 7: Generate Japanese Koi Pond**
  Use `generate_image` with prompt: "A 16-bit pixel art small koi pond with stones and water, top-down view, isolated on a transparent background"
  Save as: `koi_pond`

- [ ] **Step 8: Generate EY Skyscraper overlay**
  Use `generate_image` with prompt: "A 16-bit pixel art modern glass office skyscraper building facade with vertical steel frames and a yellow EY logo, matching top-down perspective, size 378x298, isolated on a transparent background"
  Save as: `ey_skyscraper`

- [ ] **Step 9: Move generated files to assets**
  Copy the generated files to `public/assets/logos/` directory under their respective target filenames.

- [ ] **Step 10: Commit**
  ```bash
  git add public/assets/logos/*.png
  git commit -m "feat: add generated png assets for iconic location details"
  ```

---

### Task 2: Asset Preloading
**Files:**
- Modify: `src/scenes/PreloadScene.ts`

**Interfaces:**
- Consumes: PNG files
- Produces: Loaded Phaser textures for the new assets

- [ ] **Step 1: Update PreloadScene.ts to load the new assets**
  Modify `src/scenes/PreloadScene.ts` to load the new images and spritesheets in `preload()`:
  ```typescript
  // In src/scenes/PreloadScene.ts
  this.load.image('flying-cow', 'assets/logos/flying-cow.png')
  this.load.spritesheet('sg-party', 'assets/logos/sg-party.png', { frameWidth: 64, frameHeight: 48 })
  this.load.image('punt-e-mes', 'assets/logos/punt-e-mes.png')
  this.load.image('blue-hippo', 'assets/logos/blue-hippo.png')
  this.load.image('japanese-maple', 'assets/logos/japanese-maple.png')
  this.load.image('stone-lantern', 'assets/logos/stone-lantern.png')
  this.load.image('koi-pond', 'assets/logos/koi-pond.png')
  this.load.image('ey-skyscraper', 'assets/logos/ey-skyscraper.png')
  ```

- [ ] **Step 2: Verify that tests still pass**
  Run: `npm test`
  Expected: PASS

- [ ] **Step 3: Commit**
  ```bash
  git add src/scenes/PreloadScene.ts
  git commit -m "feat: preload new iconic location assets in PreloadScene"
  ```

---

### Task 3: Render Skyscraper, Flying Cow, and Hippo Tweens
**Files:**
- Modify: `src/scenes/WorldScene.ts`

**Interfaces:**
- Consumes: Loaded textures
- Produces: Rendered EY skyscraper, animated cow, and animated hippo

- [ ] **Step 1: Overlay EY Skyscraper**
  Add the EY skyscraper image at `x: 1164, y: 474` with origin `(0, 0)` and depth `5` in the `create()` method.
  ```typescript
  this.add.image(1164, 474, 'ey-skyscraper').setOrigin(0).setDepth(5)
  ```

- [ ] **Step 2: Add and Animate Flying Cow**
  Add the flying cow sprite at `x: 286, y: 130` with depth `25`, and apply a vertical floating tween.
  ```typescript
  const cow = this.add.image(286, 130, 'flying-cow').setDepth(25)
  this.tweens.add({
    targets: cow,
    y: 130 - 8,
    duration: 1500,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  })
  ```

- [ ] **Step 3: Verify build**
  Run: `npm run build`
  Expected: Success without compiler errors

- [ ] **Step 4: Commit**
  ```bash
  git add src/scenes/WorldScene.ts
  git commit -m "feat: render EY skyscraper overlay and animated flying cow"
  ```

---

### Task 4: Add Solid Colliders and party animations
**Files:**
- Modify: `src/scenes/WorldScene.ts`

**Interfaces:**
- Consumes: Loaded textures and Phaser physics
- Produces: Collidable static objects with tweens/animations

- [ ] **Step 1: Create Static Obstacle Group**
  In the `create()` method of `WorldScene.ts`, initialize a static physics group for the solid objects:
  ```typescript
  const obstacleGroup = this.physics.add.staticGroup()
  ```

- [ ] **Step 2: Add SG Company Aperitif**
  Create the SG Party animation and add the sprite to the obstacle group at `x: 750, y: 330`:
  ```typescript
  this.anims.create({
    key: 'party-idle',
    frames: this.anims.generateFrameNumbers('sg-party', { start: 0, end: 2 }),
    frameRate: 4,
    repeat: -1
  })
  const party = this.physics.add.sprite(750, 330, 'sg-party').setDepth(12)
  party.anims.play('party-idle')
  obstacleGroup.add(party)
  // Set smaller physics body at the base
  const partyBody = party.body as Phaser.Physics.Arcade.Body
  partyBody.setSize(48, 16).setOffset(8, 32)
  ```

- [ ] **Step 3: Add Armando Testa objects**
  Add the static Punt e Mes sculpture at `x: 210, y: 740`:
  ```typescript
  const pem = this.add.image(210, 740, 'punt-e-mes').setDepth(12)
  obstacleGroup.add(pem)
  const pemBody = pem.body as Phaser.Physics.Arcade.Body
  pemBody.setSize(18, 12).setOffset(3, 20)
  ```
  Add the animated blue hippo sculpture at `x: 370, y: 740` with a gentle tilt tween:
  ```typescript
  const hippo = this.add.image(370, 740, 'blue-hippo').setDepth(12)
  obstacleGroup.add(hippo)
  const hippoBody = hippo.body as Phaser.Physics.Arcade.Body
  hippoBody.setSize(24, 12).setOffset(4, 12)
  this.tweens.add({
    targets: hippo,
    angle: { from: -3, to: 3 },
    duration: 1200,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  })
  ```

- [ ] **Step 4: Add Dentsu Japanese Garden elements**
  Add the red Japanese maple at `x: 710, y: 740`:
  ```typescript
  const maple = this.add.image(710, 740, 'japanese-maple').setDepth(15)
  obstacleGroup.add(maple)
  const mapleBody = maple.body as Phaser.Physics.Arcade.Body
  mapleBody.setSize(16, 12).setOffset(16, 32)
  ```
  Add the stone lantern at `x: 890, y: 745`:
  ```typescript
  const lantern = this.add.image(890, 745, 'stone-lantern').setDepth(12)
  obstacleGroup.add(lantern)
  const lanternBody = lantern.body as Phaser.Physics.Arcade.Body
  lanternBody.setSize(12, 10).setOffset(2, 14)
  ```
  Add the koi pond at `x: 750, y: 820`:
  ```typescript
  const pond = this.add.image(750, 820, 'koi-pond').setDepth(11)
  obstacleGroup.add(pond)
  const pondBody = pond.body as Phaser.Physics.Arcade.Body
  pondBody.setSize(44, 24).setOffset(2, 4)
  ```

- [ ] **Step 5: Set up Collider with Player**
  Add the physics collider between `this.player` and `obstacleGroup`:
  ```typescript
  this.physics.add.collider(this.player, obstacleGroup)
  ```

- [ ] **Step 6: Run build and verify tests**
  Run: `npm run build && npm test`
  Expected: PASS

- [ ] **Step 7: Commit**
  ```bash
  git add src/scenes/WorldScene.ts
  git commit -m "feat: add solid obstacles and simple tweens for location details"
  ```

---

### Task 5: Final Verification & Walkthrough
**Files:**
- Modify: `docs/superpowers/specs/2026-06-22-iconic-location-details-design.md`

- [ ] **Step 1: Check build**
  Run: `npm run build`
  Expected: Success

- [ ] **Step 2: Run all tests**
  Run: `npm test`
  Expected: PASS

- [ ] **Step 3: Update specs doc with results**
  Append verification results to the spec file: `docs/superpowers/specs/2026-06-22-iconic-location-details-design.md`.

- [ ] **Step 4: Commit**
  ```bash
  git add docs/superpowers/specs/2026-06-22-iconic-location-details-design.md
  git commit -m "docs: complete verification for iconic location details"
  ```
