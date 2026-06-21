import { expect, it } from 'vitest'
import { careerData } from '../../src/data/career'
import { resolveLocationRef } from '../../src/systems/WorldResolver'

it('risolve il refId Tiled nella sede carriera', () => {
  const object = { properties: [{ name: 'refId', value: 'demo-studio' }] }
  expect(resolveLocationRef(object, careerData).name).toBe('Sede dimostrativa')
})

it('segnala un refId senza contenuto associato', () => {
  const object = { properties: [{ name: 'refId', value: 'missing' }] }
  expect(() => resolveLocationRef(object, careerData)).toThrow('Unknown location refId: missing')
})
