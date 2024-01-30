import { fetchApi } from "../config"

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

const buffersEquals = (buf1: ArrayBuffer, buf2: ArrayBuffer): boolean => {
  if (!buf1.byteLength || !buf2.byteLength) return false
  if (buf1.byteLength !== buf2.byteLength) return false
  const dv1 = new Int8Array(buf1)
  const dv2 = new Int8Array(buf2)
  for (let i = 0; i !== buf1.byteLength; i++) {
    if (dv1[i] != dv2[i]) return false
  }
  return true
}

export const isPushSupport = (): boolean => 'Notification' in window && 'PushManager' in window

export const askPushPermission = async (): Promise<NotificationPermission> => {
  const state = Notification.permission
  console.log('Текущее состояние разрешения на PUSH-уведомления: ' + state)

  if (state === 'default') {
    const permission = await Notification.requestPermission()
    console.log('Состояние разрешения на PUSH-уведомления изменено на: ' + permission)
    
    return permission
  }
  if (state === 'denied') {
    alert('Уведомления запрещены. Разрешите уведомления и перезагрузите страницу')
    setTimeout(() => {
      window.location.reload()
    }, 10000)
  }
  return state
}

export const fetchPublicKey = async () => {
  const response = await fetchApi('/push/pubkey')
  const key = await response.json()
  return key
  // localStorage.setItem('publicKey', key)
  // console.log(`Ключ ${key} записан`)
}

export const handleRequestPublicKey = async () => {
  const key = await fetchPublicKey()
  const currKey = localStorage.getItem('publicKey')
  if (currKey !== key) {
    localStorage.setItem('publicKey', key)
    await unsubscribeForPush()
    console.log('Ключи различны. Новый ключ записан, подписка на PUSH убрана')
  }
}

export const requestSubscribeForPush = async (subscription: PushSubscription) => {
  const response = await fetchApi('/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({
      subscription,
      userId: JSON.parse(localStorage.getItem('userData')!).id
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const result = await response.json()
  console.log(result)
}

export const requestUnsubscribeForPush = async () => {
  const response = await fetchApi('/push/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({
      userId: JSON.parse(localStorage.getItem('userData')!).id
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const result = await response.json()
  console.log(result)
}

export const subscribeForPush = async (): Promise<PushSubscription> => {
  const reg = await navigator.serviceWorker.getRegistration()

  if (!reg) {
    throw new Error('Not have active service worker registration')
  }

  const currentSub = await reg.pushManager.getSubscription()
  const key = localStorage.getItem('publicKey') as string

  const encKey = urlBase64ToUint8Array(key)
  const currentEncKey = currentSub?.options.applicationServerKey

  // if (currentSub && currentEncKey && !buffersEquals(encKey, currentEncKey)) {
  //   await this.unsubscribeForPush()
  // }

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: encKey,
  })
  
  await requestSubscribeForPush(subscription)

  return subscription
}

export const unsubscribeForPush = async () => {
  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) return

  const currentSub = await reg.pushManager.getSubscription()
  let status = false

  if (currentSub) {
    try {
      await requestUnsubscribeForPush()
      status = await currentSub.unsubscribe()
    } catch (err) {
      console.error(err)
    }
  }
  return status
}

export const sendPush = async (userId: string | number, pushTitle?: string) => {
  const body: { userId: string | number, title?: string } = { userId }
  if (pushTitle) body.title = pushTitle

  await fetchApi('/push/send', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const sendPushAll = async () => {
  await fetchApi('/push/send-all', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const getPushSubscribtion = async () => {
  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) return null
  const sub = await reg.pushManager.getSubscription()
  return sub || null
}