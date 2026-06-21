import { expect, it } from 'vitest'
import map from '../../public/maps/first-location.json'

it('dichiara la collezione tileset richiesta dal parser Phaser', () => {
  expect(map.tilesets).toEqual([])
})
