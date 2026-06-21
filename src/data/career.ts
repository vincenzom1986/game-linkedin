import type { CareerData } from './types'

export const careerData: CareerData = {
  player: {
    name: 'Vincenzo',
    sprite: 'hero',
  },
  locations: [
    {
      id: 'demo-studio',
      name: 'Sede dimostrativa',
      kind: 'work',
      building: 'studio',
      period: '2026',
      role: 'Product Builder',
      summary:
        'Questa prima sede verifica il flusso esplorazione → interazione → racconto professionale.',
      projects: [
        {
          label: 'Game-LinkedIn',
          body: 'Un portfolio esplorabile costruito come gioco top-down.',
        },
      ],
      skills: [
        { id: 'typescript', name: 'TypeScript' },
        { id: 'game-design', name: 'Game design' },
      ],
    },
  ],
  contact: {
    linkedin: 'https://www.linkedin.com/',
    email: 'hello@example.com',
  },
}
