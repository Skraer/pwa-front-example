export const initUser = () => {
  const userData = localStorage.getItem('userData')

  if (!userData) {
    const newData = {
      id: Date.now().toString()
    }
    localStorage.setItem('userData', JSON.stringify(newData))
    // console.log('Данные пользователя инициализированы. ID: ' + newData.id)
  }
}
