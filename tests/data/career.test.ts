import { expect, it } from 'vitest'
import { careerData } from '../../src/data/career'
import { assertCareerData } from '../../src/data/validateCareerData'

it('espone dati demo validi per la prima sede', () => {
  expect(() => assertCareerData(careerData)).not.toThrow()
  expect(careerData.locations.map(({ id }) => id)).toEqual(['demo-studio'])
})
