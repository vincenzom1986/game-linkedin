import type { CareerData } from './types'

function object(value: unknown, path: string): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${path} must be an object`)
  }
}

function text(value: unknown, path: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${path} must be a non-empty string`)
  }
}

export function assertCareerData(value: unknown): asserts value is CareerData {
  object(value, 'career')
  object(value.player, 'player')
  text(value.player.name, 'player.name')
  text(value.player.sprite, 'player.sprite')

  if (!Array.isArray(value.locations) || value.locations.length === 0) {
    throw new Error('locations must be a non-empty array')
  }

  const ids = new Set<string>()
  value.locations.forEach((entry, index) => {
    object(entry, `locations[${index}]`)
    text(entry.id, `locations[${index}].id`)
    if (ids.has(entry.id)) {
      throw new Error(`Duplicate location id: ${entry.id}`)
    }
    ids.add(entry.id)
    text(entry.name, `locations[${index}].name`)
    if (entry.kind !== 'education' && entry.kind !== 'work') {
      throw new Error(`locations[${index}].kind must be education or work`)
    }
    text(entry.building, `locations[${index}].building`)
    text(entry.period, `locations[${index}].period`)
    text(entry.summary, `locations[${index}].summary`)
  })

  object(value.contact, 'contact')
  text(value.contact.linkedin, 'contact.linkedin')
  text(value.contact.email, 'contact.email')
}
