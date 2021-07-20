<template>
  <div>
    <v-card elevation="2">
      <v-card-title>
        <v-toolbar-items>
          <v-icon>
            mdi-bug mdi-24px
          </v-icon>
          <v-toolbar-title>إدارة الأخطاء</v-toolbar-title>
        </v-toolbar-items>
      </v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col cols="5">
            <v-menu
              ref="menu2"
              v-model="menu2"
              :close-on-content-click="false"
              :return-value.sync="dates"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  dense
                  outlined
                  v-model="dateRangeText"
                  label="فترة البحث"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker v-model="dates" no-title scrollable range>
                <v-spacer></v-spacer>
                <v-btn text color="accent" @click="menu2 = false">
                  إلغاء
                </v-btn>
                <v-btn text color="primary" @click="$refs.menu2.save(dates)">
                  موافق
                </v-btn>
              </v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="4">
            <v-select
              clearable
              outlined
              dense
              label="الموظف"
              :items="employees"
              item-text="fullName"
              item-value="id"
              v-model="empId"
            >
            </v-select>
          </v-col>
          <v-col cols="2">
            <v-text-field
              clearable
              type="number"
              outlined
              dense
              label="معرف الخطأ"
              v-model="pid"
            ></v-text-field>
          </v-col>
          <v-col cols="1">
            <v-btn color="primary" icon>
              <v-icon @click="resetAndLoadData">mdi-magnify mdi-36px</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-text v-if="hasAccess">
        <v-data-table
          :headers="showHeaders"
          :items="tableResponse.data"
          :loading="loading"
          item-key="id"
          :options.sync="dataTableOptions"
          :server-items-length="tableResponse.total"
        >
          <template v-slot:top>
            <v-row dense>
              <v-col cols="4">
                <v-select
                  return-object
                  :items="headers"
                  v-model="selectedHeader"
                  dense
                  multiple
                >
                  <template v-slot:selection="{ item, index }">
                    <v-chip v-if="index < 2">
                      <span>{{ item.text }}</span>
                    </v-chip>
                    <span v-if="index === 2" class="grey--text caption"
                      >(+{{ selectedHeader.length - 2 }} others)</span
                    >
                  </template>
                </v-select>
              </v-col>
            </v-row>
          </template>
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
          <template v-slot:item.exceptionName="{ item }">
            <span
              v-text="item.exceptionName"
              @click="showExceptionDlg(item)"
              class="error-text clickable"
            ></span>
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
    <v-dialog v-model="exceptionDlg" width="60%">
      <v-card>
        <v-card-title>
          معلومات الخطأ
        </v-card-title>
        <v-card-text dir="ltr">
          <div>
            <json-viewer
              :value="selectedException"
              :expand-depth="5"
              boxed
              copyable
              sort
              expanded
              class="my-awesome-json-theme"
            ></json-viewer>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn dark text color="red darken-1" @click="exceptionDlg = false">
            إغلاق
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
import JsonViewer from 'vue-json-viewer'
import moment from 'moment'
import DataTableRequest from '@/model/request/DataTableRequest'
import DataTableResponse from '@/model/response/DataTableResponse'
import { mapState } from 'vuex'
import EmployeeService from '@/service/employee/EmployeeService'
import BugService from '@/service/bug/BugService'
export default {
  created() {
    this.dataTableRequest.data.textSearch = ''
  },
  components: { JsonViewer },
  mounted() {
    this.loadEmployee()
    this.headers = Object.values(this.mainHeader)
    this.selectedHeader = this.headers
    // this.selectedHeader = JSON.parse(JSON.stringify(this.mainHeader))
  },
  computed: {
    showHeaders() {
      return this.headers.filter(s => {
        return this.selectedHeader.includes(s)
      })
    },
    dateRangeText: function() {
      return this.dates.join(' ~ ')
    },
    canEdit: function() {
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
      // let ha = false
      // try {
      //   this.employee.roles.forEach(item => {
      //     if (item === 'ROLE_HR' || item === 'ROLE_ADMIN') {
      //       ha = true
      //     }
      //   })
      // } catch (e) {
      //   return false
      // }
      // return ha
    },
    ...mapState('auth', ['employee'])
  },

  methods: {
    showExceptionDlg(item) {
      this.selectedException = {}

      BugService.getOne(item.id)
        .then(res => {
          this.selectedException = res.data
          this.exceptionDlg = true
        })
        .catch(error => {})
    },
    loadEmployee() {
      this.loadingEmployee = true
      EmployeeService.listAll()
        .then(response => {
          this.employees = response.data
          this.loadingEmployee = false
        })
        .catch(error => {
          this.loadingEmployee = false
        })
    },
    resetAndLoadData() {
      this.dataTableOptions.page = 1
      this.loadData()
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
        fromDate: this.dates[0],
        toDate: this.dates[1],
        empId: this.empId == null ? -1 : this.empId,
        id: this.pid == null ? -1 : this.pid
      }
      BugService.search(this.dataTableRequest)
        .then(response => {
          this.tableResponse = response.data
          this.loading = false
          this.permissionError = false
        })
        .catch(error => {
          if (error.response.status === 403) {
            this.permissionError = true
          }
          this.loading = false
        })
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
      selectedException: {},
      exceptionDlg: false,
      loadingEmployee: false,
      employees: [],
      pid: null,
      selectedHeader: [],
      headers: [],
      menu2: false,
      dates: [
        moment()
          .subtract(1, 'months')
          .format('yyyy-MM-DD'),
        moment().format('yyyy-MM-DD')
      ],
      empId: null,
      fromDate: moment().format('dd/MM/yyyy'),
      toDate: moment().format('dd/MM/yyyy'),
      permissionError: false,
      showDialog: false,
      loading: false,
      tableResponse: new DataTableResponse(0, 0, 10),
      dataTableRequest: new DataTableRequest(0, 10),
      dataTableOptions: { page: 1, itemsPerPage: 10 },

      mainHeader: [
        {
          text: 'المعرف',
          value: 'id',
          align: 'center',
          sortable: false,
          width: '5%'
        },
        {
          text: 'نوع الخطأ',
          value: 'exceptionName',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '15%'
        },
        {
          text: 'الموظف',
          value: 'employeeName',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '30%'
        },
        {
          text: 'الرابط',
          value: 'serviceUrl',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '30%'
        },
        {
          text: 'تاريخ ',
          value: 'createdDate',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '15%'
        },
        {
          text: 'نص الخطأ',
          value: 'message',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '15%'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.my-awesome-json-theme {
  background: #fff;
  white-space: nowrap;
  color: #525252;
  font-size: 14px;
  font-family: Consolas, Menlo, Courier, monospace;

  .jv-ellipsis {
    color: #999;
    background-color: #eee;
    display: inline-block;
    line-height: 0.9;
    font-size: 0.9em;
    padding: 0px 4px 2px 4px;
    border-radius: 3px;
    vertical-align: 2px;
    cursor: pointer;
    user-select: none;
  }
  .jv-button {
    color: #49b3ff;
  }
  .jv-key {
    color: #111111;
  }
  .jv-item {
    &.jv-array {
      color: #111111;
    }
    &.jv-boolean {
      color: #fc1e70;
    }
    &.jv-function {
      color: #067bca;
    }
    &.jv-number {
      color: #fc1e70;
    }
    &.jv-number-float {
      color: #fc1e70;
    }
    &.jv-number-integer {
      color: #fc1e70;
    }
    &.jv-object {
      color: #111111;
    }
    &.jv-undefined {
      color: #e08331;
    }
    &.jv-string {
      color: #42b983;
      word-break: break-word;
      white-space: normal;
    }
  }
  .jv-code {
    .jv-toggle {
      &:before {
        padding: 0px 2px;
        border-radius: 2px;
      }
      &:hover {
        &:before {
          background: #eee;
        }
      }
    }
  }
}
</style>
