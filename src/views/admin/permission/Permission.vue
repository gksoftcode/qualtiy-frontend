<template>
  <v-card elevation="2">
    <v-card-title>
      <v-toolbar dense>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
        <v-toolbar-title>إدارة الأحقيات</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-autocomplete
          :items="employees"
          item-text="fullName"
          item-value="encId"
          v-model="selectedEmployee"
          dense
          clearable
          :loading="loadingEmployee"
          label="الموظف"
          return-object
        ></v-autocomplete>
        <v-select
          :items="roles"
          item-text="arabicName"
          item-value="encId"
          v-model="selectedRole"
          dense
          clearable
          label="الأحقية"
          return-object
        >
        </v-select>
        <v-btn icon>
          <v-icon @click="loadData">mdi-magnify</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn icon @click="addPermissionToEmployee">
          <v-icon>
            mdi-plus
          </v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </v-toolbar>
    </v-card-title>
    <v-card-text>
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
        <template v-slot:item.employee.user.active="{ item }">
          <v-icon color="green darken-2" v-if="item.employee.user.active">
            mdi-bookmark-check
          </v-icon>
          <v-icon color="red darken-2" v-else>
            mdi-bookmark-remove
          </v-icon>
        </template>
        <template v-slot:item.action="{ item }">
          <v-btn
            color="red lighten-1"
            icon
            @click="deletePermissionFromEmployee(item.employee, item.role)"
          >
            <v-icon>
              mdi-trash-can
            </v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card-text>
    <v-card-actions> </v-card-actions>
  </v-card>
</template>

<script>
import PermissionService from '@/service/Permission/PermissionService'
import DataTableRequest from '@/model/request/DataTableRequest'
import DataTableResponse from '@/model/response/DataTableResponse'
import EmployeeService from '@/service/employee/EmployeeService'
import { mapState } from 'vuex'
export default {
  created() {
    this.dataTableRequest.data.textSearch = ''
    console.log(this.employee)
  },
  mounted() {
    this.loadRoles()
    this.loadEmployee()
  },
  computed: {
    ...mapState('auth', ['employee'])
  },
  methods: {
    loadRoles() {
      PermissionService.listAllRole()
        .then(response => {
          this.roles = response.data
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
    addPermissionToEmployee() {
      if (this.selectedEmployee != null && this.selectedRole != null) {
        this.$confirm(
          'هل تود منح أحقية <span class="permission-name">' +
            this.selectedRole.arabicName +
            '</span> لـ<span class="employee-name">' +
            this.selectedEmployee.fullName +
            '</span> ؟'
        ).then(res => {
          if (res) {
            PermissionService.addPermissionToEmployee(
              this.selectedEmployee.encId,
              this.selectedRole.encId
            )
              .then(response => {
                if (response.data.success) {
                  this.$toast.success(this.messages[response.data.messageId])
                } else {
                  this.$toast.error(this.messages[response.data.messageId])
                }
                this.loadData()
              })
              .catch(error => {})
          }
        })
      } else {
        this.$toast.error('الرجاء تحديد الموظف والأحقية ..')
      }
    },
    deletePermissionFromEmployee(emp, role) {
      this.$confirm(
        'هل تود سحب هذه <span class="permission-name">' +
          role.arabicName +
          '</span> من <span class="employee-name">' +
          emp.fullName +
          '</span> ؟'
      ).then(res => {
        if (res) {
          PermissionService.deletePermissionFromEmployee(emp.encId, role.encId)
            .then(response => {
              if (response.data.success) {
                this.$toast.success(this.messages[response.data.messageId])
              } else {
                this.$toast.error(this.messages[response.data.messageId])
              }
              this.loadData()
            })
            .catch(error => {})
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
      this.dataTableRequest.data = []
      this.dataTableRequest.data.push({
        key: 'employeeId',
        value:
          this.selectedEmployee == null ? null : this.selectedEmployee.encId
      })
      console.log(this.selectedEmployee)
      PermissionService.listEmployeeByPermission(
        this.dataTableRequest,
        this.selectedRole == null ? -1 : this.selectedRole.encId
      )
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
        console.log(newVal)
        this.loadData()
      },
      deep: true
    }
  },
  data() {
    return {
      roles: [],
      selectedRole: null,
      employees: [],
      selectedEmployee: null,
      loadingEmployee: false,
      saving: false,
      loading: false,
      messages: [
        'تم اضافة الأحقية بنجاح',
        'الموظف لديه الأحقية فعلا',
        'حدث خطأ ما أثناء منح الأحقية',
        'تم حذف الأحقية',
        'حدث خطأ ما أثناء حذف الأحقية'
      ],
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
          text: 'رقم الموظف',
          value: 'employee.empNumber',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '10%'
        },
        {
          text: 'سم الموظف',
          value: 'employee.fullName',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '50%'
        },
        // {
        //   text: 'الحالة',
        //   value: 'employee.user.active',
        //   align: 'center',
        //   sortable: true,
        //   filterable: true,
        //   width: '10%'
        // },
        {
          text: 'الأحقية',
          value: 'role.arabicName',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '20%'
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

<style lang="scss">
.permission-name {
  color: var(--v-primary-base);
}
.employee-name {
  color: var(--v-primary-base);
}
</style>
