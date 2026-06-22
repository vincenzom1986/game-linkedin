export function calculateCharTime(textLength: number, totalDuration: number = 150): number {
  if (textLength <= 0) return 1
  return Math.max(1, Math.floor(totalDuration / textLength))
}

export function getDisplayedText(
  fullText: string,
  typedLength: number,
  showCursor: boolean,
  cursorChar: string = '▊'
): string {
  const displayed = fullText.substring(0, typedLength)
  if (typedLength >= fullText.length) {
    return fullText
  }
  return displayed + (showCursor ? cursorChar : '')
}
