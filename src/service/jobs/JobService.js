import { Paths } from '@/Paths'
import axios from 'axios'
import authHeader from '@/util/auth-header'

export default {
  autocomplelte: query => {
    let res = axios.post(
      Paths.BASE_URL + Paths.DRUG_PATH + '/autocomplelte/' + query,
      {},
      {
        headers: authHeader()
      }
    )
    return res
  },
  list: async requestData => {
    return await axios.post(
      Paths.BASE_URL + Paths.JOB_PATH + '/list',
      requestData,
      {
        headers: authHeader()
      }
    )
  },
  listAll: async () => {
    return await axios.post(
      Paths.BASE_URL + Paths.JOB_PATH + '/listAll',
      {},
      {
        headers: authHeader()
      }
    )
  },
  save: async job => {
    return await axios.post(
      Paths.BASE_URL + Paths.JOB_PATH + '/save/' + job.encId,
      job,
      {
        headers: authHeader()
      }
    )
  }
}
