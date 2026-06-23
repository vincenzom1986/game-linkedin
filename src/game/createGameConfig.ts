import type Phaser from 'phaser'

const AUTO_RENDERER = 0
const SCALE_FIT = 3
const CENTER_BOTH = 1

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: AUTO_RENDERER,
    parent,
    backgroundColor: '#172a1f',
    pixelArt: true,
    scale: {
      mode: SCALE_FIT,
      autoCenter: CENTER_BOTH,
      width: 960,
      height: 540,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
  }
}
