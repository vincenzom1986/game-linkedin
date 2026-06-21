interface TouchEnvironment {
  maxTouchPoints: number
  coarsePointer: boolean
  width: number
  height: number
}

export function shouldShowTouchControls(environment: TouchEnvironment): boolean {
  return (
    environment.maxTouchPoints > 0 ||
    environment.coarsePointer ||
    environment.width < 760 ||
    environment.height < 500
  )
}
