import { expect, it } from 'vitest'
import { createGameConfig } from '../../src/game/createGameConfig'

it('crea un gioco responsive con fisica arcade', () => {
  const config = createGameConfig('game')
  expect(config.parent).toBe('game')
  expect(config.physics).toMatchObject({ default: 'arcade' })
  expect(config.scale).toMatchObject({ width: 960, height: 540 })
})
