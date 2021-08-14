import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'
import ar from 'vuetify/lib/locale/ar'

Vue.use(Vuetify)

export default new Vuetify({
  rtl: true,
  theme: {
    themes: {
      light: {
        primary: '#497463',
        secondary: '#424242',
        accent: '#a1512c',
        error: '#ff5252',
        info: '#2196f3',
        success: '#4caf50',
        warning: '#FFC107'
      }
    },
    options: {
      customProperties: true
    }
  },
  lang: {
    locales: { ar },
    current: 'ar'
  }
})
