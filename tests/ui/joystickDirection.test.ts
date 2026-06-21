import { expect, it } from 'vitest'
import { joystickDirection } from '../../src/ui/joystickDirection'

it('ignora movimenti dentro la dead zone', () => {
  expect(joystickDirection(4, 3, 8)).toEqual({ x: 0, y: 0 })
})

it('normalizza movimenti fuori dalla dead zone', () => {
  const direction = joystickDirection(30, 40, 8)
  expect(direction.x).toBeCloseTo(0.6)
  expect(direction.y).toBeCloseTo(0.8)
})
