import { useEffect, useState } from 'react'
import { getAnyWorker } from '../../pwa-utils/register'
import { usePWAInfo } from './usePWAInfo'

const useSWState = () => {
  const [worker, setWorker] = useState<ServiceWorker | null>(null)
  const [workerState, setWorkerState] = useState<ServiceWorkerState | null>(null)

  useEffect(() => {
    // const changeStateHandler = (e: Event) => {
    //   setWorkerState(w.state)
    //   if (w.state === 'redundant') {
        
    //   }
    // }

    // getAnyWorker().then((w) => {
    //   if (w) {
    //     w.addEventListener('statechange', (e) => {
          
    //     })
    //     setWorker(w)
    //   }
    // })
  }, [])

  return [workerState, worker]
}

export default useSWState