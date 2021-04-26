import { Paths } from '@/Paths'
import axios from 'axios'
import authHeader from '@/util/auth-header'

export default {
  listAllRole: async () => {
    return await axios.post(
      Paths.BASE_URL + Paths.PERMISSION_PATH + '/listAll',
      {},
      {
        headers: authHeader()
      }
    )
  },
  listEmployeeByPermission: async (requestData, roleId) => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.PERMISSION_PATH +
        '/listEmployeeByPermission/' +
        roleId,
      requestData,
      {
        headers: authHeader()
      }
    )
  },
  addPermissionToEmployee: async (employeeId, permissionId) => {
    let params = []
    params.push({ key: 'employeeId', value: employeeId })
    params.push({ key: 'permissionId', value: permissionId })
    return await axios.post(
      Paths.BASE_URL + Paths.PERMISSION_PATH + '/addPermissionToEmployee',
      params,
      {
        headers: authHeader()
      }
    )
  },
  deletePermissionFromEmployee: async (employeeId, permissionId) => {
    let params = []
    params.push({ key: 'employeeId', value: employeeId })
    params.push({ key: 'permissionId', value: permissionId })
    return await axios.post(
      Paths.BASE_URL + Paths.PERMISSION_PATH + '/deletePermissionFromEmployee',
      params,
      {
        headers: authHeader()
      }
    )
  }
}
