import React, { useEffect, useState } from 'react'
import { getAnyWorker, isSupportSW, register } from '../pwa-utils/register'
import {
  askPushPermission,
  fetchPublicKey,
  getPushSubscribtion,
  handleRequestPublicKey,
  isPushSupport,
  sendPush,
  sendPushAll,
  subscribeForPush,
  unsubscribeForPush
} from '../pwa-utils/push'
import { getData } from '../mock-utils'
import './style.css'
import PWAInfo from '../components/PWAInfo'

const Page1: React.FC = () => {
  const [userId, setUserId] = useState<string>('')
  const [userIdForPush, setUserIdForPush] = useState<string>('')
  // const [supportSW, setSupportSW] = useState<boolean | undefined>(undefined)
  const [pushTitle, setPushTitle] = useState<string>('')
  // const [pushSub, setPushSub] = useState<PushSubscription | null>(null)

  useEffect(() => {
    const rawUserData = localStorage.getItem('userData')
    if (rawUserData) setUserId(JSON.parse(rawUserData).id)

    handleRequestPublicKey()

    register('./sw.js').then(() => {
      if (isPushSupport()) askPushPermission()
    })
  }, [])

  const handleSub = async () => {
    await subscribeForPush()
  }

  const handleUnsub = async () => {
    await unsubscribeForPush()
  }

  const handlePushUser = () => {
    sendPush(userIdForPush, pushTitle)
  }

  const handlePushAll = () => {
    sendPushAll()
  }

  return <div className='page1'>
    Страница с инфой по воркеру
    <div className="two-cols">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
        <button onClick={handleSub}>Подписаться на PUSH</button>
        <button onClick={handleUnsub}>Отписаться от PUSH</button>
        <button onClick={handlePushAll}>Отправить PUSH всем</button>
        <div style={{ padding: '6px',  }}>
          <button onClick={handlePushUser}>Отправить PUSH юзеру с ID: </button>
          <input
            type="text"
            placeholder="ID"
            value={userIdForPush}
            onChange={(e) => setUserIdForPush(e.target.value)}
          />
          <textarea
            value={pushTitle}
            onChange={(e) => setPushTitle(e.target.value)}
            maxLength={100}
            placeholder='Сообщение юзеру'
          />
        </div>
        <button onClick={fetchPublicKey}>GET pubKey</button>
      </div>

      <PWAInfo
        userId={userId}
        // swSupport={supportSW}
        // hasPushSub={!!pushSub}
      />
    </div>

  </div>
}

export default Page1