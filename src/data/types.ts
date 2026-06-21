export interface CareerData {
  player: { name: string; sprite: string }
  locations: Location[]
  contact: Contact
}

export interface Location {
  id: string
  name: string
  kind: 'education' | 'work'
  building: string
  period: string
  role?: string
  summary: string
  projects?: InfoEntry[]
  skills?: Skill[]
  npcs?: Npc[]
  objects?: InteractiveObject[]
}

export interface InfoEntry {
  label: string
  body: string
}

export interface Skill {
  id: string
  name: string
  icon?: string
}

export interface Npc {
  id: string
  name: string
  sprite: string
  lines: string[]
}

export interface InteractiveObject {
  id: string
  label: string
  type: 'project' | 'role' | 'education' | 'achievement' | 'note'
  body: string
}

export interface Contact {
  linkedin: string
  email: string
  cvUrl?: string
}
