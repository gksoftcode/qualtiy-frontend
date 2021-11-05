<template>
  <v-card elevation="2" class="custom-heading">
    <v-card-title>
      <v-toolbar-items>
        <v-icon>
          mdi-file-tree-outline mdi-flip-h
        </v-icon>
        <v-toolbar-title>إدارة الوحدات الادارية</v-toolbar-title>
      </v-toolbar-items>
    </v-card-title>
    <v-card-text v-if="hasAccess">
      <v-card fixed app>
        <v-toolbar dense>
          <v-btn
            v-tooltip="'إدارة جديدة'"
            :disabled="disableAdd"
            @click="createNewDepartment"
            icon
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-btn
            v-tooltip="'تحديد المدير'"
            :disabled="disableAdd"
            @click="showEmployeeSelector"
            icon
          >
            <v-icon>mdi-account-tie-outline</v-icon>
          </v-btn>
          <v-btn
            v-tooltip="'تحرير'"
            :disabled="disableAdd"
            @click="editDepartmentFn"
            icon
          >
            <v-icon> mdi-square-edit-outline</v-icon>
          </v-btn>
          <v-btn
            v-tooltip="'ترتيب الادارات'"
            :disabled="disableAdd || isLeaf"
            @click="orderDlg = true"
            icon
          >
            <v-icon> mdi-order-numeric-ascending</v-icon>
          </v-btn>
          <v-btn
            v-tooltip="'حذف'"
            :disabled="disableAdd || !isLeaf"
            @click="deleteDepartment"
            icon
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-toolbar>
      </v-card>
      <v-card class="mt-2" elevation="0">
        <v-card-text>
          <v-row>
            <v-col cols="4">
              <v-card class="department-card" :loading="loadingTree">
                <v-card-title>
                  الهيكل
                </v-card-title>
                <v-card-text>
                  <v-treeview
                    dense
                    :items="root"
                    item-children="departmentList"
                    item-key="id"
                    return-object
                    :active.sync="activeDepartment"
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
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="8">
              <v-card class="department-card">
                <v-card-title>
                  <span v-text="currentSelected.name" />
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="employeeHeader"
                    :items="tableResponse.data"
                    :loading="loading"
                    item-key="id"
                    :options.sync="dataTableOptions"
                    :server-items-length="tableResponse.total"
                  >
                    <template v-slot:item.sn="{ item }">
                      {{
                        dataTableOptions.itemsPerPage *
                          (dataTableOptions.page - 1) +
                          tableResponse.data.indexOf(item) +
                          1
                      }}
                    </template>
                    <template v-slot:item.isManager="{ item }">
                      <v-icon
                        color="primary"
                        v-if="item.id === currentSelected.managerId"
                      >
                        mdi-account-tie
                      </v-icon>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-dialog persistent width="60%" v-model="editDialog">
        <v-card dense>
          <v-card-title>
            <span class="headline">تحرير وحدة إدارية</span>
          </v-card-title>
          <v-card-subtitle>
            <span>
              الادارة المستوى الحالي :
            </span>
            {{ currentSelected.name }}
          </v-card-subtitle>
          <v-card-text>
            <v-container>
              <v-row dense>
                <v-col cols="2">
                  <v-text-field
                    type="numeric"
                    dense
                    outlined
                    label="رقم الادارة"
                    v-model="editDepartment.departmentNo"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="8">
                  <v-text-field
                    dense
                    outlined
                    label="اسم الوحدة"
                    v-model="editDepartment.name"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions dense>
            <v-spacer></v-spacer>
            <v-btn
              text
              color="primary"
              :loading="saving"
              :disabled="saving"
              @click="save()"
              >حفظ</v-btn
            >
            <v-btn text color="error" @click="close">اغلاق</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog persistent width="60%" v v-model="employeeSelector">
        <v-card elevation="0">
          <v-card-text>
            <EmployeeSelector
              :department="currentSelected"
              v-model="selectedEmployee"
              @select="selectEnable = true"
            />
          </v-card-text>
          <v-card-actions>
            <v-btn
              text
              color="primary"
              :disabled="!selectEnable"
              @click="setManager"
            >
              إختيار
            </v-btn>
            <v-btn text color="red" @click="employeeSelector = false">
              إغلاق
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="orderDlg" width="40%">
        <v-card>
          <v-card-title>
            ترتيب الإدارات
          </v-card-title>
          <v-card-text>
            <v-list dense>
              <draggable
                :list="currentSelected.departmentList"
                ghost-class="ghost"
                @change="onReOrder"
              >
                <transition-group>
                  <v-list-item
                    v-for="item in currentSelected.departmentList"
                    :key="item.id"
                  >
                    <v-list-item-icon>
                      <v-icon>
                        mdi-cube-outline
                      </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title v-text="item.name"></v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </transition-group>
              </draggable>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-btn text color="primary" @click="reOrder">
              حفظ الترتيب
            </v-btn>
            <v-btn text color="red darken" @click="orderDlg = false">
              إغلاق
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-text>
    <v-card-text>
      <error401 v-if="!hasAccess"></error401>
    </v-card-text>
  </v-card>
