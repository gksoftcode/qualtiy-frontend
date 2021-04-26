import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import VuetifyConfirm from 'vuetify-confirm'
import Toast, { POSITION } from 'vue-toastification'
import moment from 'moment'
import _ from 'lodash'
import './plugins/vee-validate'
import 'vue-toastification/dist/index.css'
import Constants from '@/plugins/Constants'

Vue.filter('formatDate', function(value) {
  if (value) {
    return moment(String(value)).format('MM/DD/YYYY hh:mm')
  }
})
Vue.filter('floor', function(value) {
  if (value) {
    return _.floor(value)
  }
})
Vue.filter('formatDate2', function(value) {
  if (value) {
    return moment(String(value)).format('DD/MM/YYYY')
  }
})
Vue.filter('twoDigit', function(value) {
  if (value) {
    return value.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    })
  }
})
Vue.filter('documentNo', function(value) {
  if (value) {
    return 'AHM-OP-' + value
  }
})

const options = {
  position: POSITION.TOP_CENTER,
  transition: 'Vue-Toastification__fade',
  maxToasts: 20,
  newestOnTop: true,
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: true,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: true
}
Vue.use(VuetifyConfirm, {
  vuetify,
  buttonTrueText: 'موافق',
  buttonFalseText: 'لا',
  color: 'primary',
  icon: 'mdi-comment-question-outline',
  title: 'تأكيد',
  width: 350,
  property: '$confirm'
})
Vue.use(Toast, options)
Vue.config.productionTip = false
Vue.use(Constants)

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
