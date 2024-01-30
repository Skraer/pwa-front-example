import React, { useEffect } from 'react'
import logo from './logo.svg'
import './App.css'
import Page1 from './pages/page1'
import { initUser } from './pwa-utils/initUser'

function App() {
  useEffect(() => {
    initUser()
  }, [])

  return (
    <div className="App">
      <Page1 />
    </div>
  );
}

export default App
