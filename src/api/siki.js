import request from '@/utils/request'

export function queryList(data) {
  return request({
    url: '/weapp/queryList',
    method: 'post',
    data: data
  })
}

export function queryAudio(data) {
  return request({
    url: '/weapp/queryAudio',
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

export function updatePublish(data) {
  return request({
    url: '/weapp/updatePublish',
    method: 'post',
    data: data
  })
}

export function publishAudio(data) {
  return request({
    url: '/weapp/publishAudio',
    method: 'post',
    data: data
  })
}
