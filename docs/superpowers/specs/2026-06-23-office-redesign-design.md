# Office Redesign & Aesthetic Improvement Design Specification

**Date:** 2026-06-23  
**Status:** Approved by User  

---

## 1. Goal & Context

The goal is to redesign and improve the visual representations of the office locations on the career map to match specific conceptual and thematic directions, while maintaining the premium, 16-bit retro RPG aesthetic of the game.

The specific design goals for each location are:
- **EY**: Keep the existing modern `ey-skyscraper.png` as is.
- **Dentsu**: A modern minimal building surrounded by Japanese garden elements and pink cherry blossom trees in bloom, while retaining the falling autumn red/orange maple leaves in the background.
- **Wunderman Thompson**: A classic windmill building where the windmill blades rotate continuously at runtime.
- **Armando Testa**: A building shaped exactly like the iconic Punt e Mes sculpture (a large red sphere floating above a half-sphere bowl) with an entrance door at the base, and the blue hippo (*Pippo*) standing outside welcoming the player.
- **SG Company**: An outdoor event stage featuring SG Company branding and animated colored spotlights, surrounded by a crowd of animated dancing and talking people.

---

## 2. Visual Architecture & Assets Workflow

To maintain perfect pixel alignment, proportions, and transparency, we will follow the established workflow:
1. **Generative Source**: Generate high-resolution asset images using the `generate_image` tool with a solid black background.
2. **Pixelation Pipeline**: Put the raw PNG assets into `public/assets/logos/` and configure their bounds in `scripts/pixelate-assets.mjs`.
3. **Black Keying & Downsampling**: Run the pixelation script to downsample the images using nearest-neighbor scaling and apply transparent backgrounds via black-color-keying.

### Target Assets:
- `cherry-tree.png` (Cherry blossom tree, target max size: `64x64`)
- `windmill-body.png` (Body of the windmill, target max size: `120x150`)
- `windmill-blades.png` (Blades of the windmill, centered, target max size: `100x100`)
- `punt-e-mes-building.png` (Punt e Mes shaped building with door, target max size: `150x200`)
- `event-stage.png` (Event stage with truss, banners, target max size: `180x120`)
- `blue-hippo.png` (Blue hippo mascot, already exists, target size: `72x72`)

---

## 3. Implementation Details

### 3.1 Dentsu Garden Layout
- Position the existing `dentsu-building.png` facade at `(708, 504)`.
- Replace the static garden map background elements by rendering multiple static physics sprites of `cherry-tree` around the garden (e.g., at coordinates to the right of the pond and near the building entrance).
- Keep the `japanese-maple`, `stone-lantern`, `koi-pond`, and the stepping stones/fences.
- Maintain the red maple leaf particle emitter and the bubble/ripple emitters in the pond.

### 3.2 Wunderman Thompson Animated Windmill
- Cover the pre-painted background facade with green/brown graphic patches at Wunderman Thompson's location.
- Load `windmill-body` and `windmill-blades` in `PreloadScene.ts`.
- Place `windmill-body` at `(1260, 100)` with static physics body.
- Overlay `windmill-blades` centered at the top axis of the windmill body.
- Implement an infinite linear rotation tween on the blades image inside `WorldScene.ts`:
  ```typescript
  this.tweens.add({
    targets: blades,
    angle: 360,
    duration: 6000,
    repeat: -1,
    ease: 'Linear'
  })
  ```

### 3.3 Armando Testa Punt e Mes Building
- Cover the pre-painted Armando Testa area with background patches.
- Place `punt-e-mes-building` at `(180, 680)` with static physics body.
- Place the `blue-hippo` sprite to the right of the building door (e.g., `(260, 740)`).
- Apply a subtle scale/rotation breathing tween to the hippo sprite:
  ```typescript
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
- Set up the interaction zone corresponding to the building's door entrance.

### 3.4 SG Company Plaza Event
- Position `event-stage` at `(750, 240)`.
- Use Phaser Graphics to draw 2 spotlight beam overlays originating from the top corners of the stage, rotating back and forth infinitely using sine-wave tweens.
- **Dynamic Crowd**:
  - Update `createPartyGuestsSpritesheet` in `PreloadScene.ts` to render 6 distinct characters (Alex, Beatrice, Carlo, and three new characters: Diana, Enzo, Francesca) with unique hair and clothes.
  - Spawn 6-8 guests at randomized coordinates in front of the stage.
  - Play `dance` animations (quick vertical bouncing) on 4 of the guests, and `talk` animations (slower talking bob) on the other 4.
  - Set up a small stage table asset next to them.

---

## 4. Verification Plan

### 4.1 Automated Tests
- Run `npm test` to ensure all existing 34 unit tests pass successfully.
- Verify that no Phaser loading warnings or typescript compilation errors are introduced.

### 4.2 Manual / Visual Verification
- Deploy/run the dev server and test:
  - Check the windmill blades rotating smoothly without stretching or warping.
  - Verify Dentsu building is decorated with cherry trees and that collision zones block player movement correctly.
  - Verify Armando Testa building shape and that the hippo bobs gently.
  - Verify the SG Company stage lights sweep across the stage and the crowd dances/dialogues correctly.
