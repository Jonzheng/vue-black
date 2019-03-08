import request from '@/utils/request'

export function queryList(data) {
  return request({
    url: '/weapp/queryList',
    method: 'post',
    data: data
  })
}

export function findImage() {
  return request({
    url: '/weapp/findImage',
    method: 'post'
  })
}
