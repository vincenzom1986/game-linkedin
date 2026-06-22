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

  constructor() {
    super('world')
  }

  create(): void {
    const map = this.make.tilemap({ key: 'career-city' })
    const entities = (map.getObjectLayer('entities')?.objects ?? []) as TiledObject[]
    const worldWidth = map.widthInPixels
    const worldHeight = map.heightInPixels

    // Add city background image
    this.add.image(0, 0, 'career-city-background').setOrigin(0).setDepth(0)

    // Cover the Dentsu building billboard to remove it completely
    const dentsuBuildingPatch = this.add.graphics().setDepth(1)
    const PATCH_COLORS = [
      0x2e3132, 0x2f3134, 0x484544, 0x645e5a, 0x635e57, 0x494746, 0x2a2b2e, 0x2f2e2e, 0x514942, 0x786952,
      0x826f54, 0x7b674e, 0x68573e, 0x5c503f, 0x3f3f3b, 0x18232b, 0x263640, 0x364a57, 0x384e5b, 0x374c57,
      0x263039, 0x18344b, 0x1d7196, 0x1e7496, 0x1e4a68, 0x234868, 0x215274, 0x205274, 0x245476, 0x245676,
      0x27587a, 0x295478, 0x296586, 0x2987a0, 0x278ba1, 0x2888a0, 0x298aa2, 0x288aa1, 0x2989a1, 0x27879d,
      0x3193a2, 0x4dabb5, 0x49aab5, 0x45a5b0, 0x6db9bf, 0x8dcac6, 0x7cc1bd, 0x77bebb, 0x7abebc, 0x83c2c0,
      0x69babf, 0x41a7b3, 0x45a7b4, 0x47a7b2, 0x409fab, 0x2d8b9d, 0x2a879d, 0x2a899d, 0x2a879c, 0x29859b,
      0x2a889b, 0x2c8b9f, 0x2d839e, 0x205f81, 0x23577b, 0x285a7f, 0x26587c, 0x26567b, 0x25547a, 0x225073,
      0x224f70, 0x1e4464, 0x1f4a68, 0x32799b, 0x276a90, 0x133e56, 0x1b3444, 0x172939, 0x1e2d35, 0x1c232a,
      0x1f2226, 0x21201e, 0x444743, 0x4f5551, 0x4d524f, 0x4f5351, 0x515451, 0x545650, 0x595852, 0x5c584f,
      0x665e48, 0xa68f54, 0xb3934c, 0x372410, 0x121d2e
    ]
    PATCH_COLORS.forEach((color, i) => {
      dentsuBuildingPatch.fillStyle(color, 1)
      dentsuBuildingPatch.fillRect(728 + i, 562, 1, 52)
    })

    // Cover the pre-painted Armando Testa bottom sign text with a cream-colored patch
    const atPatch = this.add.graphics().setDepth(1)
    atPatch.fillStyle(0xd5bc9a, 1)
    atPatch.fillRect(231, 778, 56, 28)

    // Render company logo overlays
    for (const object of entities.filter(({ type }) => type === 'location')) {
      this.renderLocationLogo(object, resolveLocationRef(object, careerData))
    }

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
}
