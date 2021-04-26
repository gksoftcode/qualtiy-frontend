import AuthService from '@/service/AuthService'
import JWT from '@/util/JWT'
import router from '@/router'
const token = localStorage.getItem('token')
const initialState = token
  ? { status: { loggedIn: true }, employee: JWT.getUser(token) }
  : { status: { loggedIn: false }, employee: null }

export const auth = {
  namespaced: true,
  state: initialState,
  actions: {
    login({ commit }, data) {
      commit('loginSuccess', data)
    },
    loginFailure({ commit }, data) {
      commit('loginFailure')
    },
    logout({ commit }) {
      AuthService.logout()
      commit('logout')
    },
    register({ commit }, user) {
      return AuthService.register(user).then(
        response => {
          commit('registerSuccess')
          return Promise.resolve(response.data)
        },
        error => {
          commit('registerFailure')
          return Promise.reject(error)
        }
      )
    }
  },
  mutations: {
    loginSuccess(state, token) {
      state.status.loggedIn = true
      localStorage.setItem('token', token)
      state.employee = JWT.getUser(token)
    },
    loginFailure(state) {
      state.status.loggedIn = false
      state.employee = null
    },
    logout(state) {
      state.status.loggedIn = false
      state.employee = null
      router.push('/login')
    },
    registerSuccess(state) {
      state.status.loggedIn = false
    },
    registerFailure(state) {
      state.status.loggedIn = false
    }
  }
}
