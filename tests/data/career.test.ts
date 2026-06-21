import { expect, it } from 'vitest'
import { careerData } from '../../src/data/career'
import { assertCareerData } from '../../src/data/validateCareerData'

const expectedIds = [
  'the-big-now',
  'sg-holding',
  'wunderman-thompson',
  'armando-testa',
  'dentsu',
  'ey',
]

it('espone tutte e sei le esperienze lavorative in ordine cronologico', () => {
  expect(() => assertCareerData(careerData)).not.toThrow()
  expect(careerData.locations.map(({ id }) => id)).toEqual(expectedIds)
  expect(careerData.locations.map(({ order }) => order)).toEqual([1, 2, 3, 4, 5, 6])
  expect(careerData.locations.every(({ kind }) => kind === 'work')).toBe(true)
})

it('non conserva placeholder o dati personali esclusi', () => {
  const serialized = JSON.stringify(careerData)
  expect(serialized).not.toContain('demo-studio')
  expect(serialized).not.toContain('hello@example.com')
  expect(Object.keys(careerData.contact).sort()).toEqual(['email', 'linkedin'])
  expect(careerData.contact).toEqual({
    linkedin: 'https://www.linkedin.com/in/vincenzoalbertomarrari/',
    email: 'vincenzoalbertomarrari@gmail.com',
  })
})

it('assegna a ogni sede logo, racconto e tema completi', () => {
  for (const location of careerData.locations) {
    expect(location.logo.key).toBe('logo-' + location.id)
    expect(location.logo.path).toMatch(/^assets\/logos\//)
    expect(location.activities.length).toBeGreaterThanOrEqual(2)
    expect(location.experience.length).toBeGreaterThan(40)
    expect(location.skills.length).toBeGreaterThanOrEqual(2)
    expect(location.district.palette).toHaveLength(3)
  }
})
