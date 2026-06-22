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
    const x = (object.x ?? 0) + (object.width ?? 0) / 2
    const y = (object.y ?? 0) + 52

    const palette = location.district.palette
    const borderColor = Phaser.Display.Color.HexStringToColor(palette[0]).color
    const accentColor = Phaser.Display.Color.HexStringToColor(palette[1]).color
    const bgColor = 0xfffbf0 // Warm cream/white background for logo visibility

    const graphics = this.add.graphics().setDepth(8)

    // 1. Draw shadow for the sign board
    graphics.fillStyle(0x000000, 0.25)
    graphics.fillRect(x - 62 + 3, y - 26 + 3, 124, 52)
    graphics.fillRect(x - 30 + 3, y + 26 + 3, 6, 20)
    graphics.fillRect(x + 24 + 3, y + 26 + 3, 6, 20)

    // 2. Draw support poles (poles/legs of the billboard)
    graphics.fillStyle(0x2d1b10)
    graphics.fillRect(x - 30, y + 26, 6, 20)
    graphics.fillRect(x + 24, y + 26, 6, 20)

    // 3. Draw outer border (primary theme color)
    graphics.fillStyle(borderColor)
    graphics.fillRect(x - 62, y - 26, 124, 52)

    // 4. Draw inner accent border (secondary theme color)
    graphics.fillStyle(accentColor)
    graphics.fillRect(x - 60, y - 24, 120, 48)

    // 5. Draw inner board background (warm white/cream)
    graphics.fillStyle(bgColor)
    graphics.fillRect(x - 58, y - 22, 116, 44)

    // 6. Render logo on top
    if (!this.textures.exists(location.logo.key)) {
      this.add.text(x, y, location.name.toUpperCase(), {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#172036',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(10)
      return
    }

    const logo = this.add.image(x, y, location.logo.key).setDepth(10)
    const size = fitWithin(logo.width, logo.height, 108, 36)
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
