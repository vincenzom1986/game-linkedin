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
    this.createHeroSpritesheet()
    this.createAnimations()
    this.scene.start('world')
  }

  private createHeroSpritesheet(): void {
    const canvas = document.createElement('canvas')
    canvas.width = 72
    canvas.height = 112
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Colors for the pixel art character
    const skin = '#f2d07a'
    const shirt = '#315c45'
    const pants = '#19352a'
    const hair = '#45281e'
    const eyes = '#1c1c1c'

    // Helper to draw a single frame (24x28 pixels)
    // step: 0 = standing, 1 = walk left leg, 2 = walk right leg
    const drawFrame = (fx: number, fy: number, direction: string, step: number) => {
      ctx.clearRect(fx, fy, 24, 28)

      if (direction === 'down') {
        // Hair
        ctx.fillStyle = hair
        ctx.fillRect(fx + 6, fy + 0, 12, 3)
        // Head
        ctx.fillStyle = skin
        ctx.fillRect(fx + 6, fy + 3, 12, 7)
        // Eyes
        ctx.fillStyle = eyes
        ctx.fillRect(fx + 8, fy + 6, 2, 2)
        ctx.fillRect(fx + 14, fy + 6, 2, 2)
        // Torso (Shirt)
        ctx.fillStyle = shirt
        ctx.fillRect(fx + 4, fy + 10, 16, 12)
        // Legs / Feet
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
        // Torso
        ctx.fillStyle = shirt
        ctx.fillRect(fx + 4, fy + 10, 16, 12)
        // Legs / Feet
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
        // Head
        ctx.fillStyle = skin
        ctx.fillRect(fx + 8, fy + 3, 9, 7)
        // Torso
        ctx.fillStyle = shirt
        ctx.fillRect(fx + 6, fy + 10, 12, 12)
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
        // Head
        ctx.fillStyle = skin
        ctx.fillRect(fx + 7, fy + 3, 9, 7)
        // Torso
        ctx.fillStyle = shirt
        ctx.fillRect(fx + 6, fy + 10, 12, 12)
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
}
