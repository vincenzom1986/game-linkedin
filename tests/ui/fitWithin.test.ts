import { expect, it } from 'vitest'
import { fitWithin } from '../../src/ui/fitWithin'

it('ridimensiona un logo largo senza deformarlo', () => {
  expect(fitWithin(400, 100, 112, 40)).toEqual({ width: 112, height: 28 })
})

it('non ingrandisce un logo già piccolo', () => {
  expect(fitWithin(60, 30, 112, 40)).toEqual({ width: 60, height: 30 })
})
