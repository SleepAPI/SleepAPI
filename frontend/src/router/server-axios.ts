import router from '@/router/router'
import { useUserStore } from '@/stores/user-store'
import axios, { type AxiosInstance } from 'axios'

const serverAxios: AxiosInstance = axios.create({
  baseURL: '/api/',
  timeout: 20000
})

serverAxios.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.tokens && userStore.tokens.accessToken) {
      config.headers.Authorization = `Bearer ${userStore.tokens.accessToken}`
    }
    return config
  },
  (error) => {
    if (error.response) {
      // Server responded with a status other than 2xx
      if (error.response.status === 401) {
        console.error('Unauthorized')
        router.push('/')
      }
    } else if (error.request) {
      // Server timed out
      console.error('Connection to server timed out')
    } else {
      // Other error
      console.error('Something went wrong')
    }
    return Promise.reject(error)
  }
)

export default serverAxios
