import Phaser from 'phaser'
import type { Contact, Location } from '../data/types'
import type { JournalSnapshot } from '../systems/JournalState'
import { formatContactPanel, type ContactPanelViewModel } from '../ui/formatContactPanel'
import { fitWithin } from '../ui/fitWithin'
import { locationPanelPages, type LocationPanelPage } from '../ui/locationPanelPages'
import { TouchControls } from '../ui/TouchControls'

export class UIScene extends Phaser.Scene {
  private prompt!: Phaser.GameObjects.Text
  private progress!: Phaser.GameObjects.Text
  private panel!: Phaser.GameObjects.Container
  private eyebrow!: Phaser.GameObjects.Text
  private title!: Phaser.GameObjects.Text
  private body!: Phaser.GameObjects.Text
  private pageLabel!: Phaser.GameObjects.Text
  private panelLogo!: Phaser.GameObjects.Image
  private contactActions!: Phaser.GameObjects.Container
  private touchControls!: TouchControls
  private pages: LocationPanelPage[] = []
  private pageIndex = 0
  private contactView?: ContactPanelViewModel

  constructor() {
    super('ui')
  }

  create(): void {
    this.prompt = this.add.text(480, 494, 'SPAZIO / INVIO — ESPLORA', {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#fff4cc',
      backgroundColor: '#172a1fee',
      padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setVisible(false)

    this.progress = this.add.text(24, 20, 'SEDI 0 / 6', {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#fff4cc',
      backgroundColor: '#172a1fee',
      padding: { x: 12, y: 8 },
    }).setScrollFactor(0).setDepth(100)

    this.panel = this.createPanel()
    this.touchControls = new TouchControls(this)

    this.game.events.on('interaction:prompt', this.onPrompt, this)
    this.game.events.on('location:show', this.showLocation, this)
    this.game.events.on('contact:show', this.showContact, this)
    this.game.events.on('journal:update', this.updateJournal, this)
    this.input.keyboard?.on('keydown-ESC', this.hidePanel, this)
    this.input.keyboard?.on('keydown-RIGHT', this.nextPage, this)
    this.input.keyboard?.on('keydown-LEFT', this.previousPage, this)
    this.input.keyboard?.on('keydown-ENTER', this.nextPage, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.removeListeners, this)
  }

  private createPanel(): Phaser.GameObjects.Container {
    const background = this.add.graphics()
    background.fillStyle(0x0d1813, 0.97).fillRect(0, 0, 888, 244)
    background.lineStyle(4, 0xe2b86b).strokeRect(0, 0, 888, 244)

    this.eyebrow = this.add.text(28, 22, '', {
      fontFamily: 'monospace', fontSize: '14px', color: '#9ed8cc', fontStyle: 'bold',
    })
    this.title = this.add.text(28, 48, '', {
      fontFamily: 'monospace', fontSize: '25px', color: '#f6d889', fontStyle: 'bold',
    })
    this.body = this.add.text(28, 88, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#f5edd6',
      lineSpacing: 6,
      wordWrap: { width: 820 },
    })
    this.pageLabel = this.add.text(770, 206, '', {
      fontFamily: 'monospace', fontSize: '14px', color: '#9ed8cc',
    })
    this.panelLogo = this.add.image(790, 58, 'hero').setVisible(false)

    const linkedin = this.add.text(0, 0, '[ LINKEDIN ]', {
      fontFamily: 'monospace', fontSize: '16px', color: '#9ed8cc', fontStyle: 'bold',
    }).setInteractive({ useHandCursor: true }).on('pointerup', () => {
      if (this.contactView) {
        window.open(this.contactView.linkedinUrl, '_blank', 'noopener,noreferrer')
      }
    })
    const email = this.add.text(170, 0, '[ EMAIL ]', {
      fontFamily: 'monospace', fontSize: '16px', color: '#f6d889', fontStyle: 'bold',
    }).setInteractive({ useHandCursor: true }).on('pointerup', () => {
      if (this.contactView) window.location.href = this.contactView.emailUrl
    })
    this.contactActions = this.add.container(28, 160, [linkedin, email]).setVisible(false)

    const previous = this.add.text(28, 202, '◀', {
      fontFamily: 'monospace', fontSize: '22px', color: '#fff4cc',
    }).setInteractive({ useHandCursor: true }).on('pointerup', this.previousPage, this)
    const next = this.add.text(72, 202, '▶', {
      fontFamily: 'monospace', fontSize: '22px', color: '#fff4cc',
    }).setInteractive({ useHandCursor: true }).on('pointerup', this.nextPage, this)
    const close = this.add.text(842, 16, '×', {
      fontFamily: 'monospace', fontSize: '30px', color: '#fff4cc',
    }).setInteractive({ useHandCursor: true }).on('pointerup', this.hidePanel, this)

    return this.add.container(36, 276, [
      background,
      this.eyebrow,
      this.title,
      this.body,
      this.pageLabel,
      this.panelLogo,
      this.contactActions,
      previous,
      next,
      close,
    ]).setScrollFactor(0).setDepth(200).setVisible(false)
  }

  private onPrompt(visible: boolean): void {
    if (this.registry.get('panel-open') !== true) this.prompt.setVisible(visible)
  }

  private showLocation(location: Location): void {
    this.pages = locationPanelPages(location)
    this.pageIndex = 0
    this.contactView = undefined
    this.contactActions.setVisible(false)
    if (this.textures.exists(location.logo.key)) {
      this.panelLogo.setTexture(location.logo.key)
      const size = fitWithin(this.panelLogo.width, this.panelLogo.height, 88, 42)
      this.panelLogo.setDisplaySize(size.width, size.height).setVisible(true)
    } else {
      this.panelLogo.setVisible(false)
    }
    this.openPanel()
    this.renderPage()
  }

  private showContact(contact: Contact): void {
    const view = formatContactPanel(contact)
    this.contactView = view
    this.panelLogo.setVisible(false)
    this.contactActions.setVisible(true)
    this.pages = [{
      eyebrow: 'CONTATTI PUBBLICI',
      title: view.title,
      body: 'Scegli un canale pubblico.\n\n' + view.linkedinUrl + '\n' + view.emailLabel,
    }]
    this.pageIndex = 0
    this.openPanel()
    this.renderPage()
  }

  private openPanel(): void {
    this.registry.set('panel-open', true)
    this.prompt.setVisible(false)
    this.panel.setVisible(true)
    this.touchControls.setSuppressed(true)
  }

  private renderPage(): void {
    const page = this.pages[this.pageIndex]
    if (!page) return
    this.eyebrow.setText(page.eyebrow)
    this.title.setText(page.title)
    this.body.setText(page.body)
    this.pageLabel.setText(String(this.pageIndex + 1) + ' / ' + String(this.pages.length))
  }

  private nextPage(): void {
    if (!this.panel.visible) return
    if (this.pageIndex < this.pages.length - 1) {
      this.pageIndex += 1
      this.renderPage()
    }
  }

  private previousPage(): void {
    if (!this.panel.visible) return
    if (this.pageIndex > 0) {
      this.pageIndex -= 1
      this.renderPage()
    }
  }

  private updateJournal(snapshot: JournalSnapshot): void {
    this.progress.setText('SEDI ' + snapshot.locationCount + ' / ' + snapshot.totalLocations)
    this.progress.setColor(snapshot.locationProgress === 1 ? '#ffe23f' : '#fff4cc')
  }

  private hidePanel(): void {
    this.registry.set('panel-open', false)
    this.panel.setVisible(false)
    this.contactActions.setVisible(false)
    this.contactView = undefined
    this.touchControls.setSuppressed(false)
  }

  private removeListeners(): void {
    this.game.events.off('interaction:prompt', this.onPrompt, this)
    this.game.events.off('location:show', this.showLocation, this)
    this.game.events.off('contact:show', this.showContact, this)
    this.game.events.off('journal:update', this.updateJournal, this)
    this.input.keyboard?.off('keydown-ESC', this.hidePanel, this)
    this.input.keyboard?.off('keydown-RIGHT', this.nextPage, this)
    this.input.keyboard?.off('keydown-LEFT', this.previousPage, this)
    this.input.keyboard?.off('keydown-ENTER', this.nextPage, this)
    this.touchControls.destroy()
  }
}
