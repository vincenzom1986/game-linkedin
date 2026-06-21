export interface MovementVector {
  x: number
  y: number
}

export function movementVector(x: number, y: number, speed: number): MovementVector {
  const length = Math.hypot(x, y)
  if (length === 0) {
    return { x: 0, y: 0 }
  }

  return {
    x: (x / length) * speed,
    y: (y / length) * speed,
  }
}
