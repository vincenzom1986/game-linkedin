# Aesthetic Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a series of visual improvements including a fast typewriter text effect, smooth sliding dialog box transitions, a floating speech bubble prompt over the player's head, and ambient particle effects (falling maple leaves, pond bubbles/ripples, and global floating fireflies).

**Architecture:** We will modify `PreloadScene` to generate custom textures programmatically at runtime. We will update `UIScene` to animate the dialog panel using Phaser Tweens and type text dynamically with calculated timers. Finally, we will update `WorldScene` to show a floating speech bubble prompt above the player and emit ambient particles using Phaser's native particle systems.

**Tech Stack:** TypeScript, Phaser 3.90, Vite, Vitest

## Global Constraints
- The UI must remain fast and highly responsive: typewriter effect must complete in ~150ms.
- Dialog box open/close animations must not block user inputs or cause UI lockups.
- Floating interaction prompt must position itself correctly above the player.
- All particle systems must be lightweight and garbage-collection friendly.
- Code must build successfully without TypeScript or build errors.

---

### Task 1: Generate Runtime Textures in PreloadScene
**Files:**
- Modify: `src/scenes/PreloadScene.ts`

**Interfaces:**
- Consumes: none
- Produces: Dynamically generated textures ('leaf-red', 'leaf-orange', 'leaf-bordeaux', 'bubble', 'firefly') in Phaser's texture manager.

- [ ] **Step 1: Add canvas texture generator helper in PreloadScene**
  Add a helper method `createRuntimeTextures()` in `src/scenes/PreloadScene.ts` inside the `create()` method. This helper draws simple pixel shapes onto textures:
  ```typescript
  // Add to src/scenes/PreloadScene.ts create()
  this.createRuntimeTextures();
  ```

  And define the method in `PreloadScene`:
  ```typescript
  private createRuntimeTextures(): void {
    // 1. Red Maple Leaf
    let canvas = this.textures.createCanvas('leaf-red', 4, 4);
    let ctx = canvas?.getContext();
    if (ctx) {
      ctx.fillStyle = '#8a1c14';
      ctx.fillRect(1, 0, 2, 1);
      ctx.fillRect(0, 1, 4, 2);
      ctx.fillRect(1, 3, 2, 1);
      canvas?.refresh();
    }

    // 2. Orange Maple Leaf
    canvas = this.textures.createCanvas('leaf-orange', 4, 4);
    ctx = canvas?.getContext();
    if (ctx) {
      ctx.fillStyle = '#c45d25';
      ctx.fillRect(1, 0, 2, 1);
      ctx.fillRect(0, 1, 4, 2);
      ctx.fillRect(1, 3, 2, 1);
      canvas?.refresh();
    }

    // 3. Bordeaux Maple Leaf
    canvas = this.textures.createCanvas('leaf-bordeaux', 4, 4);
    ctx = canvas?.getContext();
    if (ctx) {
      ctx.fillStyle = '#5e1015';
      ctx.fillRect(1, 0, 2, 1);
      ctx.fillRect(0, 1, 4, 2);
      ctx.fillRect(1, 3, 2, 1);
      canvas?.refresh();
    }

    // 4. Bubble
    canvas = this.textures.createCanvas('bubble', 6, 6);
    ctx = canvas?.getContext();
    if (ctx) {
      ctx.strokeStyle = '#9ee0ff';
      ctx.lineWidth = 1;
      ctx.strokeRect(1, 1, 4, 4);
      canvas?.refresh();
    }

    // 5. Firefly
    canvas = this.textures.createCanvas('firefly', 2, 2);
    ctx = canvas?.getContext();
    if (ctx) {
      ctx.fillStyle = '#ffe875';
      ctx.fillRect(0, 0, 2, 2);
      canvas?.refresh();
    }
  }
  ```

- [ ] **Step 2: Verify project builds**
  Run: `npm run build`
  Expected: Success without compiler errors.

- [ ] **Step 3: Commit changes**
  ```bash
  git add src/scenes/PreloadScene.ts
  git commit -m "feat: generate runtime particle textures in PreloadScene"
  ```

---

### Task 2: Implement UI Transitions and Typewriter Text in UIScene
**Files:**
- Modify: `src/scenes/UIScene.ts`

**Interfaces:**
- Consumes: Dynamically generated textures, career data events.
- Produces: Smooth animated panels and typewriter text.