</template>
<script>
import draggable from 'vuedraggable'
import Department from '@/model/hr/Department'
import DepartmentService from '@/service/department/DepartmentService'
import EmployeeSelector from '@/components/EmployeeSelector'
import EmployeeService from '@/service/employee/EmployeeService'
import DataTableResponse from '@/model/response/DataTableResponse'
import DataTableRequest from '@/model/request/DataTableRequest'
import { mapState } from 'vuex'
import Error401 from '@/components/Error401'

export default {
  components: {
    Error401,
    EmployeeSelector,
    draggable
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
    isLeaf: function() {
      let ha = false
      if (
        this.currentSelected &&
        this.currentSelected.departmentList.length === 0
      ) {
        ha = true
      }
      return ha
    },
    ...mapState('auth', ['employee'])
  },
  data() {
    return {
      orderDlg: false,
      loadingTree: false,
      loading: false,
      tableResponse: new DataTableResponse(0, 0, 10),
      dataTableRequest: new DataTableRequest(0, 10),
      dataTableOptions: { page: 1, itemsPerPage: 10 },
      selectEnable: false,
      employeeSelector: false,
      selectedEmployee: { id: -1, fullName: '' },
      activeDepartment: [],
      editDialog: false,
      disableAdd: true,
      saving: false,
      currentSelected: {},
      editDepartment: {
        name: '',
        level: 1,
        parentId: 0,
        delete: 0,
        encId: -1
      },
      emptyDepartment: new Department(),
      root: [],
      departmentOrder: [],
      employeeHeader: [
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
          sortable: false,
          filterable: true,
          width: '55%'
        },
        {
          text: 'الادارة',
          value: 'department.name',
          align: 'center',
          sortable: false,
          filterable: true,
          width: '15%'
        },
        {
          text: 'الوظيفة',
          value: 'job.name',
          align: 'center',
          sortable: false,
          filterable: true,
          width: '15%'
        },
        {
          text: 'البريد',
          value: 'email',
          align: 'center',
          sortable: false,
          filterable: true,
          width: '15%'
        },
        {
          text: '#',
          value: 'isManager',
          align: 'center',
          sortable: false,
          width: '10%'
        }
      ]
    }
  },
  watch: {
    activeDepartment(val) {
      if (val && val.length > 0) {
        this.currentSelected = this.activeDepartment[0]
        this.disableAdd = false
        this.listAllEmployee()
      } else {
        this.disableAdd = true
      }
    }
  },
  mounted() {
    this.loadTree()
    document.title = this.$route.meta.title
  },
  methods: {
    showEmployeeSelector() {
      this.selectEnable = false
      this.employeeSelector = true
      this.selectedEmployee = { id: -1, fullName: '' }
    },
    setManager() {
      this.$confirm('هل تريد أن تعدل المدير').then(res => {
        if (res) {
          if (this.selectedEmployee.id !== -1) {
            DepartmentService.setManager(
              this.currentSelected,
              this.selectedEmployee
            )
              .then(response => {
                this.currentSelected.managerId = this.selectedEmployee.id
                this.employeeSelector = false
                this.$toast.success('تم تعديل المدير')
              })
              .catch(error => {
                this.employeeSelector = false
                this.$toast.error('خطأ في عملية الحفظ')
              })
          }
        }
      })
    },
    save() {
      this.saving = true
      this.currentSelected = this.activeDepartment[0]
      if (this.currentSelected.id) {
        if (this.editDepartment.encId === -1) {
          this.editDepartment.level = this.currentSelected.level + 1
          this.editDepartment.parentId = this.currentSelected.id
          this.editDepartment.manager = null
        }
        DepartmentService.save(this.editDepartment)
          .then(response => {
            this.saving = false
            this.currentSelected = response.data
            this.loadTree()
            this.close()
            this.$toast.success('تم الحفظ بنجاح')
          })
          .catch(error => {
            this.saving = false
            if (error.response.data.id) {
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
    },
    deleteDepartment() {
      this.$confirm(
        'هل تود حذف إدارة ' +
          '<span class="dialog-primary-text">' +
          this.currentSelected.name +
          '</span>'
      ).then(res => {
        if (res) {
          DepartmentService.delete(this.currentSelected)
            .then(response => {
              if (response.data.success === true) {
                this.$toast.success('تم الحذف بنجاح')
                this.loadTree()
              } else {
                this.$toast.error(
                  'لايمكن حذف هذه الادارة , بسبب وجود بيانات مرتبطه بهذه الإدارة ..'
                )
              }
            })
            .catch(error => {
              if (error.response.data.id) {
                this.$toast.error(
                  'هناك خطأ في عملية الحفظ ' +
                    'رقم الخطأ ' +
                    error.response.data.id
                )
              } else {
                this.$toast.error('هناك خطأ في عملية الحفظ ')
              }
            })
        }
      })
    },
    find(item, pid) {
      if (item.id === pid) {
        this.currentSelected = item
      } else {
        if (item.departmentList && item.departmentList.length > 0) {
          item.departmentList.forEach(child => {
            this.find(child, pid)
          })
        }
      }
    },
    createNewDepartment() {
      this.editDepartment = Object.assign({}, this.emptyDepartment)
      this.editDepartment.parentId = this.currentSelected.id
      this.editDialog = true
    },
    editDepartmentFn() {
      this.editDepartment = Object.assign({}, this.currentSelected)
      this.editDialog = true
    },
    close() {
      this.editDialog = false
    },
    loadTree() {
      this.loadingTree = true
      DepartmentService.loadTree()
        .then(response => {
          this.root = response.data
          this.loadingTree = false
        })
        .catch(error => {
          this.loadingTree = false
        })
    },
    listAllEmployee() {
      this.loading = true
      this.dataTableRequest.currentPage = this.dataTableOptions.page - 1
      this.dataTableRequest.pageSize = this.dataTableOptions.itemsPerPage
      // if (this.dataTableOptions.sortBy.length > 0) {
      //   this.dataTableRequest.sortBy = this.dataTableOptions.sortBy[0]
      // } else {
      //   this.dataTableRequest.sortBy = ''
      // }
      // if (this.dataTableOptions.sortDesc.length > 0) {
      //   this.dataTableRequest.sortDesc = this.dataTableOptions.sortDesc[0]
      // } else {
      //   this.dataTableRequest.sortDesc = false
      // }
      this.dataTableRequest.data.data = { encId: this.currentSelected.encId }
      EmployeeService.listAllEmployeeByDepartment(this.dataTableRequest)
        .then(response => {
          this.tableResponse = response.data
          this.loading = false
          this.showDialog = false
        })
        .catch(error => {
          this.loading = false
        })
    },
    reOrder() {
      DepartmentService.reOrder(this.departmentOrder)
        .then(response => {})
        .catch(error => {})
    },
    onReOrder(event) {
      this.departmentOrder = []
      let x = 0
      this.currentSelected.departmentList.forEach(item => {
        this.departmentOrder.push({ key: item.id, value: x++ })
      })
    }
  }
}
</script>

<style>
.department-card {
  max-height: 500px;
  min-height: 500px;
  overflow: auto;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
