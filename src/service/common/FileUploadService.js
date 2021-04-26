import { Paths } from '@/Paths'
import axios from 'axios'
import { authHeaderMultipart } from '@/util/auth-header'

export default {
  uploadFile: async (file, name, seq) => {
    let formData = new FormData()
    formData.append('file', file[0])
    formData.append('name', name)
    formData.append('seq', seq)
    return await axios.post(
      Paths.BASE_URL + Paths.FILE_UPLOAD_PATH + '/uploadFile',
      formData,
      {
        headers: authHeaderMultipart()
      }
    )
  }
}
