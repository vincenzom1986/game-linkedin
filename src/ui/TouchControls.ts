import Phaser from 'phaser'
import { joystickDirection } from './joystickDirection'
import { shouldShowTouchControls } from './touchControlsVisibility'

const JOYSTICK_RADIUS = 58
const KNOB_RADIUS = 25
const DEAD_ZONE = 8

export class TouchControls {
  private readonly container: Phaser.GameObjects.Container
  private readonly knob: Phaser.GameObjects.Arc
  private readonly enabled: boolean
  private activePointerId?: number
  private suppressed = false

  constructor(private readonly scene: Phaser.Scene) {
    this.enabled = shouldShowTouchControls({
      maxTouchPoints: navigator.maxTouchPoints,
      coarsePointer: window.matchMedia('(pointer: coarse)').matches,
      width: window.innerWidth,
      height: window.innerHeight,
    })

    const base = scene.add
      .circle(92, 452, JOYSTICK_RADIUS, 0x0d1813, 0.68)
      .setStrokeStyle(3, 0xf6d889, 0.8)
      .setInteractive({ useHandCursor: true })
    this.knob = scene.add
      .circle(92, 452, KNOB_RADIUS, 0x9ed8cc, 0.82)
      .setStrokeStyle(2, 0xffffff, 0.72)

    const action = scene.add
      .circle(868, 452, 46, 0x6b3948, 0.84)
      .setStrokeStyle(3, 0xf6d889, 0.9)
      .setInteractive({ useHandCursor: true })
    const actionLabel = scene.add
      .text(868, 452, 'A', {
        fontFamily: 'monospace',
        fontSize: '30px',
        color: '#fff4cc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.container = scene.add
      .container(0, 0, [base, this.knob, action, actionLabel])
      .setScrollFactor(0)
      .setDepth(150)
      .setVisible(this.enabled)

    base.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.activePointerId = pointer.id
      this.updateJoystick(pointer)
    })
    action.on('pointerdown', () => {
      action.setFillStyle(0x9c5267, 1)
      scene.registry.set('touch-action', true)
    })
    action.on('pointerup', () => action.setFillStyle(0x6b3948, 0.84))
    action.on('pointerout', () => action.setFillStyle(0x6b3948, 0.84))

    scene.input.on('pointermove', this.onPointerMove, this)
    scene.input.on('pointerup', this.onPointerUp, this)
  }

  setSuppressed(suppressed: boolean): void {
    this.suppressed = suppressed
    this.container.setVisible(this.enabled && !this.suppressed)
    if (suppressed) {
      this.resetJoystick()
    }
  }

  destroy(): void {
    this.scene.input.off('pointermove', this.onPointerMove, this)
    this.scene.input.off('pointerup', this.onPointerUp, this)
    this.resetJoystick()
    this.container.destroy(true)
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.activePointerId && pointer.isDown) {
      this.updateJoystick(pointer)
    }
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.activePointerId) {
      this.resetJoystick()
    }
  }

  private updateJoystick(pointer: Phaser.Input.Pointer): void {
    const offsetX = pointer.x - 92
    const offsetY = pointer.y - 452
    const direction = joystickDirection(offsetX, offsetY, DEAD_ZONE)
    const distance = Math.min(Math.hypot(offsetX, offsetY), JOYSTICK_RADIUS - KNOB_RADIUS)
    this.knob.setPosition(92 + direction.x * distance, 452 + direction.y * distance)
    this.scene.registry.set('touch-vector', direction)
  }

  private resetJoystick(): void {
    this.activePointerId = undefined
    this.knob.setPosition(92, 452)
    this.scene.registry.set('touch-vector', { x: 0, y: 0 })
  }
}
