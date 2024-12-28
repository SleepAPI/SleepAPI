import { useUserStore } from '@/stores/user-store'
import axios, { type AxiosInstance } from 'axios'

const serverAxios: AxiosInstance = axios.create({
  baseURL: '/api/',
  timeout: 20000
})

serverAxios.interceptors.request.use(
  async (config) => {
    const userStore = useUserStore()
    if (userStore.tokens) {
      await userStore.refresh()
      config.headers.Authorization = `Bearer ${userStore.tokens.accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

serverAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const userStore = useUserStore()
    if (error.response) {
      // Server responded with a status other than 2xx
      if (error.response.status === 401) {
        logger.error('Unauthorized')
        userStore.logout()
      }
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      // Server timed out
      logger.error('Connection to server timed out')
    } else {
      // Other error
      logger.error('Something went wrong')
    }
    return Promise.reject(error)
  }
)

export default serverAxios
