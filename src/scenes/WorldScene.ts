import Phaser from 'phaser'
import { careerData } from '../data/career'
import type { Location } from '../data/types'
import { nearestInteraction } from '../systems/InteractionSystem'
import { JournalState } from '../systems/JournalState'
import { movementVector } from '../systems/MovementSystem'
import { resolveLocationRef } from '../systems/WorldResolver'

interface LocationInteraction {
  id: string
  x: number
  y: number
  location: Location
}

interface DirectionKeys {
  W: Phaser.Input.Keyboard.Key
  A: Phaser.Input.Keyboard.Key
  S: Phaser.Input.Keyboard.Key
  D: Phaser.Input.Keyboard.Key
}

const PLAYER_SPEED = 160
const INTERACTION_DISTANCE = 72

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private directionKeys!: DirectionKeys
  private actionKeys: Phaser.Input.Keyboard.Key[] = []
  private interactions: LocationInteraction[] = []
  private readonly journal = new JournalState(
    careerData.locations.reduce((total, location) => total + (location.skills?.length ?? 0), 0),
  )

  constructor() {
    super('world')
  }

  create(): void {
    const map = this.make.tilemap({ key: 'first-location' })
    const worldWidth = map.widthInPixels
    const worldHeight = map.heightInPixels
    const entities = map.getObjectLayer('entities')?.objects ?? []

    this.drawWorld(worldWidth, worldHeight)

    const locationObject = entities.find(({ type }) => type === 'location')
    if (!locationObject) {
      throw new Error('Tilemap is missing a location object')
    }
    const location = resolveLocationRef(locationObject, careerData)
    this.add
      .image(
        locationObject.x! + locationObject.width! / 2,
        locationObject.y! + locationObject.height! / 2,
        location.building,
      )
      .setOrigin(0.5)
      .setDepth(2)

    const spawn = entities.find(({ type }) => type === 'spawn')
    if (!spawn) {
      throw new Error('Tilemap is missing a spawn object')
    }

    this.player = this.physics.add.sprite(spawn.x!, spawn.y!, careerData.player.sprite)
    this.player.setDepth(4).setCollideWorldBounds(true)
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setSize(18, 22).setOffset(3, 6)

    this.createColliders(map)
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight)
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight)
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12)

    const interactionObjects = entities.filter(({ type }) => type === 'interaction')
    this.interactions = interactionObjects.map((object) => ({
      id: object.name,
      x: object.x!,
      y: object.y!,
      location: resolveLocationRef(object, careerData),
    }))

    const keyboard = this.input.keyboard
    if (!keyboard) {
      throw new Error('Keyboard input is unavailable')
    }
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
  }

  update(): void {
    if (this.registry.get('panel-open') === true) {
      this.player.setVelocity(0, 0)
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
    const velocity = movementVector(horizontal, vertical, PLAYER_SPEED)
    this.player.setVelocity(velocity.x, velocity.y)

    const target = nearestInteraction(
      { x: this.player.x, y: this.player.y },
      this.interactions,
      INTERACTION_DISTANCE,
    )
    this.game.events.emit('interaction:prompt', Boolean(target))

    const keyboardAction = this.actionKeys.some((key) => Phaser.Input.Keyboard.JustDown(key))
    const touchAction = this.registry.get('touch-action') === true
    if (touchAction) {
      this.registry.set('touch-action', false)
    }

    if (target && (keyboardAction || touchAction)) {
      this.journal.discoverLocation(target.location.id)
      this.registry.set('journal', this.journal.snapshot())
      this.game.events.emit('location:show', target.location)
    }
  }

  private drawWorld(width: number, height: number): void {
    const graphics = this.add.graphics().setDepth(0)
    graphics.fillStyle(0x477a52).fillRect(0, 0, width, height)
    graphics.fillStyle(0x78a85d)
    for (let x = 64; x < width; x += 96) {
      for (let y = 64; y < height; y += 96) {
        graphics.fillRect(x, y, 4, 4)
      }
    }
    graphics.fillStyle(0xc7a86a).fillRoundedRect(80, 416, 560, 76, 18)
    graphics.fillRoundedRect(554, 292, 76, 178, 18)

    this.add
      .text(56, 52, 'QUARTIERE LAVORO', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#f5e7bd',
        backgroundColor: '#19352acc',
        padding: { x: 12, y: 8 },
      })
      .setDepth(3)
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
