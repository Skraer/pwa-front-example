import { fetchApi } from '../config'

const getData = async () => {
  const response = await fetchApi('/mock')
  const data = await response.json()
  return data
}

export { getData }