import { Paths } from '@/Paths'
import axios from 'axios'
import authHeader from '@/util/auth-header'

export default {
  list: async requestData => {
    return await axios.post(
      Paths.BASE_URL + Paths.AUDIT_REPORT_PATH + '/list',
      requestData,
      {
        headers: authHeader()
      }
    )
  },
  search: async requestData => {
    return await axios.post(
      Paths.BASE_URL + Paths.AUDIT_REPORT_PATH + '/search',
      requestData,
      {
        headers: authHeader()
      }
    )
  },
  save: async audit_report => {
    return await axios.post(
      Paths.BASE_URL + Paths.AUDIT_REPORT_PATH + '/save/' + audit_report.encId,
      audit_report,
      {
        headers: authHeader()
      }
    )
  },
  listEmployees: async audit_report => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.AUDIT_REPORT_PATH +
        '/listEmployees/' +
        audit_report.encId,
      {},
      {
        headers: authHeader()
      }
    )
  },
  saveItem: async check_list_item => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.AUDIT_REPORT_PATH +
        '/saveItem/' +
        check_list_item.encId,
      check_list_item,
      {
        headers: authHeader()
      }
    )
  },
  saveCorrectiveAction: async correctiveAction => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.AUDIT_REPORT_PATH +
        '/saveCorrectiveAction/' +
        correctiveAction.encId,
      correctiveAction,
      {
        headers: authHeader()
      }
    )
  },
  updateCorrectionApproved: async correctiveAction => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.AUDIT_REPORT_PATH +
        '/updateCorrectionApproved/' +
        correctiveAction.encId +
        '/1',
      {},
      {
        headers: authHeader()
      }
    )
  },
  updateCorrectionFollow: async correctiveAction => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.AUDIT_REPORT_PATH +
        '/updateCorrectionFollow/' +
        correctiveAction.encId +
        '/' +
        correctiveAction.status,
      { key: 'remarks', value: correctiveAction.followDescription },
      {
        headers: authHeader()
      }
    )
  },
  updateResultItem: async check_list_item => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.AUDIT_REPORT_PATH +
        '/updateResultItem/' +
        check_list_item.encId,
      check_list_item,
      {
        headers: authHeader()
      }
    )
  },
  getCorrectiveAction: async check_list_item => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.AUDIT_REPORT_PATH +
        '/getCorrectiveAction/' +
        check_list_item.id,
      {},
      {
        headers: authHeader()
      }
    )
  },
  delete: async auditReport => {
    return await axios.delete(
      Paths.BASE_URL + Paths.AUDIT_REPORT_PATH + '/' + auditReport.id,
      {
        headers: authHeader()
      }
    )
  },
  deleteItem: async check_list_item => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.AUDIT_REPORT_PATH +
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
      Paths.BASE_URL + Paths.AUDIT_REPORT_PATH + '/' + encId,
      { headers: authHeader() }
    )
  },
  listCheckListItem: async encId => {
    return await axios.post(
      Paths.BASE_URL + Paths.AUDIT_REPORT_PATH + '/listCheckListItem/' + encId,
      {},
      { headers: authHeader() }
    )
  },

  getByDepartmentEdit: async (departmentIdEnc, type) => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.AUDIT_REPORT_PATH +
        '/getByDepartment' +
        '/' +
        departmentIdEnc +
        '/' +
        type,
      {},
      { headers: authHeader() }
    )
  },
  updateStatus: async (reportId, status, remarksTxt) => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.AUDIT_REPORT_PATH +
        '/updateStatus/' +
        reportId +
        '/' +
        status,
      { key: 'remarks', value: remarksTxt },
      { headers: authHeader() }
    )
  },
  listTransactionByAuditPlan: async planId => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.AUDIT_REPORT_PATH +
        '/listTransactionByAuditPlan/' +
        planId,
      {},
      { headers: authHeader() }
    )
  }
}
