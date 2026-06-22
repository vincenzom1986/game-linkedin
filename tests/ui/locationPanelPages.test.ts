import { expect, it } from 'vitest'
import { careerData } from '../../src/data/career'
import { locationPanelPages } from '../../src/ui/locationPanelPages'

it('crea quattro pagine senza perdere contenuti', () => {
  const location = careerData.locations[0]!
  const pages = locationPanelPages(location)

  expect(pages).toHaveLength(4)
  expect(pages[0]).toEqual({
    eyebrow: 'THE BIG NOW · 2016–2017',
    title: 'Digital Strategist',
    body: location.summary,
  })
  expect(pages[1]?.title).toBe('Cosa facevo')
  expect(pages[1]?.body).toContain('• Ricerca di trend e segnali culturali')
  expect(pages[2]).toEqual({
    eyebrow: 'LA MIA ESPERIENZA',
    title: 'Cosa ho imparato',
    body: location.experience,
  })
  expect(pages[3]?.body).toContain('Trend research')
  expect(pages[3]?.body).toContain('Digital strategy')
})
