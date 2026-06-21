export interface JournalSnapshot {
  discoveredLocationIds: readonly string[]
  collectedSkillIds: readonly string[]
  skillProgress: number
}

export class JournalState {
  readonly #locations = new Set<string>()
  readonly #skills = new Set<string>()

  constructor(private readonly totalSkills = 0) {}

  discoverLocation(id: string): void {
    this.#locations.add(id)
  }

  collectSkill(id: string): void {
    this.#skills.add(id)
  }

  snapshot(): JournalSnapshot {
    return {
      discoveredLocationIds: [...this.#locations],
      collectedSkillIds: [...this.#skills],
      skillProgress: this.totalSkills === 0 ? 0 : this.#skills.size / this.totalSkills,
    }
  }
}
