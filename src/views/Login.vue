<template>
  <div class="home">
    <v-main>
      <v-container>
        <div
          class="bg-image"
          v-bind:style="{
            backgroundImage: 'url(' + require('../assets/logo2.png') + ')'
          }"
        ></div>
        <v-layout wrap dark>
          <v-flex sm12 md8 offset-md2>
            <v-card
              elevation="1"
              class="mt-16 pt-3 pr-3 pb-3 pl-3"
              light
              tag="section"
              :loading="working"
            >
              <v-card-title>
                <v-layout align-center justify-space-between>
                  <h3 class="headline">
                    <v-card-title>
                      <!-- <v-icon class="ml-4">mdi-login-variant mdi-flip-h</v-icon> -->
                      بوابة بلدية الحمرية
                    </v-card-title>
                    <v-card-subtitle>
                      لوحة الدخول
                    </v-card-subtitle>
                  </h3>
                  <v-flex>
                    <v-img
                      alt="بوابة بلدية الحمرية"
                      class="ml-2 float-left"
                      contain
                      height="120px"
                      width="120px"
                      position="center left"
                      :src="require('../assets/logo2.png')"
                    ></v-img>
                  </v-flex>
                </v-layout>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <p>
                  قم بتسجيل الدخول باستخدام اسم المستخدم وكلمة المرور الخاصين
                  بك:
                </p>
                <v-form>
                  <v-text-field
                    outlined
                    autofocus
                    prepend-inner-icon="mdi-account-box"
                    v-model="user.username"
                    label="اسم المستخدم"
                    type="text"
                  />
                  <v-text-field
                    outlined
                    hide-details
                    type="password"
                    prepend-inner-icon="mdi-key"
                    v-model="user.password"
                    label="كلمة المرور"
                  />
                </v-form>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions class="pa-3">
                <v-btn
                  color="primary"
                  :loading="working"
                  :disabled="working"
                  @click="login()"
                >
                  <v-icon right>mdi-login-variant mdi-flip-h</v-icon>
                  تسجيل دخول
                </v-btn>
                <v-btn color="red" plain :disabled="working">
                  إلغاء
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
        <!-- 
        <v-layout align-center justify-center>
          <v-card width="50%" elevation="24" :loading="working">
            <v-card-title>
              <v-icon class="ml-4">mdi-login-variant mdi-flip-h</v-icon>
              بوابة بلدية الحمرية
            </v-card-title>
            <v-card-subtitle>
              لوحة الدخول
            </v-card-subtitle>
            <v-card-text>
              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                    autofocus
                    prepend-inner-icon="mdi-account-box"
                    v-model="user.username"
                    dense
                    outlined
                    label="اسم المستخدم"
                  />
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                    type="password"
                    prepend-inner-icon="mdi-key"
                    v-model="user.password"
                    dense
                    outlined
                    label="كلمة المرور"
                  />
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="primary"
                :loading="working"
                :disabled="working"
                @click="login()"
              >
                تسجيل دخول
              </v-btn>
              <v-btn color="red" :disabled="working">
                إلغاء
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-layout> -->
      </v-container>
    </v-main>
  </div>
</template>

<script>
import User from '../model/User'
import AuthService from '@/service/AuthService'
export default {
  name: 'Login',
  watch: {
    '$store.state.auth.status.loggedIn': function() {
      console.log(this.$store.state.auth.status.loggedIn)
    }
  },
  mounted() {
    document.title = this.$route.meta.title
  },
  methods: {
    login() {
      this.working = true
      AuthService.login(this.user)
        .then(response => {
          this.$store.dispatch('auth/login', response.data)
          this.$router.push('/admin')
          this.working = false
        })
        .catch(error => {
          this.$store.dispatch('auth/loginFailure')
          this.$toast.error('خطأ في اسم المستخدم أو كلمة المرور')
          this.working = false
        })
    }
  },
  data() {
    return {
      working: false,
      user: new User()
    }
  }
}
</script>

<style lang="scss" scoped>
.bg-image {
  position: absolute;
  left: 0;
  top: 0;
  width: inherit;
  height: 100vh;
  z-index: 0;
  background-repeat: repeat;
  opacity: 0.03;
  background-size: 300px;
}
</style>
