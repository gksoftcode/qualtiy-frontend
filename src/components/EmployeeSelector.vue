<template>
  <v-card elevation="2">
    <v-card-title>
      بحث في دليل الموظفين
    </v-card-title>
    <v-card-subtitle v-if="department.id > 0">
      {{ department.name }}
    </v-card-subtitle>
    <v-card-text>
      <v-row dense>
        <v-col cols="2">
          <v-text-field
            dense
            outlined
            type="number"
            v-model="employeeNumber"
            label="رقم الموظف"
          />
        </v-col>
        <v-col cols="4">
          <v-text-field
            dense
            outlined
            v-model="employeeName"
            label="اسم الموظف"
          />
        </v-col>
        <v-btn icon @click="loadData">
          <v-icon>
            mdi-account-search
          </v-icon>
        </v-btn>
        <v-col cols="4" class="selected-employee primary--text">
          {{ selectedEmployee.fullName }}
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

        <template v-slot:item.action="{ item }">
          <v-btn color="primary" icon @click="selectOne(item)">
            <v-icon>
              {{
                item.id === selectedEmployee.id
                  ? 'mdi-checkbox-marked'
                  : 'mdi-checkbox-blank-outline'
              }}
            </v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card-text>
    <v-card-actions> </v-card-actions>
  </v-card>
</template>

<script>
import _ from 'lodash'
import EmployeeService from '@/service/employee/EmployeeService'
import DataTableRequest from '@/model/request/DataTableRequest'
import DataTableResponse from '@/model/response/DataTableResponse'
export default {
  model: {
    prop: 'selectedEmployee',
    event: 'select'
  },
  props: {
    department: {
      type: Object,
      default: function() {
        return { id: -1, name: '' }
      }
    },
    selectedEmployee: {
      type: Object,
      default: function() {
        return { id: -1, fullName: '' }
      }
    }
  },
  mounted() {},
  methods: {
    selectOne(emp) {
      this.$emit('select', emp)
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
      this.dataTableRequest.data = {
        employeeNumber: this.employeeNumber,
        employeeName: this.employeeName,
        departmentId: this.department.id
      }
      EmployeeService.searchByDepartment(this.dataTableRequest)
        .then(response => {
          this.tableResponse = response.data
          this.loading = false
          this.showDialog = false
        })
        .catch(error => {
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
      employeeName: '',
      employeeNumber: null,
      showDialog: false,
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
          text: 'الادارة',
          value: 'department.name',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '15%'
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
.selected-employee {
  font-weight: bold;
}
</style>
