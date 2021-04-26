<template>
  <div>
    <v-card elevation="2">
      <v-card-title>
        <v-toolbar-items>
          <v-icon>
            mdi-briefcase-account mdi-24px
          </v-icon>
          <v-toolbar-title>إدارة خطة التدقيق</v-toolbar-title>
        </v-toolbar-items>
      </v-card-title>
      <v-card-subtitle class="mt-0" v-if="hasAccess">
        <v-toolbar dense>
          <v-app-bar-nav-icon></v-app-bar-nav-icon>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="dataTableRequest.data.textSearch"
            @keypress.enter="loadData"
            placeholder="البحث"
          ></v-text-field>
          <v-btn icon>
            <v-icon @click="loadData">mdi-magnify</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn icon @click="creatNew()">
            <v-icon>
              mdi-plus
            </v-icon>
          </v-btn>
          <v-btn icon>
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </v-toolbar>
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
          <template v-slot:item.active="{ item }">
            <v-icon color="green darken-2" v-if="item.active">
              mdi-bookmark-check
            </v-icon>
            <v-icon color="red darken-2" v-else>
              mdi-bookmark-remove
            </v-icon>
          </template>
          <template v-slot:item.action="{ item }">
            <v-btn color="primary" icon @click="edit(item)">
              <v-icon>
                mdi-square-edit-outline
              </v-icon>
            </v-btn>
            <v-btn
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
        <v-alert
          border="bottom"
          icon="mdi-key-outline mdi-flip-h"
          type="error"
          :value="!hasAccess"
        >
          لاتملك الأحقية الكافية لاستخدام هذه الخدمة
        </v-alert>
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
import _ from 'lodash'
import AuditPlanService from '@/service/audit/AuditPlanService'
import DepartmentService from '@/service/department/DepartmentService'
import DataTableRequest from '@/model/request/DataTableRequest'
import DataTableResponse from '@/model/response/DataTableResponse'
import { mapState } from 'vuex'
import EmployeeService from '@/service/employee/EmployeeService'
export default {
  created() {
    this.dataTableRequest.data.textSearch = ''
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
    DepartmentService.listDepartments()
      .then(response => {
        this.departments = response.data
      })
      .then(error => {})
  },
  methods: {
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
        yearId: 2021
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
          width: '10%'
        },
        {
          text: 'الوحدة الادارة',
          value: 'department.name',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '55%'
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
          value: 'active',
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
          width: '10%'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped></style>
