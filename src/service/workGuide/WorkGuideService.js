import { Paths } from '@/Paths'
import axios from 'axios'
import authHeader from '@/util/auth-header'

export default {
  list: async requestData => {
    return await axios.post(
      Paths.BASE_URL + Paths.WORK_GUIDE_PATH + '/list',
      requestData,
      {
        headers: authHeader()
      }
    )
  },
  search: async requestData => {
    return await axios.post(
      Paths.BASE_URL + Paths.WORK_GUIDE_PATH + '/search',
      requestData,
      {
        headers: authHeader()
      }
    )
  },
  save: async work_guide => {
    return await axios.post(
      Paths.BASE_URL + Paths.WORK_GUIDE_PATH + '/save/' + work_guide.encId,
      work_guide,
      {
        headers: authHeader()
      }
    )
  },
  delete: async work_guide => {
    return await axios.delete(
      Paths.BASE_URL + Paths.WORK_GUIDE_PATH + '/' + work_guide.id,
      {
        headers: authHeader()
      }
    )
  },
  getOne: async encId => {
    return await axios.get(
      Paths.BASE_URL + Paths.WORK_GUIDE_PATH + '/' + encId,
      { headers: authHeader() }
    )
  },
  getPermissionById: async encId => {
    return await axios.post(
      Paths.BASE_URL + Paths.WORK_GUIDE_PATH + '/getPermission/' + encId,
      {},
      { headers: authHeader() }
    )
  },
  listTransactionByWorkGuide: async encId => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.WORK_GUIDE_PATH +
        '/listTransactionByWorkGuide/' +
        encId,
      {},
      { headers: authHeader() }
    )
  },
  getByDepartmentEdit: async (departmentIdEnc, type) => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.WORK_GUIDE_PATH +
        '/getByDepartment' +
        '/' +
        departmentIdEnc +
        '/' +
        type,
      {},
      { headers: authHeader() }
    )
  },
  getByDepartment: async (departmentIdEnc, type) => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.WORK_GUIDE_PATH_VIEW +
        '/getByDepartment' +
        '/' +
        departmentIdEnc +
        '/' +
        type,
      {},
      { headers: authHeader() }
    )
  },
  updateStatus: async (encId, toStatus, remarksTxt) => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.WORK_GUIDE_PATH +
        '/updateStatus' +
        '/' +
        encId +
        '/' +
        toStatus,
      { remarks: remarksTxt },
      { headers: authHeader() }
    )
  },
  listAll: async () => {
    return await axios.post(
      Paths.BASE_URL + Paths.WORK_GUIDE_PATH + '/listAll',
      {},
      {
        headers: authHeader()
      }
    )
  },
  canDuplicate: async departmentEncId => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.WORK_GUIDE_PATH +
        '/canDuplicate/' +
        departmentEncId,
      {},
      { headers: authHeader() }
    )
  },
  canCreateNew: async departmentEncId => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.WORK_GUIDE_PATH +
        '/canCreateNew/' +
        departmentEncId,
      {},
      { headers: authHeader() }
    )
  }
}
