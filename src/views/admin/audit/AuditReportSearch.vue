<template>
  <div>
    <v-card elevation="2" class="custom-heading">
      <v-card-title>
        <v-toolbar-items>
          <v-icon>
            mdi-book-check mdi-24px
          </v-icon>
          <v-toolbar-title>إدارة خطة التدقيق</v-toolbar-title>
        </v-toolbar-items>
      </v-card-title>
      <v-card-subtitle class="mt-0" v-if="hasAccess">
        <v-row dense>
          <v-col cols="4">
            <v-text-field
              outlined
              dense
              label="عنوان التدقيق"
              clearable
            ></v-text-field>
          </v-col>
          <v-col cols="2">
            <v-select
              outlined
              :items="years"
              item-value="id"
              item-text="name"
              v-model="yearId"
              @change="loadData"
              dense
              label="السنة"
            ></v-select>
          </v-col>
          <v-col cols="2">
            <v-select
              :items="reportStatus"
              v-model="statusId"
              item-value="id"
              item-text="name"
              outlined
              label="الحالة"
              dense
              clearable
            ></v-select>
          </v-col>
          <v-col cols="4">
            <v-btn color="primary" icon>
              <v-icon color="primary" @click="loadData"
                >mdi-magnify mdi-36px</v-icon
              >
            </v-btn>
            <v-btn
              v-if="fullAccess"
              color="primary"
              icon
              class="float-left"
              :to="{ name: 'AuditReportEdit', params: { encId: '-1' } }"
            >
              <v-icon color="primary">mdi-plus mdi-36px</v-icon>
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
            <span class="ms-2 text-subtitle-2 accent--text">
              {{ reportStatus.filter(o => o.id === item.status)[0].name }}
            </span>
          </template>
          <template v-slot:item.action="{ item }">
            <v-btn
              color="primary"
              icon
              :to="{
                name: 'AuditReportEdit',
                params: { encId: item.encId }
              }"
            >
              <v-icon>
                mdi-eye
              </v-icon>
            </v-btn>
            <v-btn
              v-if="fullAccess && item.status !== 30"
              color="error"
              icon
              @click="deleteItem(item)"
            >
              <v-icon>
                mdi-trash-can
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
  </div>
</template>

<script>
import _ from 'lodash'
import moment from 'moment'
import AuditReportService from '@/service/audit/AuditReportService'
import DepartmentService from '@/service/department/DepartmentService'
import DataTableRequest from '@/model/request/DataTableRequest'
import DataTableResponse from '@/model/response/DataTableResponse'
import { mapState } from 'vuex'
import Error401 from '@/components/Error401'
export default {
  components: { Error401 },
  created() {
    this.dataTableRequest.data.textSearch = ''
    this.status[0] = 'جديد'
    this.status[10] = 'معتمد'
    this.status[20] = 'معتمد نهائي'
    for (let y = 2021; y < moment().year() + 2; y++) {
      this.years.push({ id: y, name: y })
    }
    document.title = this.$route.meta.title
  },

  computed: {
    statusList: function() {
      let list = []
      for (let key in this.status) {
        let item = { id: key, name: this.status[key] }
        list.push(item)
      }
      return list
    },
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
      let ha = false
      try {
        this.employee.roles.forEach(item => {
          if (this.fullAccess || item === 'ROLE_QUALITY_USER') {
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
    deleteItem(item) {
      this.$confirm('هل تود فعلا حذف التقرير ' + item.title).then(res => {
        if (res) {
          AuditReportService.delete(item)
            .then(res => {
              this.loadData()
              this.$toast.success('تم الحذف بنجاح')
            })
            .catch(err => {
              if (err.response.data.id) {
                this.$toast.error(
                  'هناك خطأ في عمليت الحذف ' +
                    'رقم الخطأ ' +
                    err.response.data.id
                )
              } else {
                this.$toast.error('هناك خطأ في عمليت الحذف ')
              }
            })
        }
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
        title: this.title,
        status: this.statusId === null ? -1 : this.statusId
      }
      AuditReportService.search(this.dataTableRequest)
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
      reportStatus: [
        { id: 0, name: 'جديد' },
        { id: 10, name: 'مرجع' },
        { id: 20, name: 'مرسل' },
        { id: 30, name: 'معتمد' }
      ],
      years: [],
      yearId: moment().year(),
      status: new Map(),
      statusId: null,
      empDataSearch: [],
      selectedEmployee: {},
      isLoading: false,
      title: '',
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
          text: 'عنوان التدقيق',
          value: 'title',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '35%'
        },
        {
          text: 'مجال التدقيق',
          value: 'domain',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '30%'
        },
        {
          text: 'العام',
          value: 'yearId',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '10%'
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
          sortable: true,
          filterable: true,
          width: '10%'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped></style>
