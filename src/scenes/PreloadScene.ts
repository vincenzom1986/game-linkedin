import Phaser from 'phaser'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  preload(): void {
    this.load.tilemapTiledJSON('first-location', 'maps/first-location.json')
  }

  create(): void {
    this.createHeroTexture()
    this.createStudioTexture()
  }

  private createHeroTexture(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false)
    graphics.fillStyle(0xf2d07a).fillRect(6, 0, 12, 8)
    graphics.fillStyle(0x315c45).fillRect(3, 8, 18, 14)
    graphics.fillStyle(0x19352a).fillRect(4, 22, 6, 6).fillRect(14, 22, 6, 6)
    graphics.generateTexture('hero', 24, 28)
    graphics.destroy()
  }

  private createStudioTexture(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false)
    graphics.fillStyle(0x342d38).fillRect(0, 0, 160, 32)
    graphics.fillStyle(0xe2b86b).fillRect(8, 32, 144, 96)
    graphics.fillStyle(0x263c46).fillRect(62, 72, 36, 56)
    graphics.fillStyle(0x9ed8cc).fillRect(22, 52, 28, 24).fillRect(110, 52, 28, 24)
    graphics.generateTexture('studio', 160, 128)
    graphics.destroy()
  }
}
