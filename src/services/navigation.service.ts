let routerInstance: { push: (path: string) => void } | null = null

export function setRouter(router: { push: (path: string) => void }) {
  routerInstance = router
}

export function navigate(path: string) {
  if (routerInstance) {
    routerInstance.push(path)
  }
}

let onUnauthorized: (() => void) | null = null

export function setOnUnauthorized(cb: () => void) {
  onUnauthorized = cb
}

export function triggerUnauthorized() {
  onUnauthorized?.()
}
