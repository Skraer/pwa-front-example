import React, { useEffect, useState } from 'react'
import './style.css'
import YesNo from './YesNo'
import { getPushSubscribtion } from '../../pwa-utils/push'
import { getAnyWorker, isSupportSW } from '../../pwa-utils/register'
import { usePWAInfo } from './usePWAInfo'

const workerStateMap = new Map<ServiceWorkerState | null, string>([
  ['activated', 'Активирован'],
  ['activating', 'Активация...'],
  ['installed', 'Установлен'],
  ['installing', 'Установка...'],
  ['redundant', 'Отклонен'],
  [null, 'Неизвестно'],
])

interface Props {
  userId: string | number
}

const PWAInfo: React.FC<Props> = ({ userId }) => {
  const [pushSub, setPushSub] = useState<PushSubscription | null>(null)
  const [supportSW, setSupportSW] = useState<boolean | undefined>(undefined)
  const [worker, setWorker] = useState<ServiceWorker | null>(null)
  const [workerState, setWorkerState] = useState<ServiceWorkerState | null>(null)
  const { coords, isOnline, swState, registration, serviceWorker } = usePWAInfo()

  useEffect(() => {
    getPushSubscribtion().then((sub) => { setPushSub(sub) })
    setSupportSW(isSupportSW())
  }, [])

  // useEffect(() => {
  //   console.log('swState', swState)
      
  // }, [swState])

  useEffect(() => {
    console.log('worker', worker)
    
  }, [worker])

  useEffect(() => {

    // return () => {

    // }
  }, [])

  return <div className='pwa-info'>
    <div className="pwa-row">ID пользователя <input type="text" readOnly value={userId || ''} /></div>
    <div className="pwa-row">Поддержка SW: <YesNo value={!!supportSW} /></div>
    <div className="pwa-row">Подписан на PUSH: <YesNo value={!!pushSub} /></div>
    <div className="pwa-row">Состояние воркера: {workerStateMap.get(workerState)}</div>
    <div className="pwa-row">Состояние сети: {isOnline ? 'Онлайн' : 'Оффлайн'}</div>
    <div className="pwa-row">{registration?.active
      ? 'Регистрация есть'
      : 'Регистрации нет'}</div>
    {/* <div className="pwa-row">Координаты: {coords}</div> */}
  </div>
}

export default PWAInfo