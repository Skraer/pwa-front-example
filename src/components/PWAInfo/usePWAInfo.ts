import { useEffect, useState } from 'react'
import { getAnyWorker, getCurrentRegistration } from '../../pwa-utils/all-pwa'
// import { useDispatch, useSelector } from 'react-redux'
// import { useHistory } from 'react-router-dom'
// import { checkSeparateWindow } from 'store/pwa'
// import {
//   isSeparateWindowSelector,
//   pwaStatusSelector,
// } from 'store/pwa/selectors'

const getGeoLocation = async (): Promise<GeolocationCoordinates> => {
  return new Promise((res, rej) => {
    navigator.geolocation.getCurrentPosition(
      (position) => { res(position.coords) },
      (err) => { rej(err) }
    )
  })
}

// const getAnyWorker = async (
//   reg?: ServiceWorkerRegistration
// ): Promise<ServiceWorker | null> => {
//   const swReg = reg || (await getSwReg())
//   if (swReg) {
//     return swReg.waiting || swReg.installing || swReg.active
//   }
//   return null
// }

const usePWAInfo = () => {
  // const dispatch = useDispatch()
  const [swState, setSwState] = useState<
    ServiceWorkerState | 'unknown' | 'empty'
  >('unknown')
  // const pwaStatus = useSelector(pwaStatusSelector)
  const [sw, setSw] = useState<ServiceWorker | null>(null)
  const [swReg, setSwReg] = useState<ServiceWorkerRegistration | null>(null)
  // const isSeparateWindow = useSelector(isSeparateWindowSelector)
  // const [isHandlers, setIsHandlers] = useState<boolean>(false)
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null)
  const [coordsErr, setCoordsErr] = useState<GeolocationPositionError | null>(null)

  const onlineHandler = (e: Event) => {
    setIsOnline(true)
  }
  const offlineHandler = (e: Event) => {
    setIsOnline(false)
  }
  useEffect(() => {
    window.addEventListener('online', onlineHandler)
    window.addEventListener('offline', offlineHandler)
    return () => {
      window.removeEventListener('online', onlineHandler)
      window.removeEventListener('offline', offlineHandler)
    }
  }, [])

  useEffect(() => {
    getGeoLocation()
      .then((coords) => {
        setCoords(coords)
        setCoordsErr(null)
      })
      .catch((err) => {
        setCoords(null)
        setCoordsErr(err)
      })
  }, [])

  // const checkSeparateWindowHandler = (e: MediaQueryListEvent) => {
  //   dispatch(checkSeparateWindow.success())
  // }

  // const handleSWMessage = (e: MessageEvent) => {
  //   if (e.data.action === 'go-offline') {
  //     history.push('/offline')
  //   }
  // }

  // useEffect(() => {
  //   if (navigator.serviceWorker) {
  //     navigator.serviceWorker.addEventListener('message', handleSWMessage)
  //   }
  //   return () => {
  //     if(navigator.serviceWorker) {
  //       navigator.serviceWorker.removeEventListener('message', handleSWMessage)
  //     }
  //   }
  // }, [])

  // useEffect(() => {
  //   if (isSeparateWindow && isHandlers) {
  //     getSeparateWindowMediaQueryList().forEach((queryList) => {
  //       queryList.removeEventListener('change', checkSeparateWindowHandler)
  //     })
  //     setIsHandlers(false)
  //     console.log('remove handlers')
  //   }
  // }, [isSeparateWindow])

  // useEffect(() => {
  //   if (!isSeparateWindow) {
  //     getSeparateWindowMediaQueryList().forEach((queryList) => {
  //       queryList.addEventListener('change', checkSeparateWindowHandler)
  //     })
  //     setIsHandlers(true)
  //   }
  // }, [])

  // useEffect(() => {
  //   if (!pwaStatus) return
  //   getCurrentRegistration().then((reg) => {
  //     setSwReg(reg)
  //   })
  // }, [pwaStatus])

  useEffect(() => {
    const foundWorkerHandler = (e: Event) => {
      const reg = (e.target as ServiceWorkerRegistration)
      const worker = getAnyWorker(reg)
      setSw(worker)
    }

    getCurrentRegistration().then((reg) => {
      if (!reg) return
      navigator.serviceWorker.addEventListener('controllerchange', (e) => {
        console.log('СМЕНА КОНТРОЛЛЕРА', e.target)
      })

      setSwReg(reg)
      // const worker = getAnyWorker(reg)
      // if (worker) setSw(worker)
      // else reg.addEventListener('updatefound', foundWorkerHandler)
    })

    return () => {
      if (swReg) swReg.removeEventListener('updatefound', foundWorkerHandler)
    }
  }, [])

  // useEffect(() => )

  useEffect(() => {
    console.log('swReg', swReg)
    
    if (!swReg) return

    // console.log('current status:', swState, 'swReg changed', swReg)
    const worker = getAnyWorker(swReg)
    setSw(worker)

    // getAnyWorker(swReg).then((worker) => {
    //   setSw(worker)
    // })
  }, [swReg])

  const resetSwReg = async () => {
    if (sw) {
      sw.onstatechange = null
      const reg = await getCurrentRegistration()
      if (reg) {
        setSwReg(null)
        setSwReg(reg)
      }
    }
  }

  useEffect(() => {
    // console.log('sw', sw);
    
    if (!sw) return

    setSwState(sw.state)
    sw.onstatechange = (e: { target: any }) => {
      setSwState(sw.state)
      sw.state === 'redundant' && resetSwReg()
    }
  }, [sw])

  return {
    swState,
    isOnline,
    serviceWorker: sw,
    registration: swReg,
    // isSeparateWindow,
    coords,
    coordsErr
  }
}

export { usePWAInfo }
