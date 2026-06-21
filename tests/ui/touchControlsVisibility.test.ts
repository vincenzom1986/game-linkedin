import { expect, it } from 'vitest'
import { shouldShowTouchControls } from '../../src/ui/touchControlsVisibility'

it('mostra i controlli in una viewport mobile landscape', () => {
  expect(
    shouldShowTouchControls({
      maxTouchPoints: 0,
      coarsePointer: false,
      width: 844,
      height: 390,
    }),
  ).toBe(true)
})

it('nasconde i controlli in una viewport desktop senza touch', () => {
  expect(
    shouldShowTouchControls({
      maxTouchPoints: 0,
      coarsePointer: false,
      width: 1280,
      height: 720,
    }),
  ).toBe(false)
})
