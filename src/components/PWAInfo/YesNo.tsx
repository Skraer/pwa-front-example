import React from 'react'
import './style.css'

const YesNo: React.FC<{ value: boolean }> = ({ value }) => {
  return <span className={value ? 'yes' : 'no'}>{value ? 'Да' : 'Нет'}</span>
}

export default YesNo