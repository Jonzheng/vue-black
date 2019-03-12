import axios from 'axios'
// import { getToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api 的 base_url
  timeout: 5000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    config.headers['Content-Type'] = 'text/plain; charset=UTF-8'
    // config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
    // config.headers['Content-Type'] = 'multipart/form-data; charset=UTF-8'
    // config.headers['Content-Type'] = 'application/json; charset=utf-8'
    /*
    if (getToken()) {
      config.headers['X-Token'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
      config.headers['Content-Type'] = 'application/json; charset=utf-8'
      console.log('token:\t', getToken())
    } */
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

export default service