- [ ] **Step 1: Hide old bottom text prompt**
  Modify `create()` in `src/scenes/UIScene.ts` to make sure the old prompt does not display, or completely delete it. Let's delete/remove the prompt rendering code from `UIScene.ts`:
  ```typescript
  // Remove or set visible(false) and never change it
  this.prompt.setVisible(false);
  ```
  Also update `onPrompt` to do nothing:
  ```typescript
  private onPrompt(visible: boolean): void {
    // Replaced by floating prompt in WorldScene
  }
  ```

- [ ] **Step 2: Add state variables for typewriter**
  Add class properties to `UIScene`:
  ```typescript
  private typingTimer?: Phaser.Time.TimerEvent;
  private currentFullText = '';
  private currentTypedLength = 0;
  private cursorState = true;
  private cursorTimer?: Phaser.Time.TimerEvent;
  ```

- [ ] **Step 3: Implement typewriter text effect**
  Implement dynamic fast typewriter effect in `renderPage()`:
  ```typescript
  private renderPage(): void {
    const page = this.pages[this.pageIndex];
    if (!page) return;
    this.eyebrow.setText(page.eyebrow);
    this.title.setText(page.title);

    // Stop existing timers
    if (this.typingTimer) {
      this.typingTimer.destroy();
      this.typingTimer = undefined;
    }
    if (this.cursorTimer) {
      this.cursorTimer.destroy();
      this.cursorTimer = undefined;
    }

    this.currentFullText = page.body;
    this.currentTypedLength = 0;
    this.body.setText('');

    // Calculate dynamic character time to complete in ~150ms
    const totalDuration = 150; // ms
    const charTime = Math.max(1, Math.floor(totalDuration / this.currentFullText.length));

    this.typingTimer = this.time.addEvent({
      delay: charTime,
      callback: () => {
        this.currentTypedLength++;
        const displayedText = this.currentFullText.substring(0, this.currentTypedLength);
        this.body.setText(displayedText + (this.cursorState ? '▊' : ''));

        if (this.currentTypedLength >= this.currentFullText.length) {
          this.body.setText(this.currentFullText); // Complete text
          this.typingTimer?.destroy();
          this.typingTimer = undefined;
          this.cursorTimer?.destroy();
          this.cursorTimer = undefined;
        }
      },
      repeat: this.currentFullText.length - 1
    });

    // Blinking cursor timer
    this.cursorState = true;
    this.cursorTimer = this.time.addEvent({
      delay: 80,
      callback: () => {
        this.cursorState = !this.cursorState;
        if (this.typingTimer) {
          const displayedText = this.currentFullText.substring(0, this.currentTypedLength);
          this.body.setText(displayedText + (this.cursorState ? '▊' : ''));
        }
      },
      loop: true
    });
  }
  ```

- [ ] **Step 4: Implement instant typewriter skip**
  Add checking inside `nextPage()`, `previousPage()`, and a screen tap/keyboard listener to complete text immediately if typing:
  ```typescript
  private skipTyping(): boolean {
    if (this.typingTimer) {
      this.typingTimer.destroy();
      this.typingTimer = undefined;
      this.cursorTimer?.destroy();
      this.cursorTimer = undefined;
      this.body.setText(this.currentFullText);
      return true;
    }
    return false;
  }
  ```
  Update `nextPage()` and `previousPage()`:
  ```typescript
  private nextPage(): void {
    if (!this.panel.visible) return;
    if (this.skipTyping()) return; // Skip typing first
    if (this.pageIndex < this.pages.length - 1) {
      this.pageIndex++;
      this.renderPage();
    }
  }

  private previousPage(): void {
    if (!this.panel.visible) return;
    if (this.skipTyping()) return; // Skip typing first
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.renderPage();
    }
  }
  ```
  Add screen-pointer click listener to slide-skip:
  ```typescript
  // inside create()
  this.input.on('pointerdown', () => {
    if (this.panel.visible) {
      this.skipTyping();
    }
  });
  ```

- [ ] **Step 5: Implement Panel slide & fade animations**
  Update `openPanel()` and `hidePanel()` in `UIScene.ts`:
  ```typescript
  private openPanel(): void {
    this.registry.set('panel-open', true);
    this.prompt.setVisible(false);

    // Reset panel status before animation
    this.panel.setVisible(true);
    this.panel.setAlpha(0);
    this.panel.setPosition(36, 400); // Start below target y (276)

    this.tweens.add({
      targets: this.panel,
      y: 276,
      alpha: 1,
      duration: 300,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.touchControls.setSuppressed(true);
      }
    });
  }

  private hidePanel(): void {
    if (this.typingTimer) {
      this.typingTimer.destroy();
      this.typingTimer = undefined;
    }
    if (this.cursorTimer) {
      this.cursorTimer.destroy();
      this.cursorTimer = undefined;
    }

    this.tweens.add({
      targets: this.panel,
      y: 400, // Slide down
      alpha: 0,
      duration: 200,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        this.panel.setVisible(false);
        this.registry.set('panel-open', false);
        this.contactActions.setVisible(false);
        this.contactView = undefined;
        this.touchControls.setSuppressed(false);
      }
    });
  }
  ```

