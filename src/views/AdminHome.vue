<template>
  <div>
    <v-navigation-drawer v-model="drawer" clipped app right>
      <v-list dense>
        <template v-for="item in items">
          <v-row v-if="item.heading" :key="item.heading" align="center">
            <v-col cols="12">
              <v-card-title v-if="item.heading">
                {{ item.heading }}
              </v-card-title>
            </v-col>
            <!--v-col cols="6" class="text-center">
              <a href="!#" class="body-2 black--text">EDIT</a>
            </v-col-->
          </v-row>
          <v-list-group
            v-else-if="item.children"
            :key="item.text"
            v-model="item.model"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon=""
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.text }}
                </v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item
              v-for="(child, i) in item.children"
              :key="i"
              link
              :to="child.to"
            >
              <v-list-item-action v-if="child.icon">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  {{ child.text }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <v-list-item v-else :key="item.text" :to="item.to" link>
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ item.text }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar dense dir="rtl" clipped-right app color="blue darken-3" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title style="width: 300px" class="ml-0 pl-4">
        <span class="hidden-sm-and-down">
          إعدادات النظام
        </span>
      </v-toolbar-title>
      <v-text-field
        dense
        flat
        solo-inverted
        hide-details
        prepend-inner-icon="mdi-magnify"
        label="Search"
        class="hidden-sm-and-down"
      />
      <v-spacer />

      <v-btn icon :to="{ name: 'Landing' }">
        <v-icon>mdi-apps</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>mdi-bell</v-icon>
      </v-btn>
      <span class="me-2">
        {{ employee.name }}
      </span>

      <v-menu bottom offset-y transition="scale-transition">
        <template v-slot:activator="{ on }">
          <v-btn icon large v-on="on">
            <v-avatar size="32px" item>
              <v-img src="../assets/user.svg" alt="User"
            /></v-avatar>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item dense @click="showPasswordDialog()">
            <v-list-item-title>
              تعديل كلمة المرور
            </v-list-item-title>
            <v-list-item-icon>
              <v-icon>
                mdi-form-textbox-password
              </v-icon>
            </v-list-item-icon>
          </v-list-item>
          <v-divider />
          <v-list-item dense @click="logOut()">
            <v-list-item-title>تسجيل خروج</v-list-item-title>
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
          </v-list-item>
        </v-list>
      </v-menu>

      <!--      <loginDialog v-if="!currentUser"></loginDialog>-->
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <v-row
          class="d-flex flex-column ms-1 mt-0"
          align="start"
          align-content="start"
          justify="center"
        >
          <v-col>
            <router-view>
              <v-row class="text-center">
                <v-col cols="12">
                  <v-img
                    :src="require('../assets/logo2.png')"
                    class="my-3"
                    contain
                    height="400px"
                  />
                </v-col>

                <v-col class="mb-4">
                  <h1 class="display-2 font-weight-bold mb-3">
                    نظام الاجراءات الادارية لبلدية الحمرية
                  </h1>
                </v-col>
              </v-row>
            </router-view>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <v-btn
      bottom
      color="pink"
      v-if="false"
      dark
      fab
      fixed
      left
      @click="dialog = !dialog"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <v-dialog v-model="passDlg" width="400px">
      <v-card>
        <v-card-title>
          تعديل كلمة المرور
        </v-card-title>
        <v-container>
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                autocomplete="off"
                dense
                :type="currentPasswordTape"
                outlined
                v-model="currentPass"
                label="كلمة المرور الحالية"
                :prepend-inner-icon="
                  currentPasswordTape === 'password' ? 'mdi-eye' : 'mdi-eye-off'
                "
                @click:prepend-inner="
                  currentPasswordTape =
                    currentPasswordTape === 'password' ? 'text' : 'password'
                "
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                autocomplete="off"
                dense
                :type="newPasswordType"
                outlined
                v-model="newPass"
                label="كلمة المرور الجديدة"
                :prepend-inner-icon="
                  newPasswordType === 'password' ? 'mdi-eye' : 'mdi-eye-off'
                "
                @click:prepend-inner="
                  newPasswordType =
                    newPasswordType === 'password' ? 'text' : 'password'
                "
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
        <v-card-actions>
          <v-btn text color="primary" @click="changePassword()">تعديل</v-btn>
          <v-btn text color="error" @click="passDlg = false">إغلاق</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import EmployeeService from '@/service/employee/EmployeeService'
export default {
  name: 'AdminHome',
  computed: {
    ...mapState('auth', ['employee'])
  },
  created() {
    document.title = this.$route.meta.title
  },
  data: () => ({
    currentPass: '',
    newPass: '',
    currentPasswordTape: 'password',
    newPasswordType: 'password',
    passDlg: false,
    dialog: false,
    drawer: null,
    items: [
      { heading: 'إدارة النظام', icon: 'mdi-contacts' },
      {
        icon: 'mdi-briefcase-account',
        text: 'الوظائف',
        to: '/admin/job'
      },
      {
        icon: 'mdi-account-group',
        text: 'الموظفون',
        to: '/admin/employee'
      },
      {
        icon: 'mdi-file-tree-outline mdi-flip-h',
        text: 'الهيكل التنظيمي',
        to: '/admin/department'
      },
      {
        icon: 'mdi-notebook-multiple mdi-flip-h',
        text: 'إدارة الإجراءات',
        to: '/admin/workGuideAdmin'
      },
      {
        icon: 'mdi-file-document-multiple mdi-flip-h',
        text: 'إدارة السجلات',
        to: '/admin/filesManager'
      },
      {
        icon: 'mdi-book-check',
        text: 'تقارير التدقيق',
        to: { name: 'AuditReportSearch' }
      },
      {
        icon: 'mdi-calendar-multiple-check',
        text: 'خطة التدقيق',
        to: '/admin/auditPlan'
      },
      {
        icon: 'mdi-key-outline mdi-flip-h',
        text: 'إدارة الأحقيات',
        to: '/admin/permission'
      },

      {
        icon: 'mdi-chevron-up',
        'icon-alt': 'mdi-chevron-down',
        text: 'المزيد',
        model: false,
        children: [{ icon: 'mdi-bug', text: 'الاخطاء', to: '/admin/Bug' }]
      }
    ]
  }),
  methods: {
    changePassword() {
      let data = [
        { key: 'oldPassword', value: this.currentPass },
        { key: 'newPassword', value: this.newPass },
        { key: 'encId', value: this.employee.encId }
      ]
      EmployeeService.changePassword(data)
    },
    showPasswordDialog() {
      this.confirmPass = ''
      this.newPass = ''
      this.currentPass = ''
      this.passDlg = true
    },
    logOut() {
      this.$store.dispatch('auth/logout')
    }
  }
}
</script>
<style lang="scss">
.wise-c-Title {
  font-weight: bold;
  font-size: 1.1em;
  color: var(--v-primary-base);
}

.primary-text {
  color: var(--v-primary-base);
}
.accent-text {
  color: var(--v-accent-base);
}

.error-text {
  color: darkred;
  font-style: italic;
  font-weight: bold;
}
.clickable {
  cursor: pointer;
}
</style>
