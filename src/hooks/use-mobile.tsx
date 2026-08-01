import * as React from "react"

const MOBILE_BREAKPOINT = 768

// Media-query state via useSyncExternalStore — no setState-in-effect and the
// first render already has the correct value (no false → true flicker).
function subscribe(callback: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot)
}