- [ ] **Step 6: Run tests and verify the UI works**
  Run: `npm test`
  Expected: PASS

- [ ] **Step 7: Commit changes**
  ```bash
  git add src/scenes/UIScene.ts
  git commit -m "feat: implement panel slide transitions and dynamic typewriter effect"
  ```

---

### Task 3: Implement Floating Interactive Prompt in WorldScene
**Files:**
- Modify: `src/scenes/WorldScene.ts`

**Interfaces:**
- Consumes: player positioning, nearest interaction calculations.
- Produces: Floating, bouncing speech bubble prompt above the player's head.

- [ ] **Step 1: Declare prompt properties in WorldScene**
  Add the prompt properties to `WorldScene` class:
  ```typescript
  private interactionPrompt!: Phaser.GameObjects.Container;
  private promptVisible = false;
  private promptTween?: Phaser.Tweens.Tween;
  ```

- [ ] **Step 2: Initialize floating prompt in create()**
  Create a custom floating bubble prompt container. It contains a retro bubble vector graphic and text label:
  ```typescript
  // Add in src/scenes/WorldScene.ts create() before launching UI scene
  this.createInteractionPrompt();
  ```

  And define `createInteractionPrompt` in `WorldScene`:
  ```typescript
  private createInteractionPrompt(): void {
    const bubble = this.add.graphics();
    // Draw speech bubble
    bubble.fillStyle(0xfff4cc, 0.95);
    bubble.fillRoundedRect(-40, -18, 80, 26, 4);
    bubble.lineStyle(2, 0x172a1f, 1);
    bubble.strokeRoundedRect(-40, -18, 80, 26, 4);

    // Draw little arrow pointer at bottom
    bubble.fillStyle(0xfff4cc, 0.95);
    bubble.fillTriangle(-6, 8, 6, 8, 0, 14);
    bubble.lineStyle(2, 0x172a1f, 1);
    // Draw dark border lines for the triangle
    bubble.beginPath();
    bubble.moveTo(-6, 8);
    bubble.lineTo(0, 14);
    bubble.lineTo(6, 8);
    bubble.strokePath();
    // Overwrite the border connection
    bubble.fillStyle(0xfff4cc, 1);
    bubble.fillTriangle(-5, 7, 5, 7, 0, 12);

    const text = this.add.text(0, -5, '[SPAZIO]', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#172a1f',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.interactionPrompt = this.add.container(0, 0, [bubble, text]).setDepth(30).setVisible(false).setScale(0);

    // Floating bounce animation loop
    this.tweens.add({
      targets: this.interactionPrompt,
      y: { from: 0, to: -4 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  ```

- [ ] **Step 3: Update prompt position and visibility in update()**
  Modify `update()` in `WorldScene.ts` to reposition the floating prompt above the player's head and toggle its visibility with animations:
  ```typescript
  // Position above player
  if (this.player) {
    // Keep interactionPrompt floating relatively around the player
    const targetY = this.player.y - 32;
    this.interactionPrompt.x = this.player.x;
    
    // We add the base coordinate offsets in update, separate from the bounce tween
    // Wait, the bounce tween modifies container's y property directly. 
    // To avoid conflicts, we can offset the bubble within the container or calculate:
    // Actually, it's safer to position the container:
    // Let's modify the bounce tween targets: rather than animating container's y, 
    // we can animate the inner bubble and text's y, keeping container.y strictly locked to player's head.
  }
  ```
  Let's refine `createInteractionPrompt()` step to only bounce the child elements:
  ```typescript
  // In createInteractionPrompt:
  this.tweens.add({
    targets: [bubble, text],
    y: { from: 0, to: -5 },
    duration: 800,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
  ```
  Now, inside `update()`:
  ```typescript
  const target = nearestInteraction(
    { x: this.player.x, y: this.player.y },
    this.interactions,
    INTERACTION_DISTANCE,
  );
  const shouldShow = Boolean(target) && (this.registry.get('panel-open') !== true);

  this.interactionPrompt.x = this.player.x;
  this.interactionPrompt.y = this.player.y - 32;

  if (shouldShow && !this.promptVisible) {
    this.promptVisible = true;
    this.interactionPrompt.setVisible(true);
    if (this.promptTween) this.promptTween.stop();
    this.promptTween = this.tweens.add({
      targets: this.interactionPrompt,
      scale: 1,
      alpha: 1,
      duration: 150,
      ease: 'Back.easeOut'
    });
  } else if (!shouldShow && this.promptVisible) {
    this.promptVisible = false;
    if (this.promptTween) this.promptTween.stop();
    this.promptTween = this.tweens.add({
      targets: this.interactionPrompt,
      scale: 0,
      alpha: 0,
      duration: 150,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.interactionPrompt.setVisible(false);
      }
    });
  }
  ```

