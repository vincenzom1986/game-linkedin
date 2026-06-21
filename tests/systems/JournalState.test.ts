import { describe, expect, it } from 'vitest'
import { JournalState } from '../../src/systems/JournalState'

describe('JournalState', () => {
  it('registra una scoperta una sola volta', () => {
    const journal = new JournalState()
    journal.discoverLocation('demo-studio')
    journal.discoverLocation('demo-studio')
    expect(journal.snapshot().discoveredLocationIds).toEqual(['demo-studio'])
  })

  it('calcola il progresso delle skill senza duplicati', () => {
    const journal = new JournalState(2)
    journal.collectSkill('typescript')
    journal.collectSkill('typescript')
    expect(journal.snapshot()).toMatchObject({
      collectedSkillIds: ['typescript'],
      skillProgress: 0.5,
    })
  })
})
