import type { CareerData } from './types'

function object(value: unknown, path: string): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(path + ' must be an object')
  }
}

function text(value: unknown, path: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(path + ' must be a non-empty string')
  }
}

function textArray(value: unknown, path: string): asserts value is string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(path + ' must be a non-empty array')
  }
  value.forEach((entry, index) => text(entry, path + '[' + index + ']'))
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
  const orders = new Set<number>()
  value.locations.forEach((entry, index) => {
    const path = 'locations[' + index + ']'
    object(entry, path)
    text(entry.id, path + '.id')
    if (ids.has(entry.id)) throw new Error('Duplicate location id: ' + entry.id)
    ids.add(entry.id)
    if (entry.kind !== 'work') throw new Error(path + '.kind must be work')
    if (!Number.isInteger(entry.order) || Number(entry.order) < 1) {
      throw new Error(path + '.order must be a positive integer')
    }
    const order = Number(entry.order)
    if (orders.has(order)) throw new Error('Duplicate location order: ' + order)
    orders.add(order)

    text(entry.name, path + '.name')
    text(entry.building, path + '.building')
    text(entry.period, path + '.period')
    text(entry.role, path + '.role')
    text(entry.summary, path + '.summary')
    textArray(entry.activities, path + '.activities')
    text(entry.experience, path + '.experience')

    object(entry.logo, path + '.logo')
    text(entry.logo.key, path + '.logo.key')
    text(entry.logo.path, path + '.logo.path')
    text(entry.logo.alt, path + '.logo.alt')

    if (!Array.isArray(entry.skills) || entry.skills.length === 0) {
      throw new Error(path + '.skills must be a non-empty array')
    }
    entry.skills.forEach((skill, skillIndex) => {
      object(skill, path + '.skills[' + skillIndex + ']')
      text(skill.id, path + '.skills[' + skillIndex + '].id')
      text(skill.name, path + '.skills[' + skillIndex + '].name')
    })

    object(entry.district, path + '.district')
    text(entry.district.id, path + '.district.id')
    text(entry.district.label, path + '.district.label')
    text(entry.district.landmark, path + '.district.landmark')
    if (!Array.isArray(entry.district.palette) || entry.district.palette.length !== 3) {
      throw new Error(path + '.district.palette must contain three colors')
    }
    entry.district.palette.forEach((color, colorIndex) =>
      text(color, path + '.district.palette[' + colorIndex + ']'),
    )
  })

  object(value.contact, 'contact')
  const allowed = new Set(['linkedin', 'email', 'cvUrl'])
  for (const key of Object.keys(value.contact)) {
    if (!allowed.has(key)) throw new Error('contact contains forbidden field: ' + key)
  }
  text(value.contact.linkedin, 'contact.linkedin')
  text(value.contact.email, 'contact.email')
  if (!String(value.contact.linkedin).startsWith('https://www.linkedin.com/')) {
    throw new Error('contact.linkedin must be a LinkedIn URL')
  }
  if (!String(value.contact.email).includes('@')) {
    throw new Error('contact.email must be an email address')
  }
  if (value.contact.cvUrl !== undefined) text(value.contact.cvUrl, 'contact.cvUrl')
}
