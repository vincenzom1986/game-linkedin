import Phaser from 'phaser'
import type { Location } from '../data/types'
import { formatLocationPanel } from '../ui/formatLocationPanel'

export class UIScene extends Phaser.Scene {
  private prompt!: Phaser.GameObjects.Text
  private panel!: Phaser.GameObjects.Container
  private title!: Phaser.GameObjects.Text
  private meta!: Phaser.GameObjects.Text
  private body!: Phaser.GameObjects.Text

  constructor() {
    super('ui')
  }

  create(): void {
    this.prompt = this.add
      .text(480, 490, 'SPAZIO / INVIO — SCOPRI LA SEDE', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#fff4cc',
        backgroundColor: '#172a1fee',
        padding: { x: 16, y: 10 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(false)

    this.panel = this.createPanel()

    this.game.events.on('interaction:prompt', this.onPrompt, this)
    this.game.events.on('location:show', this.showLocation, this)
    this.input.keyboard?.on('keydown-ESC', this.hidePanel, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.removeListeners, this)
  }

  private createPanel(): Phaser.GameObjects.Container {
    const background = this.add.graphics()
    background.fillStyle(0x0d1813, 0.97).fillRoundedRect(0, 0, 720, 400, 18)
    background.lineStyle(4, 0xe2b86b).strokeRoundedRect(0, 0, 720, 400, 18)

    this.title = this.add.text(36, 28, '', {
      fontFamily: 'monospace',
      fontSize: '30px',
      color: '#f6d889',
      fontStyle: 'bold',
    })
    this.meta = this.add.text(36, 72, '', {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#9ed8cc',
    })
    this.body = this.add.text(36, 116, '', {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#f5edd6',
      lineSpacing: 8,
      wordWrap: { width: 648 },
    })

    const close = this.add
      .text(674, 24, '×', {
        fontFamily: 'monospace',
        fontSize: '32px',
        color: '#fff4cc',
      })
      .setInteractive({ useHandCursor: true })
      .on('pointerup', this.hidePanel, this)

    return this.add
      .container(120, 70, [background, this.title, this.meta, this.body, close])
      .setScrollFactor(0)
      .setDepth(200)
      .setVisible(false)
  }

  private onPrompt(visible: boolean): void {
    if (this.registry.get('panel-open') !== true) {
      this.prompt.setVisible(visible)
    }
  }

  private showLocation(location: Location): void {
    const view = formatLocationPanel(location)
    const projects = view.projects.length > 0 ? `\n\nPROGETTI\n${view.projects.join('\n')}` : ''
    const skills = view.skills.length > 0 ? `\n\nSKILL\n${view.skills.join('  •  ')}` : ''

    this.title.setText(view.title)
    this.meta.setText(view.meta)
    this.body.setText(`${view.summary}${projects}${skills}`)
    this.registry.set('panel-open', true)
    this.prompt.setVisible(false)
    this.panel.setVisible(true)
  }

  private hidePanel(): void {
    this.registry.set('panel-open', false)
    this.panel.setVisible(false)
  }

  private removeListeners(): void {
    this.game.events.off('interaction:prompt', this.onPrompt, this)
    this.game.events.off('location:show', this.showLocation, this)
    this.input.keyboard?.off('keydown-ESC', this.hidePanel, this)
  }
}
