import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'
import ar from 'vuetify/lib/locale/ar'

Vue.use(Vuetify)

export default new Vuetify({
  rtl: true,
  theme: {
    // themes: {
    //   light: {
    //     primary: "#ee44aa",
    //     secondary: "#424242",
    //     accent: "#82B1FF",
    //     error: "#FF5252",
    //     info: "#2196F3",
    //     success: "#4CAF50",
    //     warning: "#FFC107"
    //   }
    // }
    options: {
      customProperties: true
    }
  },
  lang: {
    locales: { ar },
    current: 'ar'
  }
})
