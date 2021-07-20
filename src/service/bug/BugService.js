import { Paths } from '@/Paths'
import axios from 'axios'
import authHeader from '@/util/auth-header'

export default {
  search: async requestData => {
    return await axios.post(
      Paths.BASE_URL + Paths.BUG_PATH + '/search',
      requestData,
      {
        headers: authHeader()
      }
    )
  },
  getOne: async id => {
    return await axios.get(Paths.BASE_URL + Paths.BUG_PATH + '/get/' + id, {
      headers: authHeader()
    })
  }
}
