import Vue from 'vue'

import { extend, ValidationObserver, ValidationProvider } from 'vee-validate'
import { email, max, min, numeric, required } from 'vee-validate/dist/rules'

extend('email', email)
extend('max', max)
extend('min', min)
extend('numeric', numeric)
extend('required', {
  ...required,
  message: 'هذا الحقل مطلوب'
})

extend('max', {
  ...max,
  message: 'تجاوز القيمة المسموحة'
})

Vue.component('ValidationProvider', ValidationProvider)
Vue.component('ValidationObserver', ValidationObserver)
