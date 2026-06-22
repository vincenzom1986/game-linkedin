import { expect, it } from 'vitest'
import { calculateCharTime, getDisplayedText } from '../../src/ui/typewriter'

it('calcola la durata del carattere in base alla lunghezza del testo', () => {
  expect(calculateCharTime(150)).toBe(1)
  expect(calculateCharTime(75)).toBe(2)
  expect(calculateCharTime(0)).toBe(1)
})

it('restituisce il testo corretto in base allo stato di avanzamento e al cursore', () => {
  const text = 'Hello World'
  expect(getDisplayedText(text, 5, true)).toBe('Hello▊')
  expect(getDisplayedText(text, 5, false)).toBe('Hello')
  expect(getDisplayedText(text, 11, true)).toBe('Hello World')
})
