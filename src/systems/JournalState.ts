export interface JournalSnapshot {
  discoveredLocationIds: readonly string[]
  locationCount: number
  totalLocations: number
  locationProgress: number
}

export class JournalState {
  readonly #locations = new Set<string>()

  constructor(private readonly totalLocations: number) {}

  discoverLocation(id: string): void {
    this.#locations.add(id)
  }

  snapshot(): JournalSnapshot {
    return {
      discoveredLocationIds: [...this.#locations],
      locationCount: this.#locations.size,
      totalLocations: this.totalLocations,
      locationProgress: this.totalLocations === 0 ? 0 : this.#locations.size / this.totalLocations,
    }
  }
}
