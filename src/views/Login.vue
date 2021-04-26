<template>
  <div class="home">
    <v-main>
      <v-container>
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
        </v-layout>
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

<style lang="scss" scoped></style>
