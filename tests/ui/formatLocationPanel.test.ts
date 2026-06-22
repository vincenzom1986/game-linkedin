import { expect, it } from 'vitest'
import { careerData } from '../../src/data/career'
import { formatLocationPanel } from '../../src/ui/formatLocationPanel'

it('formatta tutti i contenuti della sede', () => {
  expect(formatLocationPanel(careerData.locations[0]!)).toEqual({
    title: 'The Big Now',
    meta: 'Digital Strategist · 2016–2017',
    summary: 'Trend, strategie digitali e contenuti costruiti attorno a target e posizionamento.',
    projects: [
      'Ricerca di trend e segnali culturali',
      'Sviluppo di strategie digitali e piani editoriali',
      'Creazione di contenuti coerenti con target e posizionamento',
    ],
    skills: ['Trend research', 'Digital strategy', 'Content strategy'],
  })
})
