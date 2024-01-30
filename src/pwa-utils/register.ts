export const register = async (path: string): Promise<ServiceWorkerRegistration | typeof Error> => {
  try {
    const reg = await navigator.serviceWorker.register(path, {
      scope: '/',
    })
    console.log('Регистрация воркера завершена удачно :)')
    return reg
  } catch (e: any) {
    console.log('Не удалось зарегистрировать воркер :(')
    return e
  }
}

export const isSupportSW = (): boolean => 'serviceWorker' in navigator

export const getAnyWorker = async (): Promise<ServiceWorker | null> => {
  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) return null
  return reg.active || reg.installing || reg.waiting
}
