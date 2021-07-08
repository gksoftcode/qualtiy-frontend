<template>
  <div>
    <v-card elevation="2">
      <v-card-title>
        <v-toolbar-items>
          <v-icon>
            mdi-notebook-multiple mdi-flip-h mdi-24px
          </v-icon>
          <v-toolbar-title>إدارة الإجراءات الإدارية</v-toolbar-title>
        </v-toolbar-items>
      </v-card-title>
      <v-card-actions class="mt-0" v-if="hasAccess">
        <v-row dense>
          <v-col cols="4">
            <ValidationProvider
              name="الادارة / القسم / الشعبة"
              v-slot="{ errors }"
              rules="required"
              v-if="hasFullDepartment"
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
          <v-col cols="2">
            <v-select
              v-model="selectedType"
              :items="types"
              item-value="id"
              item-text="name"
              label="نوع الاجراء"
              dense
              outlined
            ></v-select>
          </v-col>
          <v-col cols="2">
            <v-select
              v-model="selectedStatus"
              :items="statuses"
              item-value="id"
              item-text="name"
              label="حالة الاعتماد"
              dense
              outlined
            ></v-select>
          </v-col>
          <v-col cols="4">
            <v-btn icon class="float-left">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  class="float-left"
                  v-bind="attrs"
                  v-on="on"
                  @click="createNew"
                >
                  <v-icon>
                    mdi-plus
                  </v-icon>
                </v-btn>
              </template>
              <span>دليل جديد</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  class="float-left"
                  v-bind="attrs"
                  v-on="on"
                  @click="duplicate"
                >
                  <v-icon>
                    mdi-content-duplicate
                  </v-icon>
                </v-btn>
              </template>
              <span>نسخة جديدة </span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon class="float-left" v-bind="attrs" v-on="on">
                  <v-icon @click="loadData">mdi-magnify</v-icon>
                </v-btn>
              </template>
              <span>بحث </span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-actions>
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
            <v-row v-if="!hasAccess">
              <v-col cols="12">
                <v-alert type="error" dense>
                  لاتملك الأحقية الكافية لرؤية البيانات
                </v-alert>
              </v-col>
            </v-row>
            <v-row v-else>
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
          <template v-slot:item.departmentNo="{ item }">
            {{ item.departmentNo | twoDigit | documentNo }}
          </template>
          <template v-slot:item.status="{ item }">
            {{
              statuses.filter(st => {
                return st.id === item.status
              })[0].name
            }}
          </template>

          <template v-slot:item.type="{ item }">
            {{
              types.filter(tp => {
                return tp.id === item.type
              })[0].name
            }}
          </template>

          <template v-slot:item.action="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-if="
                    (item.status === 0 &&
                      (item.type === 1 || item.type === 5)) ||
                      hasFullDepartment
                  "
                  color="green darken-1"
                  icon
                  v-bind="attrs"
                  v-on="on"
                  :to="{
                    name: 'WorkGuideEditor',
                    params: {
                      objectId: item.encId
                    }
                  }"
                >
                  <v-icon>
                    mdi-notebook-edit-outline
                  </v-icon>
                </v-btn>
              </template>
              <span>
                تحرير
              </span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  icon
                  v-bind="attrs"
                  v-on="on"
                  :to="{
                    name: 'WorkGuideAdminView',
                    params: {
                      encId: item.encId,
                      viewType: '1'
                    }
                  }"
                >
                  <v-icon>
                    mdi-notebook
                  </v-icon>
                </v-btn>
              </template>
              <span>
                عرض ومتابعة
              </span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="accent"
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click="showTransactionDialog(item.encId)"
                >
                  <v-icon>
                    mdi-format-list-bulleted
                  </v-icon>
                </v-btn>
              </template>
              <span>
                عرض الأحداث
              </span>
            </v-tooltip>
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
    <WorkGuideTransactionDialog
      v-model="transactionDialog"
      :work-guide-id="selectWorkGuideId"
    ></WorkGuideTransactionDialog>
  </div>
</template>

