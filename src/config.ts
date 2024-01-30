export const DEV_API = 'http://localhost:5000/api/v1'
export const PROD_API = 'https://falsebottom.ru/api/v1'


export const fetchApi = (...args: Parameters<typeof fetch>) => fetch(PROD_API + args[0], args[1])
