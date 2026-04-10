import axios, { type AxiosInstance } from 'axios';
const serverAxios: AxiosInstance = axios.create({
  baseURL: '/api/',
  timeout: 20000
});

export default serverAxios;