- [ ] **Step 4: Verify project builds**
  Run: `npm run build && npm test`
  Expected: Success

- [ ] **Step 5: Commit changes**
  ```bash
  git add src/scenes/WorldScene.ts
  git commit -m "feat: implement floating speech bubble prompt over player's head"
  ```

---

### Task 4: Implement Ambient Particle Systems in WorldScene
**Files:**
- Modify: `src/scenes/WorldScene.ts`

**Interfaces:**
- Consumes: generated textures ('leaf-red', 'leaf-orange', 'leaf-bordeaux', 'bubble', 'firefly')
- Produces: Ambient particle effects on map.

- [ ] **Step 1: Setup Dentsu falling maple leaves**
  In `create()` of `WorldScene.ts` after rendering Dentsu map elements:
  ```typescript
  // Maple leaves emitter
  const leafColors = ['leaf-red', 'leaf-orange', 'leaf-bordeaux'];
  leafColors.forEach((color) => {
    const emitter = this.add.particles(0, 0, color, {
      x: { min: 660, max: 740 },
      y: { min: 680, max: 710 },
      speedY: { min: 30, max: 60 },
      speedX: { min: -40, max: -10 }, // Blowing left
      scale: { start: 0.8, end: 1.2 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 3000, max: 5000 },
      frequency: 1200,
      rotate: { min: 0, max: 360 }
    });
    emitter.setDepth(16); // Above tree trunk but behind foliage tops
  });
  ```

- [ ] **Step 2: Setup Koi Pond bubbles and ripples**
  In `create()` of `WorldScene.ts`:
  ```typescript
  // Bubbles rising in the pond
  const bubbleEmitter = this.add.particles(0, 0, 'bubble', {
    x: { min: 725, max: 775 },
    y: { min: 805, max: 835 },
    speedY: { min: -10, max: -20 },
    speedX: { min: -5, max: 5 },
    scale: { start: 0.5, end: 1 },
    alpha: { start: 0.6, end: 0 },
    lifespan: { min: 1000, max: 2000 },
    frequency: 600
  });
  bubbleEmitter.setDepth(11); // Inside the pond, below player depth

  // periodic ripples
  this.time.addEvent({
    delay: 3500,
    callback: () => {
      const rx = Phaser.Math.Between(730, 770);
      const ry = Phaser.Math.Between(810, 830);
      const ripple = this.add.graphics().setDepth(11);
      ripple.lineStyle(1.5, 0x9ee0ff, 0.6);
      ripple.strokeCircle(rx, ry, 2);
      this.tweens.add({
        targets: ripple,
        scaleX: 6,
        scaleY: 6,
        alpha: 0,
        duration: 1800,
        onComplete: () => {
          ripple.destroy();
        }
      });
    },
    loop: true
  });
  ```

- [ ] **Step 3: Setup Sparse Global Fireflies**
  In `create()` of `WorldScene.ts`:
  ```typescript
  const fireflyEmitter = this.add.particles(0, 0, 'firefly', {
    x: { min: 0, max: 1600 }, // Full map width
    y: { min: 0, max: 1200 }, // Full map height
    speedY: { min: -10, max: 10 },
    speedX: { min: -15, max: 15 },
    scale: { start: 0.5, end: 1 },
    alpha: { start: 0, end: 0.8 },
    lifespan: { min: 4000, max: 8000 },
    frequency: 400,
    maxParticles: 35 // Sparse atmosphere
  });
  fireflyEmitter.setDepth(28); // Above buildings, below clouds/floating cow
  ```

- [ ] **Step 4: Verify build and run tests**
  Run: `npm run build && npm test`
  Expected: PASS

- [ ] **Step 5: Commit changes**
  ```bash
  git add src/scenes/WorldScene.ts
  git commit -m "feat: add ambient particle systems for maple leaves, pond bubbles, and fireflies"
  ```

---

### Task 5: Final Walkthrough & Verification
- [ ] **Step 1: Check project build**
  Run: `npm run build`
  Expected: Success without TypeScript or asset errors.

- [ ] **Step 2: Run all tests**
  Run: `npm test`
  Expected: All 32 tests pass.
