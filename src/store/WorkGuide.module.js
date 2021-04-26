import router from '@/router'

export const wg = {
  namespaced: true,
  state: {
    loading: false
  },
  actions: {
    setLoading({ commit }, value) {
      commit('SET_LOADING', value)
    }
  },
  mutations: {
    SET_LOADING(state, value) {
      state.loading = value
    }
  }
}
