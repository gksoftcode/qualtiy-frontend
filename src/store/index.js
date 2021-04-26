import Vue from 'vue'
import Vuex from 'vuex'
import { auth } from './user.module'
import { wg } from './WorkGuide.module'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: { auth, wg }
})
