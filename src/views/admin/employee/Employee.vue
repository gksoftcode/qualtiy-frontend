<template>
  <div>
    <v-card elevation="2" class="custom-heading">
      <v-card-title>
        <v-toolbar-items>
          <v-icon>mdi-account-group </v-icon>
          <v-toolbar-title>إدارة الموظفين</v-toolbar-title>
        </v-toolbar-items>
      </v-card-title>
      <v-card-text v-if="hasAccess">
        <v-row dense>
          <v-col cols="6">
            <v-text-field
              dense
              outlined
              v-model="dataTableRequest.data.textSearch"
              @keypress.enter="loadData"
              placeholder="بحث حسب الاسم أو الرقم"
            ></v-text-field>
          </v-col>
          <v-col cols="1">
            <v-btn icon color="primary">
              <v-icon @click="loadData">mdi-magnify mdi-36px</v-icon>
            </v-btn>
          </v-col>
          <v-col cols="5">
            <v-btn color="primary" class="float-left" icon @click="creatNew()">
              <v-icon>
                mdi-plus mdi-36px
              </v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <v-data-table
          :headers="mainHeader"
          :items="tableResponse.data"
          :loading="loading"
          item-key="id"
          :options.sync="dataTableOptions"
          :server-items-length="tableResponse.total"
        >
          <template v-slot:item.sn="{ item }">
            {{
              dataTableOptions.itemsPerPage * (dataTableOptions.page - 1) +
                tableResponse.data.indexOf(item) +
                1
            }}
          </template>
          <template v-slot:item.email="{ item }">
            <a :href="`mailto:${item.email}`">
              {{ item.email }}
            </a>
          </template>

          <template v-slot:item.action="{ item }">
            <v-flex>
              <v-btn color="primary" icon @click="edit(item)">
                <v-icon>
                  mdi-square-edit-outline
                </v-icon>
              </v-btn>
              <v-btn color="error" icon @click="resetPassword(item)">
                <v-icon>mdi-lock-reset</v-icon>
              </v-btn>
            </v-flex>
          </template>
        </v-data-table>
      </v-card-text>

      <v-card-text>
        <error401 v-if="!hasAccess"></error401>
      </v-card-text>
      <v-card-actions>
        <v-dialog dir="rtl" v-model="showDialog" width="60%">
          <v-card>
            <v-card-title>
              تحرير موظف
            </v-card-title>
            <v-card-text>
              <ValidationObserver ref="validator">
                <v-row dense>
                  <v-col cols="2">
                    <ValidationProvider
                      name="الرقم الوظيفي"
                      v-slot="{ errors }"
                      rules="required"
                    >
                      <v-text-field
                        type="number"
                        label="الرقم الوظيفي"
                        dense
                        :error-messages="errors"
                        outlined
                        v-model="selectedEmployee.empNumber"
                      ></v-text-field
                    ></ValidationProvider>
                  </v-col>
                  <v-col cols="6">
                    <ValidationProvider
                      name="اسم الموظف"
                      v-slot="{ errors }"
                      rules="required"
                    >
                      <v-text-field
                        label="اسم الموظف"
                        dense
                        :error-messages="errors"
                        outlined
                        v-model="selectedEmployee.fullName"
                      ></v-text-field
                    ></ValidationProvider>
                  </v-col>
                  <v-col cols="4">
                    <ValidationProvider
                      name="الاسم المختصر"
                      v-slot="{ errors }"
                      rules="required"
                    >
                      <v-text-field
                        label="الاسم المختصر"
                        dense
                        :error-messages="errors"
                        outlined
                        v-model="selectedEmployee.shortName"
                      ></v-text-field
                    ></ValidationProvider>
                  </v-col>
                  <v-col cols="6">
                    <ValidationProvider
                      name="الوظيفة"
                      v-slot="{ errors }"
                      rules="required"
                    >
                      <v-select
                        label="الوظيفة"
                        dense
                        clearable
                        :items="jobs"
                        item-text="name"
                        item-value="id"
                        :error-messages="errors"
                        outlined
                        v-model="selectedEmployee.jobId"
                      ></v-select>
                    </ValidationProvider>
                  </v-col>
                  <v-col cols="6">
                    <ValidationProvider
                      name="الادارة / القسم / الشعبة"
                      v-slot="{ errors }"
                      rules="required"
                    >
                      <v-menu
                        v-model="depMenu"
                        :close-on-content-click="false"
                        nudge-top="100px"
                        nudge-width="50"
                        transition="scale-transition"
                        offset-y
                        min-width="290px"
                        max-height="450px"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            label="الادارة / القسم / الشعبة"
                            dense
                            clearable
                            :error-messages="errors"
                            outlined
                            v-bind="attrs"
                            prepend-inner-icon="mdi-cube-outline"
                            v-on="on"
                            :value="selectedEmployee.department.name"
                          >
                          </v-text-field>
                        </template>
                        <v-card>
                          <v-card-title>الهيكل التنظيمي</v-card-title>
                          <v-card-text>
                            <v-row dense>
                              <v-col cols="12" class="treePanel">
                                <v-treeview
                                  open-all
                                  :active.sync="selectedDepartment"
                                  dense
                                  return-object
                                  :items="root"
                                  item-children="departmentList"
                                  item-key="id"
                                  activatable
                                  hoverable
                                >
                                  <template v-slot:prepend="{ item }">
                                    <v-icon
                                      v-if="item.departmentList.length > 0"
                                    >
                                      mdi-view-grid
                                    </v-icon>

                                    <v-icon
                                      v-if="item.departmentList.length == 0"
                                    >
                                      mdi-cube-outline
                                    </v-icon>
                                  </template>
                                </v-treeview>
                              </v-col>
                            </v-row>
                          </v-card-text>
                          <v-card-actions>
                            <v-btn
                              text
                              color="primary"
                              @click="updateSelectedDepartment"
                            >
                              إختيار
                            </v-btn>
                            <v-btn
                              text
                              dark
                              color="red"
                              @click="depMenu = false"
                            >
                              إلغاء
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-menu>
                    </ValidationProvider>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="6">
                    <ValidationProvider
                      name="البريد الإلكتروني"
                      v-slot="{ errors }"
                      rules="required"
                    >
                      <v-text-field
                        label="البريد الإلكتروني"
                        dense
                        :error-messages="errors"
                        outlined
                        v-model="selectedEmployee.email"
                      ></v-text-field
                    ></ValidationProvider>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      label="رقم الهاتف"
                      dense
                      outlined
                      v-model="selectedEmployee.mobileNumber"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2">
                    <v-switch v-model="selectedEmployee.gender">
                      <template v-slot:label>
                        {{ selectedEmployee.gender ? 'ذكر' : 'أنثى' }}
                      </template></v-switch
                    >
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="4" sm="6" md="4">
                    <v-menu
                      v-model="dobMenu"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      transition="scale-transition"
                      offset-y
                      min-width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          dense
                          outlined
                          v-model="selectedEmployee.dob"
                          label="تاريخ الميلاد"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="selectedEmployee.dob"
                        @input="dobMenu = false"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="3">
                    <ValidationProvider
                      name="اسم المستخدم"
                      v-slot="{ errors }"
                      rules="required"
                    >
                      <v-text-field
                        label="اسم المستخدم"
                        dense
                        :error-messages="errors"
                        outlined
                        v-model="selectedEmployee.user.username"
                      >
                      </v-text-field>
                    </ValidationProvider>
                  </v-col>
                  <v-col cols="2">
                    <v-switch v-model="selectedEmployee.user.active">
                      <template v-slot:label>
                        {{ selectedEmployee.user.active ? 'ممكن' : 'غير ممكن' }}
                      </template>
                    </v-switch>
                  </v-col>
                </v-row>
              </ValidationObserver>
            </v-card-text>
            <v-card-actions>
              <v-btn
                :loading="saving"
                :disabled="saving"
                color="primary"
                @click="save()"
              >
                حفظ
                <v-icon>
                  mdi-content-save
                </v-icon>
              </v-btn>
              <v-btn color="red" dark @click="showDialog = false">
                إلغاء
                <v-icon>
                  mdi-close
                </v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import _ from 'lodash'
