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

const billboardCenters: Record<string, { x: number; y: number; maxW: number; maxH: number }> = {
  'the-big-now': { x: 306, y: 381, maxW: 50, maxH: 22 },
  'sg-holding': { x: 776, y: 383, maxW: 50, maxH: 22 },
  'wunderman-thompson': { x: 1318, y: 381, maxW: 50, maxH: 22 },
  'armando-testa': { x: 259, y: 792, maxW: 50, maxH: 22 },
  'dentsu': { x: 772, y: 794, maxW: 50, maxH: 22 },
  'ey': { x: 1335, y: 800, maxW: 50, maxH: 22 },
}

const PLAYER_SPEED = 160
const INTERACTION_DISTANCE = 72

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private directionKeys!: DirectionKeys
  private actionKeys: Phaser.Input.Keyboard.Key[] = []
  private interactions: WorldInteraction[] = []
  private readonly journal = new JournalState(careerData.locations.length)
  private facingDirection = 'down'
  private interactionPrompt!: Phaser.GameObjects.Container
  private promptVisible = false
  private promptTween?: Phaser.Tweens.Tween

  constructor() {
    super('world')
  }

  create(): void {
    this.promptVisible = false
    const map = this.make.tilemap({ key: 'career-city' })
    const entities = (map.getObjectLayer('entities')?.objects ?? []) as TiledObject[]
    const worldWidth = map.widthInPixels
    const worldHeight = map.heightInPixels

    // Add city background image
    this.add.image(0, 0, 'career-city-background').setOrigin(0).setDepth(0)

    // Overlay the EY skyscraper
    const eySkyscraper = this.add.image(1164, 474, 'ey-skyscraper').setOrigin(0).setDepth(5)
    eySkyscraper.setDisplaySize(378, 298)

    // Add and animate Flying Cow
    const cow = this.add.image(286, 130, 'flying-cow').setDepth(25)
    cow.setDisplaySize(64, 64)
    this.tweens.add({
      targets: cow,
      y: 130 - 8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Overlay the Dentsu building (centered in its Tiled box)
    const dentsuBuilding = this.add.image(708, 504, 'dentsu-building').setOrigin(0).setDepth(5)
    dentsuBuilding.setDisplaySize(234, 234)

    // Cover the left and right sides of the old Wunderman Thompson building to erase it completely
    const wtPatch = this.add.graphics().setDepth(4)
    wtPatch.fillStyle(0x4a493d, 1)
    wtPatch.fillRect(1184, 62, 76, 120)
    wtPatch.fillRect(1445, 62, 77, 120)
    wtPatch.fillStyle(0x5a804d, 1)
    wtPatch.fillRect(1184, 182, 76, 138)
    wtPatch.fillRect(1445, 182, 77, 138)

    // Overlay the Wunderman Thompson building (centered in its Tiled box)
    const wtBuilding = this.add.image(1260, 62, 'wunderman-thompson-building').setOrigin(0).setDepth(5)
    wtBuilding.setDisplaySize(185, 258)

    // Cover the pre-painted Armando Testa bottom sign text with a cream-colored patch
    const atPatch = this.add.graphics().setDepth(1)
    atPatch.fillStyle(0xd5bc9a, 1)
    atPatch.fillRect(231, 778, 56, 28)

    // Render company logo overlays
    for (const object of entities.filter(({ type }) => type === 'location')) {
      this.renderLocationLogo(object, resolveLocationRef(object, careerData))
    }

    // Create static physics group for all new solid location details
    const obstacleGroup = this.physics.add.staticGroup()

    // 1. SG Company - Aperitif Party
    const guest1 = this.physics.add.sprite(732, 325, 'party-guests').setDepth(12)
    guest1.anims.play('alex-talk')
    obstacleGroup.add(guest1)
    const g1Body = guest1.body as Phaser.Physics.Arcade.Body
    g1Body.setSize(18, 12).setOffset(3, 16)
    guest1.refreshBody()

    const guest2 = this.physics.add.sprite(768, 325, 'party-guests').setDepth(12)
    guest2.anims.play('beatrice-talk')
    obstacleGroup.add(guest2)
    const g2Body = guest2.body as Phaser.Physics.Arcade.Body
    g2Body.setSize(18, 12).setOffset(3, 16)
    guest2.refreshBody()

    const guest3 = this.physics.add.sprite(750, 340, 'party-guests').setDepth(12)
    guest3.anims.play('carlo-talk')
    obstacleGroup.add(guest3)
    const g3Body = guest3.body as Phaser.Physics.Arcade.Body
    g3Body.setSize(18, 12).setOffset(3, 16)
    guest3.refreshBody()

    const table = this.physics.add.image(750, 320, 'party-table').setDepth(11)
    obstacleGroup.add(table)
    const tBody = table.body as Phaser.Physics.Arcade.Body
    tBody.setSize(16, 12).setOffset(4, 16)
    table.refreshBody()

    // 2. Armando Testa - Punt e Mes & Blue Hippo
    const pem = this.physics.add.image(180, 740, 'punt-e-mes').setDepth(12)
    pem.setDisplaySize(48, 63)
    obstacleGroup.add(pem)
    pem.refreshBody()
    const pemBody = pem.body as Phaser.Physics.Arcade.Body
    pemBody.setSize(36, 24).setOffset(6, 39)
    pem.refreshBody()

    const hippo = this.physics.add.image(360, 740, 'blue-hippo').setDepth(12)
    hippo.setDisplaySize(72, 72)
    obstacleGroup.add(hippo)
    hippo.refreshBody()
    const hippoBody = hippo.body as Phaser.Physics.Arcade.Body
    hippoBody.setSize(54, 30).setOffset(9, 42)
    hippo.refreshBody()

    this.tweens.add({
      targets: hippo,
      angle: { from: -3, to: 3 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // 3. Dentsu - Japanese Garden
    const maple = this.physics.add.image(710, 730, 'japanese-maple').setDepth(15)
    maple.setDisplaySize(64, 64)
    obstacleGroup.add(maple)
    maple.refreshBody()
    const mapleBody = maple.body as Phaser.Physics.Arcade.Body
    mapleBody.setSize(24, 16).setOffset(20, 48)
    maple.refreshBody()

    const pond = this.physics.add.image(880, 800, 'koi-pond').setDepth(11)
    pond.setDisplaySize(64, 64)
    obstacleGroup.add(pond)
    pond.refreshBody()
    const pondBody = pond.body as Phaser.Physics.Arcade.Body
    pondBody.setSize(56, 40).setOffset(4, 12)
    pond.refreshBody()

    const lantern = this.physics.add.image(890, 745, 'stone-lantern').setDepth(12)
    lantern.setDisplaySize(24, 36)
    obstacleGroup.add(lantern)
    lantern.refreshBody()
    const lanternBody = lantern.body as Phaser.Physics.Arcade.Body
    lanternBody.setSize(16, 12).setOffset(4, 24)
    lantern.refreshBody()

    // Draw Zen Garden Stepping Stones and Bamboo Fences
    const gardenGraphics = this.add.graphics().setDepth(10)
    gardenGraphics.fillStyle(0x8a8a8a, 1)
    gardenGraphics.fillEllipse(770, 760, 6, 4)
    gardenGraphics.fillEllipse(795, 775, 8, 5)
    gardenGraphics.fillEllipse(820, 790, 7, 4)
    gardenGraphics.fillEllipse(845, 805, 8, 5)

    gardenGraphics.lineStyle(1.5, 0x556b2f, 0.8)
    gardenGraphics.beginPath()
    // Left fence
    gardenGraphics.moveTo(680, 715)
    gardenGraphics.lineTo(740, 715)
    gardenGraphics.lineTo(740, 765)
    // Right fence
    gardenGraphics.moveTo(850, 735)
    gardenGraphics.lineTo(900, 735)
    gardenGraphics.lineTo(900, 770)
    gardenGraphics.strokePath()

    // Maple leaves emitter
    const leafColors = ['leaf-red', 'leaf-orange', 'leaf-bordeaux']
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
      })
      emitter.setDepth(16) // Above tree trunk but behind foliage tops
    })

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
    })
    bubbleEmitter.setDepth(11) // Inside the pond, below player depth

    // periodic ripples
    this.time.addEvent({
      delay: 3500,
      callback: () => {
        const rx = Phaser.Math.Between(730, 770)
        const ry = Phaser.Math.Between(810, 830)
        const ripple = this.add.graphics().setDepth(11)
        ripple.lineStyle(1.5, 0x9ee0ff, 0.6)
        ripple.strokeCircle(rx, ry, 2)
        this.tweens.add({
          targets: ripple,
          scaleX: 6,
          scaleY: 6,
          alpha: 0,
          duration: 1800,
          onComplete: () => {
            ripple.destroy()
          }
        })
      },
      loop: true
    })

    // Sparse Global Fireflies
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
    })
    fireflyEmitter.setDepth(28) // Above buildings, below clouds/floating cow

    const spawn = entities.find(({ type }) => type === 'spawn')
    if (!spawn?.x || !spawn.y) throw new Error('Tilemap is missing a spawn object')

    // Create player sprite
    this.player = this.physics.add.sprite(spawn.x, spawn.y, careerData.player.sprite)
    this.player.setDepth(20).setCollideWorldBounds(true)
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setSize(18, 22).setOffset(3, 6)
    body.setMaxVelocity(PLAYER_SPEED, PLAYER_SPEED)
    body.setDrag(1200, 1200)

    this.createColliders(map)
    this.physics.add.collider(this.player, obstacleGroup)
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
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
      console.log(`Clicked X: ${Math.round(worldPoint.x)}, Y: ${Math.round(worldPoint.y)}`)
    })
    this.createInteractionPrompt()
    this.scene.launch('ui')
    this.game.events.emit('journal:update', this.journal.snapshot())
  }

  update(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body

    if (this.registry.get('panel-open') === true) {
      body.setAcceleration(0, 0)
      this.player.setVelocity(0, 0)
      this.player.anims.stop()
      this.setIdleFrame()
      this.hidePrompt()
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

    let dirX = horizontal
    let dirY = vertical
    const length = Math.hypot(dirX, dirY)
    if (length > 0) {
      dirX /= length
      dirY /= length
    }

    const ACCELERATION = 1400
    if (length > 0) {
      body.setAcceleration(dirX * ACCELERATION, dirY * ACCELERATION)
    } else {
      body.setAcceleration(0, 0)
    }

    // Handle animations based on actual velocity
    const speed = Math.hypot(body.velocity.x, body.velocity.y)
    if (speed > 5) {
      let animKey = 'walk-down'
      if (Math.abs(body.velocity.x) > Math.abs(body.velocity.y)) {
        if (body.velocity.x > 0) {
          animKey = 'walk-right'
          this.facingDirection = 'right'
        } else {
          animKey = 'walk-left'
          this.facingDirection = 'left'
        }
      } else {
        if (body.velocity.y > 0) {
          animKey = 'walk-down'
          this.facingDirection = 'down'
        } else {
          animKey = 'walk-up'
          this.facingDirection = 'up'
        }
      }
      this.player.anims.play(animKey, true)
      // Scale animation speed to match current actual velocity
      this.player.anims.timeScale = speed / PLAYER_SPEED
    } else {
      this.player.anims.stop()
      this.setIdleFrame()
    }

    const target = nearestInteraction(
      { x: this.player.x, y: this.player.y },
      this.interactions,
      INTERACTION_DISTANCE,
    )
    this.game.events.emit('interaction:prompt', Boolean(target))

    const shouldShow = Boolean(target) && (this.registry.get('panel-open') !== true)

    this.interactionPrompt.x = this.player.x
    this.interactionPrompt.y = this.player.y - 32

    if (shouldShow && !this.promptVisible) {
      this.promptVisible = true
      this.interactionPrompt.setVisible(true)
      if (this.promptTween) this.promptTween.stop()
      this.promptTween = this.tweens.add({
        targets: this.interactionPrompt,
        scale: 1,
        alpha: 1,
        duration: 150,
        ease: 'Back.easeOut'
      })
    } else if (!shouldShow && this.promptVisible) {
      this.hidePrompt()
    }

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

  private hidePrompt(): void {
    if (this.promptVisible) {
      this.promptVisible = false
      if (this.promptTween) this.promptTween.stop()
      this.promptTween = this.tweens.add({
        targets: this.interactionPrompt,
        scale: 0,
        alpha: 0,
        duration: 150,
        ease: 'Back.easeIn',
        onComplete: () => {
          this.interactionPrompt.setVisible(false)
        }
      })
    }
  }

  private setIdleFrame(): void {
    if (this.facingDirection === 'down') this.player.setFrame(0)
    else if (this.facingDirection === 'up') this.player.setFrame(3)
    else if (this.facingDirection === 'left') this.player.setFrame(6)
    else if (this.facingDirection === 'right') this.player.setFrame(9)
  }

  private renderLocationLogo(object: TiledObject, location: Location): void {
    const coord = billboardCenters[location.id]
    if (!coord) return

    const { x, y, maxW, maxH } = coord

    // Render logo on top
    if (!this.textures.exists(location.logo.key)) {
      this.add.text(x, y, location.name.toUpperCase(), {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#172036',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(10)
      return
    }

    const logo = this.add.image(x, y, location.logo.key).setDepth(10)
    const size = fitWithin(logo.width, logo.height, maxW, maxH)
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

  private createInteractionPrompt(): void {
    const bubble = this.add.graphics()
    // Draw speech bubble
    bubble.fillStyle(0xfff4cc, 0.95)
    bubble.fillRoundedRect(-40, -18, 80, 26, 4)
    bubble.lineStyle(2, 0x172a1f, 1)
    bubble.strokeRoundedRect(-40, -18, 80, 26, 4)

    // Draw little arrow pointer at bottom
    bubble.fillStyle(0xfff4cc, 0.95)
    bubble.fillTriangle(-6, 8, 6, 8, 0, 14)
    bubble.lineStyle(2, 0x172a1f, 1)
    // Draw dark border lines for the triangle
    bubble.beginPath()
    bubble.moveTo(-6, 8)
    bubble.lineTo(0, 14)
    bubble.lineTo(6, 8)
    bubble.strokePath()
    // Overwrite the border connection
    bubble.fillStyle(0xfff4cc, 1)
    bubble.fillTriangle(-5, 7, 5, 7, 0, 12)

    const text = this.add.text(0, -5, '[SPAZIO]', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#172a1f',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    this.interactionPrompt = this.add.container(0, 0, [bubble, text]).setDepth(30).setVisible(false).setScale(0).setAlpha(0)

    // Floating bounce animation loop - separate animations to maintain relative Y offset
    this.tweens.add({
      targets: bubble,
      y: { from: 0, to: -5 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    this.tweens.add({
      targets: text,
      y: { from: -5, to: -10 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }
}
