import { describe, expect, it } from 'vitest'
import { assertCareerData } from '../../src/data/validateCareerData'

const validCareer = {
  player: { name: 'Vincenzo', sprite: 'hero' },
  locations: [{
    id: 'the-big-now',
    name: 'The Big Now',
    kind: 'work',
    order: 1,
    building: 'creative-studio',
    logo: {
      key: 'logo-the-big-now',
      path: 'assets/logos/the-big-now.png',
      alt: 'The Big Now',
    },
    period: '2016–2017',
    role: 'Digital Strategist',
    summary: 'Strategia digitale e contenuti.',
    activities: ['Ricerca trend', 'Piani editoriali'],
    experience: 'Ho costruito le basi del mio approccio strategico ai contenuti.',
    skills: [
      { id: 'digital-strategy', name: 'Digital strategy' },
      { id: 'trend-research', name: 'Trend research' },
    ],
    district: {
      id: 'creative-district',
      label: 'Distretto creativo',
      palette: ['#e95f78', '#45c7d4', '#f0c163'],
      landmark: 'Murales e studio digitale',
    },
  }],
  contact: {
    linkedin: 'https://www.linkedin.com/in/vincenzoalbertomarrari/',
    email: 'vincenzoalbertomarrari@gmail.com',
  },
}

describe('assertCareerData', () => {
  it('accetta una carriera completa', () => {
    expect(() => assertCareerData(validCareer)).not.toThrow()
  })

  it('rifiuta identificativi di sede duplicati', () => {
    const duplicate = { ...validCareer, locations: [validCareer.locations[0], validCareer.locations[0]] }
    expect(() => assertCareerData(duplicate)).toThrow('Duplicate location id: the-big-now')
  })

  it('rifiuta ordini cronologici duplicati', () => {
    const second = structuredClone(validCareer.locations[0])
    second.id = 'second'
    second.logo.key = 'logo-second'
    expect(() => assertCareerData({ ...validCareer, locations: [validCareer.locations[0], second] }))
      .toThrow('Duplicate location order: 1')
  })

  it('rifiuta una sede priva di esperienza', () => {
    const invalid = structuredClone(validCareer)
    delete (invalid.locations[0] as Partial<(typeof invalid.locations)[number]>).experience
    expect(() => assertCareerData(invalid))
      .toThrow('locations[0].experience must be a non-empty string')
  })

  it('rifiuta campi contatto non inclusi nella allowlist', () => {
    const invalid = { ...validCareer, contact: { ...validCareer.contact, phone: '+39 000' } }
    expect(() => assertCareerData(invalid)).toThrow('contact contains forbidden field: phone')
  })

  it('rifiuta strumenti vuoti', () => {
    const invalid = {
      ...validCareer,
      locations: [{ ...validCareer.locations[0]!, tools: ['Social listening', ''] }],
    }
    expect(() => assertCareerData(invalid))
      .toThrow('locations[0].tools[1] must be a non-empty string')
  })

  it('rifiuta icone skill vuote', () => {
    const invalid = {
      ...validCareer,
      locations: [{
        ...validCareer.locations[0]!,
        skills: [
          { ...validCareer.locations[0]!.skills[0]!, icon: ' ' },
          validCareer.locations[0]!.skills[1]!,
        ],
      }],
    }
    expect(() => assertCareerData(invalid))
      .toThrow('locations[0].skills[0].icon must be a non-empty string')
  })
})
