# Aesthetic Office Details Design Specification

## Goal
Improve the visual aesthetics of the six career offices, ensuring assets blend seamlessly into the retro 16-bit pixel-art world. This includes creating proportional, high-quality, animated party characters for SG Company, rebuilding the Japanese garden layout at Dentsu from scratch with stepping stones, and scaling up the sculptures at Armando Testa while respecting original logo aspect ratios.

---

## 1. SG Company (Party Scene)
Instead of a downscaled high-resolution group image, we will generate individual pixel-art characters at the same scale as the player (24x28 pixels) and animate them at a cocktail table.

### Design
- **Character Spritesheet (`party-guests`)**: Generated dynamically on a canvas at runtime in `PreloadScene.ts`.
  - **Guest 1 (Alex)**: Blue shirt (#2d5380), brown pants (#8a5a36), dark hair (#111111). Facing right.
  - **Guest 2 (Beatrice)**: Red dress (#8a1c14), blonde hair (#e6c280). Facing left.
  - **Guest 3 (Carlo)**: Green sweater (#2d3b2d), grey pants (#5a5c5a), dark hair (#111111). Facing up.
  - **Table**: A brown wooden cocktail table (#68573e) of size 24x28 with a white tablecloth and small pixelated drinks.
- **Animations**:
  - `guest-talk`: A 2-frame animation where characters bob their heads and gesture with arms to simulate active conversation.
- **Physics**:
  - Spawned as solid collidable sprite entities in `WorldScene.ts`.

---

## 2. Dentsu (Japanese Garden)
Rather than pasting separate, disconnected images, we will build a unified garden layout that fits organically into the courtyard.

### Design
- **Stepping Stones (Tobi-ishi)**: Rendered dynamically using Phaser's Graphics object. Small, organically shaped grey stone circles connecting the paved road to the pond and lantern.
- **Koi Pond**: Relocated to the bottom-right grass patch (`x: 840, y: 800`) to clear the entrance path and the "Dentsu" signboard.
- **Japanese Maple Tree**: Positioned on the left grass patch (`x: 710, y: 730`).
- **Stone Lantern**: Positioned on the right grass patch (`x: 830, y: 745`). We will regenerate this asset without rulers or grid artifacts.
- **Bamboo Fences**: Small bamboo borders drawn using Graphics around the grass patches to delineate the Zen garden.

---

## 3. Armando Testa (Proportions & Scaling)
Correct the logo stretch bug and enlarge the courtyard sculptures.

### Design
- **Proportional Logos**: Update `scripts/pixelate-assets.mjs` to calculate target width and height based on the original asset aspect ratio, fitting it inside `maxW: 50, maxH: 22` (e.g. Armando Testa square logo will be saved as ~24x22 instead of stretched to 50x22).
- **Courtyard Sculptures**:
  - **Punt e Mes**: Scaled to `48x63` (proportional height) and placed at `x: 180, y: 740`.
  - **Blue Hippo**: Scaled to `72x72` (proportional square) and placed at `x: 340, y: 740`.
  - Both will act as solid static obstacles framing the entrance.

---

## Verification & Testing
- **Visual Validation**: Launch dev server and inspect each location in the browser.
- **Door Reachability**: Ensure all entrance doors are accessible and collision boxes do not block paths.
- **Unit Tests**: Confirm that all existing vitest tests still pass.
