export interface CareerData {
  player: { name: string; sprite: string }
  locations: Location[]
  contact: Contact
}

export interface LogoAsset {
  key: string
  path: string
  alt: string
}

export interface DistrictTheme {
  id: string
  label: string
  palette: [string, string, string]
  landmark: string
}

export interface Location {
  id: string
  name: string
  kind: 'work'
  order: number
  building: string
  logo: LogoAsset
  period: string
  role: string
  summary: string
  activities: string[]
  experience: string
  skills: Skill[]
  tools?: string[]
  district: DistrictTheme
}

export interface Skill {
  id: string
  name: string
  icon?: string
}

export interface Contact {
  linkedin: string
  email: string
  cvUrl?: string
}
