import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { careerData } from '../../src/data/career'

describe('career assets', () => {
  it('include lo sfondo top-down approvato', () => {
    const path = join(process.cwd(), 'public/assets/world/career-city.png')
    expect(existsSync(path)).toBe(true)
    const png = readFileSync(path)
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1680, 941])
  })

  it('include un logo locale per ogni azienda', () => {
    for (const location of careerData.locations) {
      expect(
        existsSync(join(process.cwd(), 'public', location.logo.path)),
        location.logo.path,
      ).toBe(true)
    }
  })

  it('documenta tutte le aziende nei credits', async () => {
    const credits = await import('node:fs/promises').then(({ readFile }) =>
      readFile(join(process.cwd(), 'public/assets/CREDITS.md'), 'utf8'),
    )
    for (const location of careerData.locations) {
      expect(credits).toContain(location.name)
    }
  })
})
