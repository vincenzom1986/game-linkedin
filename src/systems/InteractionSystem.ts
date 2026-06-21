export interface Point {
  x: number
  y: number
}

export interface InteractionTarget extends Point {
  id: string
}

export function nearestInteraction<T extends InteractionTarget>(
  origin: Point,
  targets: readonly T[],
  maxDistance: number,
): T | undefined {
  return targets
    .map((target) => ({
      target,
      distance: Math.hypot(target.x - origin.x, target.y - origin.y),
    }))
    .filter(({ distance }) => distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)[0]?.target
}
