import type { CareerData, Location } from '../data/types'

interface TiledObjectLike {
  properties?: Array<{ name: string; value: unknown }>
}

export function resolveLocationRef(object: TiledObjectLike, career: CareerData): Location {
  const refId = object.properties?.find(({ name }) => name === 'refId')?.value
  if (typeof refId !== 'string') {
    throw new Error('Location object is missing string refId')
  }

  const location = career.locations.find(({ id }) => id === refId)
  if (!location) {
    throw new Error(`Unknown location refId: ${refId}`)
  }

  return location
}
