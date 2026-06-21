export interface JoystickDirection {
  x: number
  y: number
}

export function joystickDirection(
  x: number,
  y: number,
  deadZone: number,
): JoystickDirection {
  const length = Math.hypot(x, y)
  if (length <= deadZone) {
    return { x: 0, y: 0 }
  }

  return {
    x: x / length,
    y: y / length,
  }
}
