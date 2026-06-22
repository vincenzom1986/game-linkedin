import { mkdirSync, writeFileSync } from 'node:fs'

const locations = [
  { refId: 'the-big-now', x: 90, y: 48, width: 390, height: 340, doorX: 286, doorY: 344 },
  { refId: 'sg-holding', x: 646, y: 34, width: 360, height: 340, doorX: 826, doorY: 334 },
  { refId: 'wunderman-thompson', x: 1138, y: 42, width: 430, height: 350, doorX: 1352, doorY: 346 },
  { refId: 'armando-testa', x: 70, y: 486, width: 450, height: 330, doorX: 296, doorY: 760 },
  { refId: 'dentsu', x: 610, y: 484, width: 430, height: 326, doorX: 826, doorY: 754 },
  { refId: 'ey', x: 1118, y: 454, width: 470, height: 390, doorX: 1352, doorY: 786 },
]

let objectId = 1
const point = (name, type, x, y, properties = []) => ({
  id: objectId++, name, type, point: true, x, y, properties,
})
const rectangle = (name, type, x, y, width, height, properties = []) => ({
  id: objectId++, name, type, x, y, width, height, properties,
})
const ref = (value) => [{ name: 'refId', type: 'string', value }]

const entities = [
  point('spawn', 'spawn', 118, 420),
  ...locations.flatMap((entry) => [
    rectangle(
      entry.refId,
      'location',
      entry.x,
      entry.y,
      entry.width,
      entry.height,
      ref(entry.refId),
    ),
    point(entry.refId + '-door', 'interaction', entry.doorX, entry.doorY, ref(entry.refId)),
  ]),
  point('public-contact', 'contact', 254, 868),
]

const collisions = [
  rectangle('north', 'boundary', 0, 0, 1680, 24),
  rectangle('south', 'boundary', 0, 917, 1680, 24),
  rectangle('west', 'boundary', 0, 0, 24, 941),
  rectangle('east', 'boundary', 1656, 0, 24, 941),
  ...locations.map((entry) =>
    rectangle(
      entry.refId + '-building',
      'building',
      entry.x + 46,
      entry.y + 20,
      entry.width - 92,
      entry.height - 92,
    ),
  ),
  rectangle('top-water', 'water', 1010, 22, 112, 260),
  rectangle('left-canal', 'water', 520, 274, 74, 430),
  rectangle('bottom-water', 'water', 0, 884, 1680, 57),
]

const map = {
  compressionlevel: -1,
  width: 1680,
  height: 941,
  infinite: false,
  layers: [
    { id: 1, name: 'entities', type: 'objectgroup', objects: entities, opacity: 1, visible: true, x: 0, y: 0 },
    { id: 2, name: 'collisions', type: 'objectgroup', objects: collisions, opacity: 1, visible: true, x: 0, y: 0 },
  ],
  nextlayerid: 3,
  nextobjectid: objectId,
  orientation: 'orthogonal',
  renderorder: 'right-down',
  tiledversion: '1.10.2',
  tileheight: 1,
  tilewidth: 1,
  tilesets: [],
  type: 'map',
  version: '1.10',
}

mkdirSync('public/maps', { recursive: true })
writeFileSync('public/maps/career-city.json', JSON.stringify(map, null, 2) + '\n')
console.log('Successfully generated public/maps/career-city.json')
