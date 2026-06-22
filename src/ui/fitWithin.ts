export function fitWithin(
  sourceWidth: number,
  sourceHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight, 1)
  return {
    width: Math.round(sourceWidth * scale),
    height: Math.round(sourceHeight * scale),
  }
}
