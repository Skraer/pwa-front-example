const CACHE_VERSION = 4
const STATIC_CACHE_NAME = 'static-v-' + CACHE_VERSION
const DYNAMIC_CACHE_NAME = 'dynamic-v-' + CACHE_VERSION
const ASSET_PATHS = [
  './logo192.png',
  './logo512.png',
  './app-icon/icon-96.png',
  './app-icon/icon-144.png',
  './app-icon/icon-256.png',
  './app-icon/icon-512.png',
]

const checkBrowsers = {
  isOpera() {
    return /Opera|OPR\//.test(navigator.userAgent)
  },
  isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  },
  isFirefox() {
    return /firefox/i.test(navigator.userAgent)
  },
}

const focusOrOpenWindow = async ({ url, ignoreFocus = false, ignoreOpen = false } = {}) => {
  url = url || location.origin

  const clientList = await clients.matchAll({ type: 'window' })
  
  for (const client of clientList) {
    const isEqualUrls = new URL(url).href === new URL(client.url).href
    if (isEqualUrls && 'focus' in client && !client.focused) {
      return ignoreFocus ? undefined : await client.focus()
    }
  }

  if (clients.openWindow) {
    return ignoreOpen ? undefined : await clients.openWindow(url)
  }
}

const deleteUnSupportedNotificationOptions = (options) => {
  const p = Notification.prototype
  const keys = [
    'actions',
    'badge',
    'body',
    'data',
    'dir',
    'icon',
    'image',
    'lang',
    'renotify',
    'requireInteraction',
    'silent',
    'tag',
    'vibrate',
  ]

  keys.forEach(key => { if (!p[key]) delete options[key] })
  return options
}

const preCache = async () => {
  const cache = await caches.open(STATIC_CACHE_NAME)
  try {
    return await cache.addAll(ASSET_PATHS)
  } catch (e) {
    console.error('Pre-fetching failed:', e)
    return
  }
}

self.addEventListener('install', async (event) => {
  // гарантируем, что событие установки не завершится, пока не закэшируются нужные файлы
  await event.waitUntil(preCache())
  // минуем стадию ожидания воркера, активируем сразу после установки
  await self.skipWaiting()
})

self.addEventListener('activate', async (event) => {
  // проходим по всем ключам и удаляем те кэши, которые не соответствуют текущему имени
  const cacheNames = await caches.keys()
  await Promise.all(
    cacheNames
      .filter((name) => name !== STATIC_CACHE_NAME)
      .filter((name) => name !== DYNAMIC_CACHE_NAME)
      .map((name) => caches.delete(name))
  )
})

self.addEventListener('push', async (event) => {
  if (event.data) {
    const data = await event.data.json()
    // полный пример опций для уведомления
    const options = {
      actions: [
        {
          action: 'cancel',
          title: 'Отменить',
          icon: 'app-icon/icon-96.png'
        },
        {
          action: 'submit',
          title: 'Подтвердить',
          icon: 'app-icon/icon-96.png'
        },
      ],
      badge: 'app-icon/icon-96.png',
      body: Date.now(),
      dir: 'ltr',
      icon: 'app-icon/icon-96.png',
      image: 'app-icon/icon-512.png',
      lang: 'ru-RU',
      renotify: true,
      requireInteraction: false,
      tag: 'common-push',
      vibrate: [300, 100, 400],
      data: {
        someDataText: 'Hi',
        someDataArray: [6, 23, 623]
      }
    }
    // удаляем неподдерживаемые браузером пользователя поля из параметров
    const preparedOptions = deleteUnSupportedNotificationOptions(options)

    self.registration.showNotification(data.title, preparedOptions)
  }
})

self.addEventListener('notificationclick', async (event) => {
  // закрываем нативно
  event.notification.close()

  // если нужный экшен - открываем окно
  const action = event.action
  if (action === 'submit') {
    await event.waitUntil(focusOrOpenWindow())
  }
})

const cacheFirst = async (request) => {
  // пробуем найти данные в кэше по запросу
  const cached = await caches.match(request)
  // возвращаем данные из запроса если есть, иначе выполняем запрос
  return cached ? cached : await fetch(request)
}

const networkFirst = async (request) => {
  // берем кэш по нужному имени
  const cache = await caches.open(DYNAMIC_CACHE_NAME)

  // пробуем сделать запрос, и при неудаче берем данные из кэша
  try {
    // берем запрос из события
    const response = await fetch(request)
    // сохраняем в кэш склонированный ответ запроса
    await cache.put(request, response.clone())
    return response
  } catch (e) {
    // в случае неудачи находим закэшированный запрос
    const cached = await cache.match(request)
    // если нашли - отдаем из кэша
    if (cached) return cached

    // в случае, если запроса на ответ нет в кэше, мы находим открытое окно/вкладку,
    // и отправляем сообщение из воркера, которое можно обработать любым образом
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i]
        if (client.focused) {
          return client.postMessage({
            action: 'go-offline',
          })
        }
      }
    })
  }
}

self.addEventListener('fetch', (event) => {
  // берем экземпляр запроса из события и обрабатываем только GET запросы
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== 'GET') return

  // если урл содержит префикс для API, то приоритетом ставим запрос, иначе - кэш
  url.origin === location.origin && !url.href.includes('/api')
    ? event.respondWith(cacheFirst(request))
    : event.respondWith(networkFirst(request))
})
