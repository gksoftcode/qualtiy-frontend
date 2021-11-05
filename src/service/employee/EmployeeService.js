import { Paths } from '@/Paths'
import axios from 'axios'
import authHeader from '@/util/auth-header'

export default {
  autocomplelte: query => {
    let res = axios.post(
      Paths.BASE_URL + Paths.EMPLOYEE_PATH + '/autocomplelte/' + query,
      {},
      {
        headers: authHeader()
      }
    )
    return res
  },
  list: async requestData => {
    return await axios.post(
      Paths.BASE_URL + Paths.EMPLOYEE_PATH + '/list',
      requestData,
      {
        headers: authHeader()
      }
    )
  },
  search: async requestData => {
    return await axios.post(
      Paths.BASE_URL + Paths.EMPLOYEE_PATH + '/search',
      requestData,
      {
        headers: authHeader()
      }
    )
  },
  searchByDepartment: async requestData => {
    return await axios.post(
      Paths.BASE_URL + Paths.EMPLOYEE_PATH + '/searchByDepartment',
      requestData,
      {
        headers: authHeader()
      }
    )
  },
  listAll: async () => {
    return await axios.post(
      Paths.BASE_URL + Paths.EMPLOYEE_PATH + '/listAll',
      {},
      {
        headers: authHeader()
      }
    )
  },
  findEmployee: async searchData => {
    return await axios.post(
      Paths.BASE_URL + Paths.EMPLOYEE_PATH + '/findEmployee',
      searchData,
      {
        headers: authHeader()
      }
    )
  },
  listAllEmployeeByDepartment: async requestData => {
    return await axios.post(
      Paths.BASE_URL + Paths.EMPLOYEE_PATH + '/listByDepartments',
      requestData,
      {
        headers: authHeader()
      }
    )
  },
  listByDepartment: async departmentEncId => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.EMPLOYEE_PATH +
        '/listByDepartment/' +
        departmentEncId,
      {},
      {
        headers: authHeader()
      }
    )
  },
  save: async employee => {
    if (employee.encId === -1) {
      return await axios.post(
        Paths.BASE_URL + Paths.EMPLOYEE_PATH + '/create',
        employee,
        {
          headers: authHeader()
        }
      )
    } else {
      return await axios.post(
        Paths.BASE_URL +
          Paths.EMPLOYEE_PATH +
          '/saveAndUpdate/' +
          employee.encId,
        employee,
        {
          headers: authHeader()
        }
      )
    }
  },
  resetPassword: async employee => {
    return await axios.post(
      Paths.BASE_URL + Paths.EMPLOYEE_PATH + '/resetPassword',
      employee.encId,
      {
        headers: authHeader()
      }
    )
  },
  changePassword: async data => {
    return await axios.post(
      Paths.BASE_URL + Paths.EMPLOYEE_PATH + '/changePassword',
      data,
      {
        headers: authHeader()
      }
    )
  }
}
