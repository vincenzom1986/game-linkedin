import { describe, expect, it } from 'vitest'
import { JournalState } from '../../src/systems/JournalState'

describe('JournalState', () => {
  it('registra una sede una sola volta e calcola il progresso', () => {
    const journal = new JournalState(6)
    journal.discoverLocation('the-big-now')
    journal.discoverLocation('the-big-now')
    journal.discoverLocation('sg-holding')

    expect(journal.snapshot()).toEqual({
      discoveredLocationIds: ['the-big-now', 'sg-holding'],
      locationCount: 2,
      totalLocations: 6,
      locationProgress: 2 / 6,
    })
  })
})
