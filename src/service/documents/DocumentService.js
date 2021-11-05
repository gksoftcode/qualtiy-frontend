import { Paths } from '@/Paths'
import axios from 'axios'
import authHeader from '@/util/auth-header'

export default {
  list: async requestData => {
    return await axios.post(
      Paths.BASE_URL + Paths.DOCUMENT_PATH + '/list',
      requestData,
      {
        headers: authHeader()
      }
    )
  },
  listActive: async () => {
    return await axios.post(
      Paths.BASE_URL + Paths.DOCUMENT_PATH + '/listActive',
      {},
      {
        headers: authHeader()
      }
    )
  },
  listAll: async () => {
    return await axios.post(
      Paths.BASE_URL + Paths.DOCUMENT_PATH + '/listAll',
      {},
      {
        headers: authHeader()
      }
    )
  },
  save: async job => {
    return await axios.post(
      Paths.BASE_URL + Paths.DOCUMENT_PATH + '/save/' + job.encId,
      job,
      {
        headers: authHeader()
      }
    )
  }
}
