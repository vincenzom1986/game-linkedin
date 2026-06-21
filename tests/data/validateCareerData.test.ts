import { describe, expect, it } from 'vitest'
import { assertCareerData } from '../../src/data/validateCareerData'

const validCareer = {
  player: { name: 'Vincenzo', sprite: 'hero' },
  locations: [
    {
      id: 'demo-studio',
      name: 'Sede dimostrativa',
      kind: 'work',
      building: 'studio',
      period: '2026',
      role: 'Product Builder',
      summary: 'Una prima tappa giocabile.',
      skills: [{ id: 'typescript', name: 'TypeScript' }],
    },
  ],
  contact: { linkedin: 'https://www.linkedin.com/', email: 'hello@example.com' },
}

describe('assertCareerData', () => {
  it('accetta una carriera completa', () => {
    expect(() => assertCareerData(validCareer)).not.toThrow()
  })

  it('rifiuta identificativi di sede duplicati', () => {
    const duplicate = {
      ...validCareer,
      locations: [validCareer.locations[0], validCareer.locations[0]],
    }

    expect(() => assertCareerData(duplicate)).toThrow('Duplicate location id: demo-studio')
  })

  it('rifiuta una sede priva di riepilogo', () => {
    const invalid = structuredClone(validCareer)
    delete (invalid.locations[0] as Partial<(typeof invalid.locations)[number]>).summary

    expect(() => assertCareerData(invalid)).toThrow('locations[0].summary must be a non-empty string')
  })
})
