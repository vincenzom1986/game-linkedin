import { expect, it } from 'vitest'
import { movementVector } from '../../src/systems/MovementSystem'

it('mantiene la stessa velocità in diagonale', () => {
  const vector = movementVector(1, 1, 160)
  expect(Math.hypot(vector.x, vector.y)).toBeCloseTo(160)
})

it('restituisce zero senza input', () => {
  expect(movementVector(0, 0, 160)).toEqual({ x: 0, y: 0 })
})