import EmployeeService from '@/service/employee/EmployeeService'
import DepartmentService from '@/service/department/DepartmentService'
import JobService from '@/service/jobs/JobService'
import DataTableRequest from '@/model/request/DataTableRequest'
import DataTableResponse from '@/model/response/DataTableResponse'
import { mapState } from 'vuex'
import Error401 from '@/components/Error401'
export default {
  components: { Error401 },
  created() {
    this.dataTableRequest.data.textSearch = ''
    this.selectedEmployee = Object.assign({}, this.emptyEmployee)
    this.selectedEmployee.user = Object.assign({}, this.emptyUser)
  },
  computed: {
    hasAccess: function() {
      let ha = false
      try {
        this.employee.roles.forEach(item => {
          if (item === 'ROLE_HR' || item === 'ROLE_ADMIN') {
            ha = true
          }
        })
      } catch (e) {
        return false
      }
      return ha
    },
    ...mapState('auth', ['employee'])
  },
  mounted() {
    this.loadDepartmentTree()
    JobService.listAll()
      .then(response => {
        this.jobs = response.data
      })
      .catch(error => {})
  },
  methods: {
    loadDepartmentTree() {
      DepartmentService.loadTree()
        .then(response => {
          this.root = response.data
        })
        .catch(error => {})
    },
    loadData() {
      this.loading = true
      this.dataTableRequest.currentPage = this.dataTableOptions.page - 1
      this.dataTableRequest.pageSize = this.dataTableOptions.itemsPerPage
      if (this.dataTableOptions.sortBy.length > 0) {
        this.dataTableRequest.sortBy = this.dataTableOptions.sortBy[0]
      } else {
        this.dataTableRequest.sortBy = ''
      }
      if (this.dataTableOptions.sortDesc.length > 0) {
        this.dataTableRequest.sortDesc = this.dataTableOptions.sortDesc[0]
      } else {
        this.dataTableRequest.sortDesc = false
      }
      EmployeeService.list(this.dataTableRequest)
        .then(response => {
          this.tableResponse = response.data
          this.loading = false
          this.showDialog = false
        })
        .catch(error => {
          this.loading = false
        })
    },

    resetPassword(emp) {
      this.$confirm('هل فعلا تود تصفير كلمة المرور ؟', {
        buttonTrueText: 'موافق',
        buttonFalseText: 'لا',
        color: 'orange darken-2',
        persistent: true
      }).then(res => {
        if (res === true) {
          EmployeeService.resetPassword(emp)
            .then(response => {})
            .catch(error => {})
        }
      })
    },

    save() {
      this.$refs.validator.validate().then(result => {
        if (result) {
          this.saving = true
          let enc_id = this.selectedEmployee.encId
          EmployeeService.save(this.selectedEmployee)
            .then(response => {
              this.selectedEmployee = response.data.employee
              if (enc_id === -1) {
                this.tableResponse.data.splice(0, 0, this.selectedEmployee)
              } else {
                let idx = _.findIndex(this.tableResponse.data, function(o) {
                  return enc_id === o.encId
                })
                this.tableResponse.data.splice(idx, 1, this.selectedEmployee)
              }
              this.showDialog = false
              this.saving = false
              this.$toast.success('تم الحفظ بنجاح')
            })
            .catch(error => {
              this.saving = false
              console.log(error.response.data)
              if (error.response.data.errorCode) {
                if (error.response.data.errorCode == 1) {
                  this.$toast.error('رقم الموظف مستخدم لموظف أخر')
                } else if (error.response.data.errorCode == 2) {
                  this.$toast.error(
                    'اسم المستخدم , غير متاح تم الاستخدام لموظف أخر'
                  )
                }
              } else if (error.response.data.id) {
                this.$toast.error(
                  'هناك خطأ في عملية الحفظ' +
                    ' رقم الخطأ ' +
                    error.response.data.id
                )
              } else {
                this.$toast.error('هناك خطأ في عملية الحفظ')
              }
            })
        }
      })
    },

    creatNew() {
      this.showDialog = true
      this.selectedEmployee = _.cloneDeep(this.emptyEmployee)
      this.selectedEmployee.user = _.cloneDeep(this.emptyUser)
    },
    edit(item) {
      this.selectedDepartment = []
      this.showDialog = true
      this.selectedEmployee = _.cloneDeep(item)
      this.selectedDepartment.push(this.selectedEmployee.department)
    },
    updateSelectedDepartment() {
      this.selectedEmployee.department = Object.assign(
        {},
        this.selectedDepartment[0]
      )
      this.selectedEmployee.departmentId = this.selectedDepartment[0].id
      this.depMenu = false
    }
  },
  watch: {
    dataTableOptions: {
      handler(newVal, oldVal) {
        this.loadData()
      },
      deep: true
    }
  },
  data() {
    return {
      currentSelectedDepartment: {},
      selectedDepartment: [],
      depMenu: false,
      dobMenu: false,
      jobs: [],
      jobTypes: [
        { id: 1, name: 'إشرافي' },
        { id: 2, name: 'تنفيذي' },
        { id: 3, name: 'عامل' }
      ],
      showDialog: false,
      selectedEmployee: {},
      emptyUser: { username: '', active: true },
      saving: false,
      root: [],
      emptyEmployee: {
        id: -1,
        fullName: '',
        user: { username: '', active: true },
        shortName: '',
        empNumber: 0,
        department: { id: 0, name: '' },
        departmentId: -1,
        gender: true,
        email: '',
        dob: new Date().toISOString().substr(0, 10),
        mobileNumber: '',
        encId: -1,
        jobId: -1
      },
      loading: false,
      tableResponse: new DataTableResponse(0, 0, 10),
      dataTableRequest: new DataTableRequest(0, 10),
      dataTableOptions: { page: 1, itemsPerPage: 10 },
      mainHeader: [
        {
          text: 'مسلسل',
          value: 'sn',
          align: 'center',
          sortable: false,
          width: '5%'
        },
        {
          text: 'رقم الموظف',
          value: 'empNumber',
          align: 'center',
          sortable: false,
          filterable: true,
          width: '5%'
        },
        {
          text: 'اسم الموظف',
          value: 'fullName',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '30%'
        },
        {
          text: 'الادارة',
          value: 'department.name',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '20%'
        },
        {
          text: 'الوظيفة',
          value: 'job.name',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '15%'
        },
        {
          text: 'البريد',
          value: 'email',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '15%'
        },
        {
          text: '#',
          value: 'action',
          align: 'center',
          sortable: false,
          width: '10%'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.treePanel {
  max-height: 350px;
  overflow: auto;
}
</style>