<script>
import _ from 'lodash'
import DataTableRequest from '@/model/request/DataTableRequest'
import DataTableResponse from '@/model/response/DataTableResponse'
import { mapState } from 'vuex'
import DepartmentService from '@/service/department/DepartmentService'
import WorkGuideService from '@/service/workGuide/WorkGuideService'
import WorkGuideTransactionDialog from '@/components/transaction/WorkGuideTransactionDialog'
export default {
  components: { WorkGuideTransactionDialog },
  created() {
    this.dataTableRequest.data.textSearch = ''
  },
  computed: {
    hasFullDepartment: function() {
      let ha = false
      try {
        this.employee.roles.forEach(item => {
          if (
            item === 'ROLE_QUALITY' ||
            item === 'ROLE_QUALITY_USER' ||
            item === 'ROLE_ADMIN' ||
            item === 'ROLE_MANAGER'
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
          if (
            this.employee.isManager ||
            item === 'ROLE_SECTION_ENTRY' ||
            item === 'ROLE_SECTION_MANAGER' ||
            this.hasFullDepartment
          ) {
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
  },
  methods: {
    showTransactionDialog(encId) {
      console.log(this.transactionDialog)
      if (encId && encId !== '-1') {
        this.selectWorkGuideId = encId
        this.transactionDialog = true
      }
    },
    clearDepartment() {
      this.department = { id: -1, name: '', encId: '-1' }
    },
    createNew() {
      let departmentId = this.hasFullDepartment
        ? this.department.encId
        : this.employee.departmentEncId
      if (departmentId !== '-1') {
        this.$confirm('هل تود انشاء إجراء جديد').then(res => {
          if (res) {
            WorkGuideService.canCreateNew(departmentId)
              .then(response => {
                if (response.data.result === 'success') {
                  this.$confirm('تم إنشاء إجراء جديد, هل تود التحرير').then(
                    res => {
                      if (res) {
                        this.$router.push({
                          name: 'WorkGuideEditor',
                          params: {
                            objectId: response.data.object.encId
                          }
                        })
                      }
                    }
                  )
                } else {
                  this.$toast.error(
                    'لايمكن انشاء اجراء جديدة الرجاء التأكد من وجود نسخة حية وعدم وجود نسخة جديدة'
                  )
                }
              })
              .catch(error => {})
          }
        })
      } else {
        this.$toast.error('الرجاء تحديد الوحدة الإدارية')
      }
    },
    duplicate() {
      let departmentId = this.hasFullDepartment
        ? this.department.encId
        : this.employee.departmentEncId
      if (departmentId !== '-1') {
        this.$confirm('هل تود انشاء نسخة جديدة').then(res => {
          if (res) {
            WorkGuideService.canDuplicate(departmentId)
              .then(response => {
                if (response.data.result === 'success') {
                  this.$confirm('تم إنشاء نسخة جديدة, هل تود تحريرها').then(
                    res => {
                      if (res) {
                        this.$router.push({
                          name: 'WorkGuideAdminEdit',
                          params: {
                            departmentEncId:
                              response.data.object.encDepartmentId,
                            editType: response.data.object.type.toString()
                          }
                        })
                      }
                    }
                  )
                } else {
                  this.$toast.error(
                    'لايمكن انشاء نسخة جديدة الرجاء التأكد من وجود نسخة حية وعدم وجود نسخة جديدة'
                  )
                }
              })
              .catch(error => {})
          }
        })
      } else {
        this.$toast.error('الرجاء تحديد الوحدة الإدارية')
      }
    },
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
        departmentId: this.hasFullDepartment
          ? this.department.encId
          : this.employee.departmentEncId,
        typeId: this.selectedType,
        statusId: this.selectedStatus
      }

      WorkGuideService.search(this.dataTableRequest)
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
      transactionDialog: false,
      selectWorkGuideId: '',
      loadTree: false,
      selectedType: -1,
      selectedStatus: -1,
      departmentId: -1,
      department: { id: -1, name: '', encId: '-1' },
      root: [],
      types: [
        { id: -1, name: 'الجميع' },
        { id: 1, name: 'جديد' },
        { id: 5, name: 'نسخة جديدة' },
        { id: 10, name: 'نسخة البيئة الحية' },
        { id: 20, name: 'نسخة قديمة' }
      ],
      statuses: [
        { id: -1, name: 'الجميع' },
        { id: 0, name: 'مسودة' },
        { id: 10, name: 'مرسلة' },
        { id: 15, name: 'إرجاع رئيس قسم' },
        { id: 20, name: 'اعتماد رئيس قسم' },
        { id: 25, name: 'ارجاع الجودة' },
        { id: 30, name: 'اعتماد الجودة' },
        { id: 40, name: 'اعتماد نهائي' }
      ],
      currentSelectedDepartment: {},
      selectedDepartment: [],
      depMenu: false,
      saving: false,
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
          text: 'الوحدة الادارية',
          value: 'departmentName',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '30%'
        },
        {
          text: 'رقم الوثيقة',
          value: 'departmentNo',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '15%'
        },
        {
          text: 'نوع الوثيقة',
          value: 'type',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '10%'
        },
        {
          text: 'النسخة',
          value: 'version',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '10%'
        },
        {
          text: 'حالة الاعتماد',
          value: 'status',
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

<style lang="scss" scoped></style>
