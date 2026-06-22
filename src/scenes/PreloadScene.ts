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
      if (location.logo.path.endsWith('.svg')) {
        this.load.svg(location.logo.key, location.logo.path)
      } else {
        this.load.image(location.logo.key, location.logo.path)
      }
    }

    // Load iconic location details and overrides
    this.load.image('flying-cow', 'assets/logos/flying-cow.png')
    this.load.spritesheet('sg-party', 'assets/logos/sg-party.png', { frameWidth: 1024, frameHeight: 341 })
    this.load.image('punt-e-mes', 'assets/logos/punt-e-mes.png')
    this.load.image('blue-hippo', 'assets/logos/blue-hippo.png')
    this.load.image('japanese-maple', 'assets/logos/japanese-maple.png')
    this.load.image('stone-lantern', 'assets/logos/stone-lantern.png')
    this.load.image('koi-pond', 'assets/logos/koi-pond.png')
    this.load.image('ey-skyscraper', 'assets/logos/ey-skyscraper.png')
  }

  create(): void {
    this.createHeroSpritesheet()
    this.createAnimations()
    this.createRuntimeTextures()
    this.scene.start('world')
  }

  private createHeroSpritesheet(): void {
    const canvas = document.createElement('canvas')
    canvas.width = 72
    canvas.height = 112
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Colors customized to match user's photo
    const skin = '#f7d0b5'
    const jacket = '#d99a26' // Mustard yellow jacket
    const pants = '#2d5380'  // Blue jeans
    const hair = '#111111'   // Dark hair
    const beard = '#111111'  // Dark beard
    const glasses = '#0d0d0d' // Sunglasses

    // Helper to draw a single frame (24x28 pixels)
    // step: 0 = standing, 1 = walk left leg, 2 = walk right leg
    const drawFrame = (fx: number, fy: number, direction: string, step: number) => {
      ctx.clearRect(fx, fy, 24, 28)

      if (direction === 'down') {
        // Hair
        ctx.fillStyle = hair
        ctx.fillRect(fx + 6, fy + 0, 12, 3)
        // Curly hair details at top sides
        ctx.fillRect(fx + 5, fy + 1, 1, 2)
        ctx.fillRect(fx + 18, fy + 1, 1, 2)
        
        // Head
        ctx.fillStyle = skin
        ctx.fillRect(fx + 6, fy + 3, 12, 7)
        
        // Sunglasses
        ctx.fillStyle = glasses
        ctx.fillRect(fx + 7, fy + 5, 10, 2)
        
        // Beard / Mustache
        ctx.fillStyle = beard
        ctx.fillRect(fx + 7, fy + 7, 10, 1)
        ctx.fillRect(fx + 6, fy + 8, 12, 2)
        
        // Torso (Mustard Jacket)
        ctx.fillStyle = jacket
        ctx.fillRect(fx + 4, fy + 10, 16, 12)
        
        // Zipper detail
        ctx.fillStyle = '#b58322'
        ctx.fillRect(fx + 11, fy + 10, 2, 12)
        
        // Backpack straps (dark camo/black)
        ctx.fillStyle = '#2d3b2d'
        ctx.fillRect(fx + 6, fy + 10, 2, 8)
        ctx.fillRect(fx + 16, fy + 10, 2, 8)
        
        // Legs / Feet (Blue Jeans)
        ctx.fillStyle = pants
        if (step === 0) {
          ctx.fillRect(fx + 6, fy + 22, 4, 6)
          ctx.fillRect(fx + 14, fy + 22, 4, 6)
        } else if (step === 1) {
          ctx.fillRect(fx + 6, fy + 22, 4, 4)
          ctx.fillRect(fx + 14, fy + 22, 4, 6)
        } else {
          ctx.fillRect(fx + 6, fy + 22, 4, 6)
          ctx.fillRect(fx + 14, fy + 22, 4, 4)
        }
      } else if (direction === 'up') {
        // Hair (covers back of head)
        ctx.fillStyle = hair
        ctx.fillRect(fx + 6, fy + 0, 12, 9)
        // Curly hair details on sides
        ctx.fillRect(fx + 5, fy + 2, 1, 6)
        ctx.fillRect(fx + 18, fy + 2, 1, 6)
        
        // Torso (Jacket with hood)
        ctx.fillStyle = jacket
        ctx.fillRect(fx + 4, fy + 10, 16, 12)
        ctx.fillStyle = '#b58322' // Hood outline
        ctx.fillRect(fx + 6, fy + 10, 12, 2)
        
        // Backpack (dark camo green) on back
        ctx.fillStyle = '#3a4e3a'
        ctx.fillRect(fx + 6, fy + 12, 12, 10)
        ctx.fillStyle = '#243324' // Backpack pocket details
        ctx.fillRect(fx + 8, fy + 14, 8, 6)
        
        // Legs / Feet (Blue Jeans)
        ctx.fillStyle = pants
        if (step === 0) {
          ctx.fillRect(fx + 6, fy + 22, 4, 6)
          ctx.fillRect(fx + 14, fy + 22, 4, 6)
        } else if (step === 1) {
          ctx.fillRect(fx + 6, fy + 22, 4, 4)
          ctx.fillRect(fx + 14, fy + 22, 4, 6)
        } else {
          ctx.fillRect(fx + 6, fy + 22, 4, 6)
          ctx.fillRect(fx + 14, fy + 22, 4, 4)
        }
      } else if (direction === 'left') {
        // Hair
        ctx.fillStyle = hair
        ctx.fillRect(fx + 7, fy + 0, 9, 3)
        ctx.fillRect(fx + 6, fy + 3, 5, 6)
        ctx.fillRect(fx + 6, fy + 1, 1, 2) // curly detail
        
        // Head
        ctx.fillStyle = skin
        ctx.fillRect(fx + 8, fy + 3, 9, 7)
        
        // Sunglasses on side
        ctx.fillStyle = glasses
        ctx.fillRect(fx + 7, fy + 5, 5, 2)
        
        // Beard / Mustache
        ctx.fillStyle = beard
        ctx.fillRect(fx + 8, fy + 7, 4, 1)
        ctx.fillRect(fx + 7, fy + 8, 8, 2)
        
        // Torso (Jacket)
        ctx.fillStyle = jacket
        ctx.fillRect(fx + 6, fy + 10, 12, 12)
        
        // Backpack on left side (drawn on the back / right)
        ctx.fillStyle = '#3a4e3a'
        ctx.fillRect(fx + 14, fy + 12, 3, 10)
        
        // Backpack strap on the left (front)
        ctx.fillStyle = '#2d3b2d'
        ctx.fillRect(fx + 8, fy + 10, 2, 8)
        
        // Legs
        ctx.fillStyle = pants
        if (step === 0) {
          ctx.fillRect(fx + 7, fy + 22, 4, 6)
          ctx.fillRect(fx + 12, fy + 22, 4, 6)
        } else if (step === 1) {
          ctx.fillRect(fx + 5, fy + 22, 4, 6)
          ctx.fillRect(fx + 11, fy + 22, 4, 4)
        } else {
          ctx.fillRect(fx + 8, fy + 22, 4, 4)
          ctx.fillRect(fx + 13, fy + 22, 4, 6)
        }
      } else if (direction === 'right') {
        // Hair
        ctx.fillStyle = hair
        ctx.fillRect(fx + 8, fy + 0, 9, 3)
        ctx.fillRect(fx + 13, fy + 3, 5, 6)
        ctx.fillRect(fx + 17, fy + 1, 1, 2) // curly detail
        
        // Head
        ctx.fillStyle = skin
        ctx.fillRect(fx + 7, fy + 3, 9, 7)
        
        // Sunglasses on side
        ctx.fillStyle = glasses
        ctx.fillRect(fx + 12, fy + 5, 5, 2)
        
        // Beard / Mustache
        ctx.fillStyle = beard
        ctx.fillRect(fx + 12, fy + 7, 4, 1)
        ctx.fillRect(fx + 9, fy + 8, 8, 2)
        
        // Torso (Jacket)
        ctx.fillStyle = jacket
        ctx.fillRect(fx + 6, fy + 10, 12, 12)
        
        // Backpack on right side (drawn on the back / left)
        ctx.fillStyle = '#3a4e3a'
        ctx.fillRect(fx + 7, fy + 12, 3, 10)
        
        // Backpack strap on the right (front)
        ctx.fillStyle = '#2d3b2d'
        ctx.fillRect(fx + 14, fy + 10, 2, 8)
        
        // Legs
        ctx.fillStyle = pants
        if (step === 0) {
          ctx.fillRect(fx + 8, fy + 22, 4, 6)
          ctx.fillRect(fx + 13, fy + 22, 4, 6)
        } else if (step === 1) {
          ctx.fillRect(fx + 7, fy + 22, 4, 6)
          ctx.fillRect(fx + 12, fy + 22, 4, 4)
        } else {
          ctx.fillRect(fx + 9, fy + 22, 4, 4)
          ctx.fillRect(fx + 15, fy + 22, 4, 6)
        }
      }
    }

    const directions = ['down', 'up', 'left', 'right']
    for (let d = 0; d < 4; d++) {
      for (let s = 0; s < 3; s++) {
        drawFrame(s * 24, d * 28, directions[d]!, s)
      }
    }

    // Load custom spritesheet from canvas
    this.textures.addSpriteSheet('hero', canvas as any, { frameWidth: 24, frameHeight: 28 })
  }

  private createAnimations(): void {
    // walk animations mapping to down, up, left, right rows in spritesheet
    this.anims.create({
      key: 'walk-down',
      frames: this.anims.generateFrameNumbers('hero', { frames: [0, 1, 0, 2] }),
      frameRate: 8,
      repeat: -1,
    })

    this.anims.create({
      key: 'walk-up',
      frames: this.anims.generateFrameNumbers('hero', { frames: [3, 4, 3, 5] }),
      frameRate: 8,
      repeat: -1,
    })

    this.anims.create({
      key: 'walk-left',
      frames: this.anims.generateFrameNumbers('hero', { frames: [6, 7, 6, 8] }),
      frameRate: 8,
      repeat: -1,
    })

    this.anims.create({
      key: 'walk-right',
      frames: this.anims.generateFrameNumbers('hero', { frames: [9, 10, 9, 11] }),
      frameRate: 8,
      repeat: -1,
    })
  }

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
}
