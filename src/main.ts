import Phaser from 'phaser'
import './style.css'
import { careerData } from './data/career'
import { assertCareerData } from './data/validateCareerData'
import { createGameConfig } from './game/createGameConfig'
import { BootScene } from './scenes/BootScene'
import { PreloadScene } from './scenes/PreloadScene'

assertCareerData(careerData)
new Phaser.Game({
  ...createGameConfig('game'),
  scene: [BootScene, PreloadScene],
})
