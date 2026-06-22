import { expect, it } from 'vitest'
import { careerData } from '../../src/data/career'
import { formatContactPanel } from '../../src/ui/formatContactPanel'

it('espone solo LinkedIn e mailto', () => {
  expect(formatContactPanel(careerData.contact)).toEqual({
    title: 'Restiamo in contatto',
    linkedinLabel: 'LinkedIn',
    linkedinUrl: 'https://www.linkedin.com/in/vincenzoalbertomarrari/',
    emailLabel: 'vincenzoalbertomarrari@gmail.com',
    emailUrl: 'mailto:vincenzoalbertomarrari@gmail.com',
  })
})
