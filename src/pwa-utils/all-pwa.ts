export const getCurrentRegistration = async (): Promise<ServiceWorkerRegistration | undefined> => {
  return await navigator.serviceWorker.getRegistration()
}

export const isSWSupport = (): boolean => 'serviceWorker' in navigator

export const isPushSupport = () => 'Notification' in window && 'PushManager' in window

export const getAnyWorker = (reg: ServiceWorkerRegistration | null | undefined): ServiceWorker | null => {
  if (!reg) return null
  return reg.installing || reg.waiting || reg.active
}

export const isSeparateWindow = (): boolean => {
  return (
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches
  )
}

export const getSeparateWindowMediaQueryList = (): MediaQueryList[] => {
  const queries = [
    window.matchMedia('(display-mode: minimal-ui)'),
    window.matchMedia('(display-mode: standalone)'),
    window.matchMedia('(display-mode: fullscreen)'),
  ]
  return queries
}

export const registerSW = async (swPath: string): Promise<ServiceWorkerRegistration> => {
  const reg = await navigator.serviceWorker.register(swPath, {
    scope: '/',
  })
  return reg
}