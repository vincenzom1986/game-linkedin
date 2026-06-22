import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { PNG } from 'pngjs'

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

// Load PNG
const pngBuffer = readFileSync('public/assets/world/career-city.png')
const png = PNG.sync.read(pngBuffer)
const width = png.width
const height = png.height

const TILE_SIZE = 16
const gridH = Math.ceil(height / TILE_SIZE)
const gridW = Math.ceil(width / TILE_SIZE)

const walkableGrid = Array.from({ length: gridH }, () => Array(gridW).fill(true))

function isWaterPixel(r, g, b) {
  return (b > 120 && b > r + 30 && g > r + 10)
}

// Classify buildings and water in the grid
for (let gy = 0; gy < gridH; gy++) {
  for (let gx = 0; gx < gridW; gx++) {
    const tileX = gx * TILE_SIZE
    const tileY = gy * TILE_SIZE

    // 1. Check if inside any building (using standard building rectangle inset)
    let inBuilding = false
    for (const bld of locations) {
      const bx = bld.x + 46
      const by = bld.y + 20
      const bw = bld.width - 92
      const bh = bld.height - 92
      if (tileX >= bx && tileX < bx + bw && tileY >= by && tileY < by + bh) {
        inBuilding = true
        break
      }
    }

    if (inBuilding) {
      walkableGrid[gy][gx] = false
      continue
    }

    // 2. Check if water
    let waterCount = 0
    let totalSamples = 0
    const startX = gx * TILE_SIZE
    const startY = gy * TILE_SIZE
    const endX = Math.min(width, startX + TILE_SIZE)
    const endY = Math.min(height, startY + TILE_SIZE)

    for (let py = startY; py < endY; py += 2) {
      for (let px = startX; px < endX; px += 2) {
        const idx = (width * py + px) << 2
        const r = png.data[idx]
        const g = png.data[idx + 1]
        const b = png.data[idx + 2]
        totalSamples++
        if (isWaterPixel(r, g, b)) {
          waterCount++
        }
      }
    }

    if (waterCount / totalSamples > 0.3) {
      walkableGrid[gy][gx] = false
    }
  }
}

// Spawn and references must be walkable (carve a 3x3 walkable area around them)
const references = [
  { name: 'spawn', x: 118, y: 420 },
  { name: 'the-big-now-door', x: 286, y: 344 },
  { name: 'sg-holding-door', x: 826, y: 334 },
  { name: 'wunderman-thompson-door', x: 1352, y: 346 },
  { name: 'armando-testa-door', x: 296, y: 760 },
  { name: 'dentsu-door', x: 826, y: 754 },
  { name: 'ey-door', x: 1352, y: 786 },
  { name: 'public-contact', x: 254, y: 868 }
]

references.forEach(p => {
  const gx = Math.floor(p.x / TILE_SIZE)
  const gy = Math.floor(p.y / TILE_SIZE)
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const ny = gy + dy
      const nx = gx + dx
      if (ny >= 0 && ny < gridH && nx >= 0 && nx < gridW) {
        walkableGrid[ny][nx] = true
      }
    }
  }
})

// BFS reachability check
const spawnGx = Math.floor(118 / TILE_SIZE)
const spawnGy = Math.floor(420 / TILE_SIZE)
const queue = [{ x: spawnGx, y: spawnGy }]
const visited = new Set([`${spawnGx},${spawnGy}`])

while (queue.length > 0) {
  const curr = queue.shift()
  const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]
  for (const d of dirs) {
    const nx = curr.x + d.x
    const ny = curr.y + d.y
    if (nx >= 0 && nx < gridW && ny >= 0 && ny < gridH) {
      const key = `${nx},${ny}`
      if (!visited.has(key) && walkableGrid[ny][nx]) {
        visited.add(key)
        queue.push({ x: nx, y: ny })
      }
    }
  }
}

// Validate reachability
let failedReachability = false
references.forEach(p => {
  const gx = Math.floor(p.x / TILE_SIZE)
  const gy = Math.floor(p.y / TILE_SIZE)
  if (!visited.has(`${gx},${gy}`)) {
    console.error(`ERROR: Reference point [${p.name}] at (${p.x}, ${p.y}) is NOT reachable from spawn!`)
    failedReachability = true
  }
})

if (failedReachability) {
  process.exit(1)
}

// Now detect water-only grid for generating water collision rectangles
const isWaterGrid = Array.from({ length: gridH }, () => Array(gridW).fill(false))
for (let gy = 0; gy < gridH; gy++) {
  for (let gx = 0; gx < gridW; gx++) {
    const tileX = gx * TILE_SIZE
    const tileY = gy * TILE_SIZE

    let waterCount = 0
    let totalSamples = 0
    const startX = gx * TILE_SIZE
    const startY = gy * TILE_SIZE
    const endX = Math.min(width, startX + TILE_SIZE)
    const endY = Math.min(height, startY + TILE_SIZE)

    for (let py = startY; py < endY; py += 2) {
      for (let px = startX; px < endX; px += 2) {
        const idx = (width * py + px) << 2
        const r = png.data[idx]
        const g = png.data[idx + 1]
        const b = png.data[idx + 2]
        totalSamples++
        if (isWaterPixel(r, g, b)) {
          waterCount++
        }
      }
    }

    if (waterCount / totalSamples > 0.3) {
      // Exclude tiles around doors and spawn so player can always walk there
      let nearReference = false
      for (const p of references) {
        const distance = Math.hypot(p.x - (tileX + TILE_SIZE / 2), p.y - (tileY + TILE_SIZE / 2))
        if (distance < 24) {
          nearReference = true
          break
        }
      }
      if (!nearReference) {
        isWaterGrid[gy][gx] = true
      }
    }
  }
}

// Merge adjacent water tiles
const waterMerged = Array.from({ length: gridH }, () => Array(gridW).fill(false))
const waterRects = []

for (let y = 0; y < gridH; y++) {
  for (let x = 0; x < gridW; x++) {
    if (isWaterGrid[y][x] && !waterMerged[y][x]) {
      let w = 1
      while (x + w < gridW && isWaterGrid[y][x + w] && !waterMerged[y][x + w]) {
        w++
      }

      let h = 1
      let canExtend = true
      while (y + h < gridH && canExtend) {
        for (let k = 0; k < w; k++) {
          if (!isWaterGrid[y + h][x + k] || waterMerged[y + h][x + k]) {
            canExtend = false
            break
          }
        }
        if (canExtend) h++
      }

      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          waterMerged[y + dy][x + dx] = true
        }
      }

      waterRects.push({
        x: x * TILE_SIZE,
        y: y * TILE_SIZE,
        w: w * TILE_SIZE,
        h: h * TILE_SIZE
      })
    }
  }
}

// Generate the full collisions array
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
  ...waterRects.map((w, idx) =>
    rectangle(`water-${idx}`, 'water', w.x, w.y, w.w, w.h)
  )
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
console.log('Successfully generated public/maps/career-city.json with automatic water collisions')
