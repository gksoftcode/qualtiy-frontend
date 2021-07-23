import { Paths } from '@/Paths'
import axios from 'axios'
import authHeader from '@/util/auth-header'

export default {
  generateWorkGuideReport: async id => {
    return await axios.post(
      Paths.BASE_URL + Paths.REPORT_PATH + '/workguide/' + id,
      '',
      {},
      { headers: authHeader() }
    )
  }
}
