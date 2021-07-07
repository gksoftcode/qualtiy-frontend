import { Paths } from '@/Paths'
import axios from 'axios'
import authHeader from '@/util/auth-header'
import { authHeaderMultipart } from '@/util/auth-header'
import FileList from '@/components/FileList'

export default {
  save: async (file, fileData) => {
    let formData = new FormData()
    formData.append('fileData', fileData[0])
    formData.append('name', file.name)
    formData.append('version', file.version)
    formData.append('orderNo', file.orderNo)
    formData.append('departmentId', file.departmentId)
    formData.append('issueDate', file.issueDate)

    return await axios.post(
      Paths.BASE_URL + Paths.ATTACHMENT_PATH + '/save',
      formData,
      {
        headers: authHeaderMultipart()
      }
    )
  },
  save2: async (file, fileData) => {
    let formData = new FormData()
    formData.append('fileData', fileData[0])
    formData.append('name', file.name)
    formData.append('version', file.version)
    formData.append('orderNo', file.orderNo)
    formData.append('departmentId', file.departmentId)
    formData.append('issueDate', file.issueDate)

    return await axios.post(
      Paths.BASE_URL + Paths.ATTACHMENT_PATH + '/save2',
      formData,
      {
        headers: authHeaderMultipart()
      }
    )
  },
  edit: async (file, tempFileData, pdfFileData, updateState) => {
    let formData = new FormData()
    formData.append('name', file.name)
    formData.append('version', file.version)
    formData.append('orderNo', file.orderNo)
    formData.append('issueDate', file.issueDate)
    formData.append('updateState', updateState)
    if (tempFileData != null && tempFileData.length > 0)
      formData.append('tempFileData', tempFileData[0])
    if (pdfFileData != null && pdfFileData.length > 0)
      formData.append('pdfFileData', pdfFileData[0])
    return await axios.post(
      Paths.BASE_URL + Paths.ATTACHMENT_PATH + '/edit/' + file.encId,
      formData,
      {
        headers: authHeaderMultipart()
      }
    )
  },
  updateStatus: async (encId, nextStatus) => {
    let formData = new FormData()
    formData.append('nextStatus', nextStatus)
    return await axios.post(
      Paths.BASE_URL + Paths.ATTACHMENT_PATH + '/updateStatus/' + encId,
      formData,
      {
        headers: authHeader()
      }
    )
  },
  listTransactionByAttachment: async encId => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.ATTACHMENT_PATH +
        '/listTransactionByAttachment/' +
        encId,
      {},
      {
        headers: authHeader()
      }
    )
  },
  loadList: async departmentId => {
    return await axios.post(
      Paths.BASE_URL + Paths.ATTACHMENT_PATH + '/list/' + departmentId,
      {},
      {
        headers: authHeader()
      }
    )
  },
  listApproved: async departmentId => {
    return await axios.post(
      Paths.BASE_URL + Paths.ATTACHMENT_PATH + '/listApproved/' + departmentId,
      {},
      {
        headers: authHeader()
      }
    )
  },
  listApprovedByDepartment: async departmentId => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.ATTACHMENT_PATH +
        '/listApprovedByDepartment/' +
        departmentId,
      {},
      {
        headers: authHeader()
      }
    )
  },
  replaceAttachment: async (sEncId, dEncId) => {
    return await axios.post(
      Paths.BASE_URL +
        Paths.ATTACHMENT_PATH +
        '/replaceAttachment/' +
        sEncId +
        '/' +
        dEncId,
      {},
      {
        headers: authHeader()
      }
    )
  },
  search: async requestData => {
    return await axios.post(
      Paths.BASE_URL + Paths.ATTACHMENT_PATH + '/search',
      requestData,
      {
        headers: authHeader()
      }
    )
  },
  search2: async requestData => {
    return await axios.post(
      Paths.BASE_URL + Paths.ATTACHMENT_PATH + '/search2',
      requestData,
      {
        headers: authHeader()
      }
    )
  },
  update: async file => {
    return await axios.post(
      Paths.BASE_URL + Paths.ATTACHMENT_PATH + '/update/' + file.encId,
      file,
      {
        headers: authHeader()
      }
    )
  },
  deleteFile: async file => {
    return await axios.post(
      Paths.BASE_URL + Paths.ATTACHMENT_PATH + '/deleteFile/' + file.encId,
      file,
      {
        headers: authHeader()
      }
    )
  },
  getUsedCount: async file => {
    return await axios.post(
      Paths.BASE_URL + Paths.ATTACHMENT_PATH + '/getUsedCount/' + file.encId,
      file,
      {
        headers: authHeader()
      }
    )
  }
}
