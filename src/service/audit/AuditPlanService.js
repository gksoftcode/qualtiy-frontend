import { Paths } from '@/Paths'
import axios from 'axios'
import authHeader from '@/util/auth-header'

export default {
  list: async requestData => {
    return await axios.post(
      Paths.BASE_URL + Paths.AUDIT_PLAN_PATH + '/list',
      requestData,
      {
        headers: authHeader()
      }
    )
  },
  search: async requestData => {
    return await axios.post(
      Paths.BASE_URL + Paths.AUDIT_PLAN_PATH + '/search',
      requestData,
      {
        headers: authHeader()
      }
    )
  },
  save: async audit_plan => {
    return await axios.post(
      Paths.BASE_URL + Paths.AUDIT_PLAN_PATH + '/saveData/' + audit_plan.encId,
      audit_plan,
      {
        headers: authHeader()
      }
    )
  },
  saveItem: async check_list_item => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.AUDIT_PLAN_PATH +
        '/saveItem/' +
        check_list_item.encId,
      check_list_item,
      {
        headers: authHeader()
      }
    )
  },
  updateResultItem: async check_list_item => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.AUDIT_PLAN_PATH +
        '/updateResultItem/' +
        check_list_item.encId,
      check_list_item,
      {
        headers: authHeader()
      }
    )
  },
  deleteItem: async check_list_item => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.AUDIT_PLAN_PATH +
        '/deleteItem/' +
        check_list_item.encId,
      check_list_item,
      {
        headers: authHeader()
      }
    )
  },
  getOne: async encId => {
    return await axios.get(
      Paths.BASE_URL + Paths.AUDIT_PLAN_PATH + '/' + encId,
      { headers: authHeader() }
    )
  },
  listCheckListItem: async encId => {
    return await axios.post(
      Paths.BASE_URL + Paths.AUDIT_PLAN_PATH + '/listCheckListItem/' + encId,
      {},
      { headers: authHeader() }
    )
  },

  getByDepartmentEdit: async (departmentIdEnc, type) => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.AUDIT_PLAN_PATH +
        '/getByDepartment' +
        '/' +
        departmentIdEnc +
        '/' +
        type,
      {},
      { headers: authHeader() }
    )
  },
  updateStatus: async (planId, status, remarksTxt) => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.AUDIT_PLAN_PATH +
        '/updateStatus/' +
        planId +
        '/' +
        status,
      { key: 'remarks', value: remarksTxt },
      { headers: authHeader() }
    )
  },
  listTransactionByAuditPlan: async planId => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.AUDIT_PLAN_PATH +
        '/listTransactionByAuditPlan/' +
        planId,
      {},
      { headers: authHeader() }
    )
  }
}
