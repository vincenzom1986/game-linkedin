import { expect, it } from 'vitest'
import { careerData } from '../../src/data/career'
import { formatLocationPanel } from '../../src/ui/formatLocationPanel'

it('formatta tutti i contenuti della sede', () => {
  expect(formatLocationPanel(careerData.locations[0]!)).toEqual({
    title: 'Sede dimostrativa',
    meta: 'Product Builder · 2026',
    summary:
      'Questa prima sede verifica il flusso esplorazione → interazione → racconto professionale.',
    projects: ['Game-LinkedIn — Un portfolio esplorabile costruito come gioco top-down.'],
    skills: ['TypeScript', 'Game design'],
  })
})
