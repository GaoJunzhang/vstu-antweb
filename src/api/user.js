import { axios } from '@/utils/request'

const userApi = {
  getUserList: '/user/userListData',
  saveUser: '/user/saveUser',
  delUser: '/user/delUser',
  getAllRoles: '/role/allRoles',
  resetPassword: '/user/resetPassword'
}

export default userApi

export function getUserList (parameter) {
  return axios({
    url: userApi.getUserList,
    method: 'get',
    params: parameter
  })
}

export function saveUser (parameter) {
  return axios({
    url: userApi.saveUser,
    method: 'post',
    data: parameter,
    transformRequest: [function (data) {
      let ret = ''
      for (const it in data) {
        ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
      }
      return ret
    }]
  })
}
export function delUser (ids, parameter) {
  return axios({
    url: userApi.delUser + `/${ids}`,
    method: `delete`,
    params: parameter
  })
}

export function getAllRoles (parameter) {
  return axios({
    url: userApi.getAllRoles,
    method: 'get',
    params: parameter
  })
}

export function resetPassword (parameter) {
  return axios({
    url: userApi.resetPassword,
    method: 'post',
    data: parameter
  })
}
