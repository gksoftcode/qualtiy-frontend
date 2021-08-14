import { Paths } from '@/Paths'
import axios from 'axios'
import authHeader from '@/util/auth-header'

export default {
  autocomplelte: query => {
    let res = axios.post(
      Paths.BASE_URL + Paths.DEPARTMENT_PATH + '/autocomplelte/' + query,
      {},
      {
        headers: authHeader()
      }
    )
    return res
  },
  loadTree: async () => {
    return await axios.get(Paths.BASE_URL + Paths.DEPARTMENT_PATH + '/root', {
      headers: authHeader()
    })
  },
  listDepartments: async () => {
    return await axios.get(
      Paths.BASE_URL + Paths.DEPARTMENT_PATH + '/listDepartments',
      {
        headers: authHeader()
      }
    )
  },
  delete: async department => {
    return await axios.delete(
      Paths.BASE_URL + Paths.DEPARTMENT_PATH + '/' + department.id,
      {
        headers: authHeader()
      }
    )
  },
  list: async requestData => {
    return await axios.post(
      Paths.BASE_URL + Paths.DEPARTMENT_PATH + '/list',
      requestData,
      {
        headers: authHeader()
      }
    )
  },
  listAll: async () => {
    return await axios.post(
      Paths.BASE_URL + Paths.DEPARTMENT_PATH + '/listAll',
      {},
      {
        headers: authHeader()
      }
    )
  },
  save: async department => {
    return await axios.post(
      Paths.BASE_URL + Paths.DEPARTMENT_PATH + '/save/' + department.encId,
      department,
      {
        headers: authHeader()
      }
    )
  },
  setManager: async (department, employee) => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.DEPARTMENT_PATH +
        '/setManager/' +
        department.encId +
        '/' +
        employee.encId,
      {},
      {
        headers: authHeader()
      }
    )
  },
  reOrder: async data => {
    return await axios.post(
      Paths.BASE_URL + Paths.DEPARTMENT_PATH + '/reOrder',
      data,
      {
        headers: authHeader()
      }
    )
  }
}
