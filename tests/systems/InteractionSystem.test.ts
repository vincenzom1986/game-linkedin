import { expect, it } from 'vitest'
import { nearestInteraction } from '../../src/systems/InteractionSystem'

it('sceglie il bersaglio più vicino entro la distanza massima', () => {
  const result = nearestInteraction(
    { x: 0, y: 0 },
    [
      { id: 'far', x: 60, y: 0 },
      { id: 'near', x: 20, y: 0 },
    ],
    48,
  )

  expect(result?.id).toBe('near')
})

it('non propone bersagli fuori portata', () => {
  const result = nearestInteraction({ x: 0, y: 0 }, [{ id: 'far', x: 60, y: 0 }], 48)
  expect(result).toBeUndefined()
})
