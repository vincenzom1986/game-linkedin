import { expect, it } from 'vitest'
import { careerData } from '../../src/data/career'
import map from '../../public/maps/career-city.json'

type MapObject = {
  type: string
  properties?: Array<{ name: string; value: unknown }>
}

const layer = (name: string) => map.layers.find((entry) => entry.name === name)

it('contiene sei sedi e sei ingressi risolvibili', () => {
  const entities = (layer('entities')?.objects ?? []) as MapObject[]
  const locations = entities.filter(({ type }) => type === 'location')
  const interactions = entities.filter(({ type }) => type === 'interaction')
  const refIds = locations.map(({ properties }) =>
    properties?.find(({ name }) => name === 'refId')?.value,
  )

  expect(locations).toHaveLength(6)
  expect(interactions).toHaveLength(6)
  expect(refIds).toEqual(careerData.locations.map(({ id }) => id))
})

it('dichiara spawn, contatti e collisioni', () => {
  const entities = (layer('entities')?.objects ?? []) as MapObject[]
  expect(entities.filter(({ type }) => type === 'spawn')).toHaveLength(1)
  expect(entities.filter(({ type }) => type === 'contact')).toHaveLength(1)
  expect(layer('collisions')?.objects.length).toBeGreaterThanOrEqual(10)
})

it('usa le dimensioni dello sfondo approvato', () => {
  expect(map).toMatchObject({
    width: 1680,
    height: 941,
    tilewidth: 1,
    tileheight: 1,
    orientation: 'orthogonal',
  })
})
