import axios from 'axios'
import { Paths } from '@/Paths'

class AuthService {
  async login(user) {
    return await axios.post(Paths.BASE_URL + Paths.AUTH_PATH + '/signin', {
      usernameOrEmail: user.username,
      password: user.password
    })
  }

  logout() {
    sessionStorage.removeItem('token')
  }

  async register(user) {
    return await axios.post(Paths.BASE_URL + '/signup', {
      username: user.username,
      email: user.email,
      password: user.password
    })
  }
}

export default new AuthService()
