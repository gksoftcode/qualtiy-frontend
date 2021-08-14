<template>
  <div>
    <v-card elevation="2" class="custom-heading">
      <v-card-title>
        <v-toolbar-items>
          <v-icon>
            mdi-calendar-multiple-check mdi-24px
          </v-icon>
          <v-toolbar-title>إدارة خطة التدقيق</v-toolbar-title>
        </v-toolbar-items>
      </v-card-title>
      <v-card-subtitle class="mt-0" v-if="hasAccess">
        <v-row dense>
          <v-col cols="4">
            <ValidationProvider
              name="الادارة / القسم / الشعبة"
              v-slot="{ errors }"
              rules="required"
              v-if="fullAccess"
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
                    label="الوحدة الإدارية"
                    dense
                    clearable
                    :error-messages="errors"
                    outlined
                    v-bind="attrs"
                    prepend-inner-icon="mdi-cube-outline"
                    v-on="on"
                    :value="department.name"
                    @click:clear="clearDepartment"
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
                            <v-icon v-if="item.departmentList.length > 0">
                              mdi-view-grid
                            </v-icon>

                            <v-icon v-if="item.departmentList.length == 0">
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
                    <v-btn text color="red" @click="depMenu = false">
                      إلغاء
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-menu>
            </ValidationProvider>
            <v-text-field
              dense
              v-else
              readonly
              label="الادارة / القسم / الشعبة"
              :value="employee.departmentName"
              outlined
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-select
              outlined
              :items="years"
              item-value="id"
              item-text="name"
              v-model="yearId"
              @change="loadData"
              dense
              label="السنة"
              clearable
            ></v-select>
          </v-col>
          <v-col cols="1">
            <v-btn icon>
              <v-icon color="primary" @click="loadData"
                >mdi-magnify mdi-36px</v-icon
              >
            </v-btn>
          </v-col>
        </v-row>
      </v-card-subtitle>
      <v-card-text v-if="hasAccess">
        <v-data-table
          :headers="mainHeader"
          :items="tableResponse.data"
          :loading="loading"
          item-key="id"
          :options.sync="dataTableOptions"
          :server-items-length="tableResponse.total"
        >
          <template v-slot:no-data>
            <v-row v-if="permissionError">
              <v-col cols="12">
                <v-alert type="error" dense>
                  لاتملك الأحقية الكافية لرؤية البيانات
                </v-alert>
              </v-col>
            </v-row>
            <v-row v-if="!permissionError">
              <v-col cols="12" class="text-center">
                لاتوجد سجلات للعرض
              </v-col>
            </v-row>
          </template>
          <template v-slot:item.sn="{ item }">
            {{
              dataTableOptions.itemsPerPage * (dataTableOptions.page - 1) +
                tableResponse.data.indexOf(item) +
                1
            }}
          </template>
          <template v-slot:item.status="{ item }">
            <span
              class="ms-2 text-subtitle-2 accent--text"
              v-text="status[item.status]"
            >
            </span>
          </template>
          <template v-slot:item.action="{ item }">
            <v-btn
              v-tooltip="'تحرير'"
              color="primary"
              icon
              @click="edit(item)"
              v-if="fullAccess && item.status < 10"
            >
              <v-icon>
                mdi-square-edit-outline
              </v-icon>
            </v-btn>
            <v-btn
              v-tooltip="'قائمة الأسئلة'"
              color="primary"
              icon
              :to="{
                name: 'CheckListEditor',
                params: { auditPlanEncId: item.encId }
              }"
            >
              <v-icon>
                mdi-format-list-checks
              </v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-text>
        <error401 v-if="!hasAccess"></error401>
      </v-card-text>
      <v-card-actions> </v-card-actions>
    </v-card>
    <v-card elevation="2"> </v-card>
    <v-dialog dir="rtl" v-model="showDialog" width="60%">
      <v-card>
        <v-card-title>
          تحرير تدقيق إدارة
        </v-card-title>
        <v-card-text>
          <ValidationObserver ref="validator">
            <v-row dense>
              <v-col cols="6">
                <v-combobox
                  dense
                  outlined
                  label="الادارة"
                  :items="departments"
                  item-value="id"
                  item-text="name"
                  return-object
                  v-model="selectedAuditPlan.department"
                ></v-combobox>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="4">
                <v-menu
                  v-model="fromDateD"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      outlined
                      dense
                      v-model="selectedAuditPlan.fromDate"
                      label="من تاريخ"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="selectedAuditPlan.fromDate"
                    @input="fromDateD = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="4">
                <v-menu
                  v-model="toDateD"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      outlined
                      dense
                      v-model="selectedAuditPlan.toDate"
                      label="إلى تاريخ"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="selectedAuditPlan.toDate"
                    @input="toDateD = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </ValidationObserver>
          <v-row dense>
            <v-col cols="5">
              <v-autocomplete
                dense
                outlined
                :items="emps"
                :loading="isLoading"
                :search-input.sync="empText"
                item-text="fullName"
                item-value="id"
                label="المدقق"
                placeholder="اكتب هنا للبحث"
                prepend-icon="mdi-database-search"
                return-object
                v-model="selectedEmployee"
              ></v-autocomplete>
            </v-col>
            <v-col cols="1">
              <v-btn fab x-small color="primary" @click="addEmployee">
                <v-icon>
                  mdi-plus
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-data-table
            :headers="empHeader"
            :items="selectedAuditPlan.auditors"
          >
            <template v-slot:item.sn="{ item }">
              {{ selectedAuditPlan.auditors.indexOf(item) + 1 }}
            </template>
            <template v-slot:item.action="{ item }">
              <v-btn color="red" icon @click="deleteEmployee(item)">
                <v-icon>
                  mdi-trash-can
                </v-icon>
              </v-btn>
            </template>
          </v-data-table>
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
          <v-btn dark color="red" @click="showDialog = false">
            إلغاء
            <v-icon>
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Error401 from '@/components/Error401'
import _ from 'lodash'
import moment from 'moment'
import AuditPlanService from '@/service/audit/AuditPlanService'
import DepartmentService from '@/service/department/DepartmentService'
import DataTableRequest from '@/model/request/DataTableRequest'
import DataTableResponse from '@/model/response/DataTableResponse'
import { mapState } from 'vuex'
import EmployeeService from '@/service/employee/EmployeeService'
export default {
  components: { Error401 },
  created() {
    this.dataTableRequest.data.textSearch = ''
    this.status[0] = 'جديد'
    this.status[1] = 'إرجاع'
    this.status[10] = 'معتمد'
    this.status[11] = 'ارجاع نتائج'
    this.status[20] = 'معتمد نهائي'
    for (let y = 2021; y < moment().year() + 2; y++) {
      this.years.push({ id: y, name: y })
    }
    document.title = this.$route.meta.title
  },

  computed: {
    fullAccess: function() {
      let ha = false
      try {
        this.employee.roles.forEach(item => {
          if (
            item === 'ROLE_QUALITY' ||
            item === 'ROLE_MANAGER' ||
            item === 'ROLE_ADMIN'
          ) {
            ha = true
          }
        })
      } catch (e) {
        return false
      }
      return ha
    },
    hasAccess: function() {
      return true
    },
    ...mapState('auth', ['employee'])
  },
  mounted() {
    // DepartmentService.listDepartments()
    //   .then(response => {
    //     this.departments = response.data
    //   })
    //   .then(error => {})
    this.loadDepartmentTree()
  },
  methods: {
    loadDepartmentTree() {
      this.loadTree = true
      DepartmentService.loadTree()
        .then(response => {
          this.root = response.data
          this.loadTree = false
        })
        .catch(error => {
          this.loadTree = false
        })
    },
    updateSelectedDepartment() {
      this.department = Object.assign({}, this.selectedDepartment[0])
      this.departmentId = this.selectedDepartment[0].id
      this.depMenu = false
    },
    clearDepartment() {
      this.department = { id: -1, name: '', encId: '-1' }
      this.departmentId = -1
    },
    addEmployee() {
      if (this.selectedAuditPlan.auditors.indexOf(this.selectedEmployee) < 0) {
        this.selectedAuditPlan.auditors.push(this.selectedEmployee)
      }
    },
    deleteEmployee(item) {
      let idx = this.selectedAuditPlan.auditors.indexOf(this.selectedEmployee)
      this.selectedAuditPlan.auditors.splice(idx, 1)
    },
    searchEmployee() {
      this.empDataSearch = []
      this.empDataSearch.push({ key: 'full_name', value: this.empText })
      this.empDataSearch.push({ key: 'emp_no', value: this.empText })
      this.isLoading = true
      EmployeeService.findEmployee(this.empDataSearch)
        .then(response => {
          this.emps = response.data
          this.isLoading = false
        })
        .catch(error => {
          this.isLoading = false
        })
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
      this.dataTableRequest.data.data = {
        yearId: this.yearId,
        depId: this.fullAccess ? this.departmentId : this.employee.departmentId
      }
      AuditPlanService.search(this.dataTableRequest)
        .then(response => {
          this.tableResponse = response.data
          this.loading = false
          this.showDialog = false
          this.permissionError = false
        })
        .catch(error => {
          if (error.response.status === 403) {
            this.permissionError = true
          }
          this.loading = false
        })
    },

    save() {
      this.$refs.validator.validate().then(result => {
        if (result) {
          this.saving = true
          let enc_id = this.selectedAuditPlan.encId
          this.selectedAuditPlan.departmentId = this.selectedAuditPlan.department.id
          AuditPlanService.save(this.selectedAuditPlan)
            .then(response => {
              this.selectedAuditPlan = response.data
              if (enc_id === -1) {
                this.tableResponse.data.splice(0, 0, this.selectedAuditPlan)
              } else {
                let idx = _.findIndex(this.tableResponse.data, function(o) {
                  return enc_id === o.encId
                })
                this.tableResponse.data.splice(idx, 1, this.selectedAuditPlan)
              }
              this.showDialog = false
              this.saving = false
              this.$toast.success('تم الحفظ بنجاح')
            })
            .catch(error => {
              this.saving = false
              this.$toast.error('هناك خطأ في عملية الحفظ')
            })
        }
      })
    },

    creatNew() {
      this.showDialog = true
      this.selectedAuditPlan = Object.assign({}, this.emptyAuditPlan)
    },
    edit(item) {
      this.showDialog = true
      this.selectedAuditPlan = Object.assign({}, item)
    }
  },
  watch: {
    dataTableOptions: {
      handler(newVal, oldVal) {
        this.loadData()
      },
      deep: true
    },
    empText(newValue, oldValue) {
      if (newValue != null && newValue.length >= 2) {
        this.searchEmployee()
      }
    }
  },
  data() {
    return {
      depMenu: false,
      selectedDepartment: [],
      departmentId: -1,
      department: { id: -1, name: '', encId: '-1' },
      root: [],
      years: [],
      yearId: moment().year(),
      status: new Map(),
      empDataSearch: [],
      emps: [],
      selectedEmployee: {},
      isLoading: false,
      empText: '',
      departments: [],
      fromDateD: false,
      toDateD: false,
      permissionError: false,
      showDialog: false,
      selectedAuditPlan: {},
      saving: false,
      emptyAuditPlan: {
        id: -1,
        department: { id: -1, name: '' },
        departmentId: -1,
        status: 0,
        fromDate: '',
        toDate: '',
        auditors: [],
        encId: -1
      },
      loading: false,
      tableResponse: new DataTableResponse(0, 0, 10),
      dataTableRequest: new DataTableRequest(0, 10),
      dataTableOptions: { page: 1, itemsPerPage: 10 },
      empHeader: [
        {
          text: 'مسلسل',
          value: 'sn',
          align: 'center',
          sortable: false,
          width: '10%'
        },
        {
          text: 'اسم الموظف',
          value: 'fullName',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '55%'
        },
        {
          text: '#',
          value: 'action',
          align: 'center',
          sortable: false,
          width: '10%'
        }
      ],
      mainHeader: [
        {
          text: 'مسلسل',
          value: 'sn',
          align: 'center',
          sortable: false,
          width: '5%'
        },
        {
          text: 'الوحدة الادارة',
          value: 'department.name',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '40%'
        },
        {
          text: 'تاريخ البدء',
          value: 'fromDate',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '15%'
        },
        {
          text: 'تاريخ النهاية',
          value: 'toDate',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '15%'
        },
        {
          text: 'الحالة',
          value: 'status',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '10%'
        },
        {
          text: '#',
          value: 'action',
          align: 'center',
          sortable: false,
          width: '15%'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped></style>
