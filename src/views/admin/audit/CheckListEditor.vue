<template>
  <div>
    <v-card elevation="3" :loading="loadingAuditPlan">
      <v-card-text>
        <v-row dense v-if="selectedAuditPlan.id > 0">
          <v-col cols="4">
            <span
              class="text-h6 primary--text"
              v-text="selectedAuditPlan.department.name"
            ></span>
            <span
              class="ms-2 text-subtitle-2 accent--text"
              v-text="status[selectedAuditPlan.status]"
            >
            </span>
          </v-col>
          <v-col cols="2">
            <span class="text-h6" v-text="selectedAuditPlan.fromDate"></span>
          </v-col>
          <v-col cols="1" class="text-h6">
            حتى
          </v-col>
          <v-col cols="2">
            <span class="text-h6" v-text="selectedAuditPlan.toDate"></span>
          </v-col>
          <v-col cols="3">
            <v-btn icon :to="{ name: 'AuditPlan' }" class="float-left">
              <v-icon>mdi-home</v-icon>
            </v-btn>
            <v-btn
              icon
              @click="listTransaction"
              v-if="canView || hasApproval"
              class="float-left"
            >
              <v-icon>mdi-menu</v-icon>
            </v-btn>
            <v-btn
              text
              color="green"
              v-if="
                hasApproval &&
                  (selectedAuditPlan.status === 1 ||
                    selectedAuditPlan.status === 0)
              "
              class="float-left"
              @click="updateStatus(10)"
            >
              اعتماد
            </v-btn>
            <v-btn
              text
              color="green"
              v-if="
                hasApproval &&
                  (selectedAuditPlan.status === 10 ||
                    selectedAuditPlan.status === 11)
              "
              class="float-left"
              @click="updateStatus(20)"
            >
              اعتماد نهائي
            </v-btn>
            <v-btn
              text
              color="red"
              v-if="hasApproval && selectedAuditPlan.status === 10"
              @click="showRejectedDlg(11)"
              class="float-left"
            >
              رفض النتائج
            </v-btn>
            <v-btn
              text
              color="red"
              v-if="hasApproval && selectedAuditPlan.status === 0"
              @click="showRejectedDlg(1)"
              class="float-left"
            >
              ارجاع
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <template v-for="(item, index) in items">
      <v-hover :key="item.id">
        <template v-slot:default="{ hover }">
          <v-card :elevation="hover ? 3 : 1" class="mt-3">
            <v-card-text>
              <v-row dense>
                <v-col cols="12">
                  <p>
                    <span class="wise-c-Title" v-text="index + 1 + ' - '">
                    </span>
                    <span v-text="item.content"> </span>
                  </p>
                </v-col>
              </v-row>
              <v-row dense v-show="itemToEdit.id === item.id">
                <v-col cols="12">
                  <v-textarea
                    rows="2"
                    outlined
                    dense
                    label="نص السؤال"
                    v-model="itemToEdit.content"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions
              v-if="(canView || hasApproval) && selectedAuditPlan.status < 10"
            >
              <v-row dense>
                <v-col cols="12">
                  <v-btn
                    text
                    color="primary"
                    v-show="itemToEdit.id === item.id"
                    @click="saveEditItem(item)"
                    :disabled="itemSaving"
                    :loading="itemSaving"
                  >
                    حفظ
                    <v-icon>
                      mdi-content-save
                    </v-icon>
                  </v-btn>
                  <v-btn
                    text
                    class="mr-2"
                    dark
                    color="red lighten-1"
                    v-show="itemToEdit.id === item.id"
                    @click="cancelEditItem"
                    :disabled="itemSaving"
                  >
                    إلغاء
                    <v-icon>
                      mdi-close
                    </v-icon>
                  </v-btn>
                  <v-btn
                    text
                    class="mr-2"
                    color="green lighten-1"
                    v-show="itemToEdit.id !== item.id"
                    dark
                    @click="editItem(item)"
                  >
                    تحرير
                    <v-icon>
                      mdi-playlist-edit
                    </v-icon>
                  </v-btn>
                  <v-btn
                    text
                    class="mr-2"
                    v-show="itemToEdit.id !== item.id"
                    color="red lighten-1"
                    dark
                    @click="deleteItem(item)"
                  >
                    حذف
                    <v-icon>
                      mdi-trash-can
                    </v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-actions>
            <v-card-actions
              v-if="
                (canView || hasApproval) &&
                  (selectedAuditPlan.status === 10 ||
                    selectedAuditPlan.status === 11)
              "
            >
              <v-row dense>
                <v-col cols="2">
                  <v-select
                    outlined
                    dense
                    label="حالة الاجراء"
                    :items="auditResult"
                    item-text="name"
                    item-value="id"
                    v-model="item.auditResult"
                  >
                  </v-select>
                </v-col>
                <v-col cols="3">
                  <v-select
                    outlined
                    dense
                    label="الموظف"
                    :items="employeeList"
                    item-text="fullName"
                    item-value="id"
                    v-model="item.employeeId"
                  >
                  </v-select>
                </v-col>
                <v-col cols="7">
                  <v-textarea
                    rows="1"
                    v-model="item.remarks"
                    dense
                    outlined
                    label="الملاحظات"
                  ></v-textarea>
                </v-col>
                <v-col cols="2">
                  <v-btn
                    text
                    color="primary"
                    @click="updateResultItem(item)"
                    :disabled="itemSaving"
                    :loading="itemSaving"
                  >
                    حفظ
                    <v-icon>
                      mdi-content-save
                    </v-icon>
                  </v-btn>
                </v-col>
                <v-col cols="2" v-show="item.auditResult > 1">
                  <v-btn
                    text
                    color="orange darken-1"
                    @click="updateResultItem(item)"
                    :disabled="itemSaving"
                    :loading="itemSaving"
                  >
                    اجراء تصحيح
                    <v-icon>
                      mdi-content-save
                    </v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-actions>
          </v-card>
        </template>
      </v-hover>
    </template>
    <v-card
      class="mt-6"
      v-if="(canView || hasApproval) && selectedAuditPlan.status < 10"
    >
      <v-card-text>
        <v-row dense>
          <v-col cols="12">
            <v-textarea
              rows="2"
              label="نص السؤال"
              dense
              outlined
              v-model="selectedItem.content"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-row dense>
          <v-col cols="12">
            <v-btn
              color="primary"
              :disabled="saving"
              :loading="saving"
              @click="save"
            >
              حفظ
              <v-icon>
                mdi-content-save
              </v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
    <v-dialog v-model="rejectDlg" width="50%">
      <v-card>
        <v-card-title>
          إرجاع
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="12"></v-col>
            <v-col cols="12">
              <v-textarea
                v-model="remarks"
                rows="4"
                outlined
                dense
                label="الملاحظات"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="rejected">
            متابعة
            <v-icon> </v-icon>
          </v-btn>
          <v-btn dark color="red" @click="rejectDlg = false">
            إغلاق
            <v-icon> </v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="trnsactionDlg" width="70%">
      <v-card>
        <v-card-title>
          الاجراءات
        </v-card-title>
        <v-card-text>
          <v-data-table
            :items="transList"
            item-key="createdAt"
            disable-pagination
            hide-default-footer
            :headers="transactionHeader"
          >
            <template v-slot:item.sn="{ item }">
              {{ transList.indexOf(item) + 1 }}
            </template>
            <template v-slot:item.actionType="{ item }">
              {{ status[item.actionType] }}
            </template>
            <template v-slot:item.createdAt="{ item }">
              {{ item.createdAt | formatDate }}
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import AuditPlanService from '@/service/audit/AuditPlanService'
import _ from 'lodash'
import { mapState } from 'vuex'
import EmployeeService from '@/service/employee/EmployeeService'
export default {
  props: {
    auditPlanEncId: {
      type: String,
      default: ''
    }
  },
  mounted() {
    AuditPlanService.listCheckListItem(this.auditPlanEncId)
      .then(response => {
        this.items = response.data
      })
      .catch(error => {})
  },
  created() {
    this.status[0] = 'جديد'
    this.status[1] = 'إرجاع'
    this.status[10] = 'معتمد'
    this.status[11] = 'ارجاع نتائج'
    this.status[20] = 'معتمد نهائي'
    this.loadingAuditPlan = true
    AuditPlanService.getOne(this.auditPlanEncId)
      .then(response => {
        this.selectedAuditPlan = response.data
        this.emptyItem.auditPlan = this.selectedAuditPlan
        this.emptyItem.auditPlanId = this.selectedAuditPlan.id
        this.loadEmployeeList()
        this.loadingAuditPlan = false
      })
      .catch(error => {
        this.loadingAuditPlan = false
      })
  },
  methods: {
    loadEmployeeList() {
      EmployeeService.listByDepartment(this.selectedAuditPlan.department.encId)
        .then(res => {
          this.employeeList = res.data
        })
        .catch(error => {})
    },
    save() {
      this.saving = true
      AuditPlanService.saveItem(this.selectedItem)
        .then(response => {
          this.$toast.success('تم الحفظ بنجاح')
          this.items.push(response.data)
          this.saving = false
          this.createItem()
        })
        .catch(error => {
          this.$toast.error('حدث خطأ اثناء عملية الحفظ')
          this.saving = false
        })
    },
    saveEditItem(item) {
      this.itemSaving = true
      AuditPlanService.saveItem(this.itemToEdit)
        .then(response => {
          this.$toast.success('تم الحفظ بنجاح')
          let idx = _.findIndex(this.items, function(o) {
            return response.data.encId === o.encId
          })
          this.items.splice(idx, 1, response.data)
          this.itemSaving = false
          this.cancelEditItem()
        })
        .catch(error => {
          this.$toast.error('حدث خطأ اثناء عملية الحفظ')
          this.itemSaving = false
        })
    },
    updateResultItem(item) {
      this.itemSaving = true
      AuditPlanService.updateResultItem(item)
        .then(response => {
          this.$toast.success('تم التقييم بنجاح')
          let idx = _.findIndex(this.items, function(o) {
            return response.data.encId === o.encId
          })
          this.items.splice(idx, 1, response.data)
          this.itemSaving = false
        })
        .catch(error => {
          this.$toast.error('حدث خطأ اثناء عملية التقييم')
          this.itemSaving = false
        })
    },
    deleteItem(item) {
      this.$confirm('هل أنت متأكد من حذف هذا السؤال ؟').then(res => {
        if (res) {
          AuditPlanService.deleteItem(item)
            .then(response => {
              let idx = _.findIndex(this.items, function(o) {
                return item.id === o.id
              })
              this.items.splice(idx, 1)
              this.$toast.success('تم الحذف بنجاح')
            })
            .catch(error => {
              this.$toast.error('حدث خطأ اثناء عملية الحذف')
            })
        }
      })
    },
    createItem() {
      this.selectedItem = Object.assign({}, this.emptyItem)
    },
    editItem(item) {
      this.itemToEdit = Object.assign({}, item)
    },
    cancelEditItem() {
      this.itemToEdit = {}
    },
    showRejectedDlg(newStatus) {
      this.rejectedType = newStatus
      this.remarks = ''
      this.rejectDlg = true
    },
    rejected() {
      this.updateStatus(this.rejectedType)
    },
    updateStatus(newStatus) {
      this.$confirm('هل تود تعديل حالة التدقيق').then(res => {
        if (res) {
          AuditPlanService.updateStatus(
            this.selectedAuditPlan.encId,
            newStatus,
            newStatus === 1 || newStatus === 11 ? this.remarks : ''
          )
            .then(response => {
              this.rejectDlg = false
              this.$toast.success('تم تعديل الحالة بنجاح')
              this.selectedAuditPlan = Object.assign({}, response.data.object)
            })
            .catch(error => {
              this.rejectDlg = false
              this.$toast.error('تم خطأ في تعديل الحالة')
            })
        }
      })
    },
    listTransaction() {
      AuditPlanService.listTransactionByAuditPlan(this.selectedAuditPlan.encId)
        .then(response => {
          this.transList = response.data
          this.trnsactionDlg = true
        })
        .catch(error => {})
    }
  },
  data() {
    return {
      employeeList: [],
      auditResult: [
        { id: 0, name: 'غير محدد' },
        { id: 1, name: 'مطابق' },
        { id: 2, name: 'غير مطابق' },
        { id: 3, name: 'غير موجود' }
      ],
      trnsactionDlg: false,
      transList: [],
      status: new Map(),
      rejectedType: 1,
      remarks: '',
      rejectDlg: false,
      saving: false,
      itemSaving: false,
      loadingAuditPlan: false,
      items: [],
      selectedAuditPlan: {},
      selectedItem: {},
      itemToEdit: {},
      emptyItem: {
        id: -1,
        content: '',
        auditPlanId: this.auditPlanId,
        auditPlan: {},
        auditResult: 0,
        remarks: '',
        encId: '-1'
      },
      transactionHeader: [
        {
          text: 'مسلسل',
          value: 'sn',
          align: 'center',
          sortable: false,
          width: '5%'
        },
        {
          text: 'الموظف',
          value: 'fullName',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '30%'
        },
        {
          text: 'التاريخ',
          value: 'createdAt',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '15%'
        },
        {
          text: 'نوع العملية',
          value: 'actionType',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '10%'
        },
        {
          text: 'الملاحظات',
          value: 'remarks',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '40%'
        }
      ]
    }
  },
  computed: {
    hasApproval: function() {
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
    canView: function() {
      let ha = false
      if (!this.selectedAuditPlan.auditors) {
        return false
      }
      this.selectedAuditPlan.auditors.forEach(emp => {
        if (emp.id === this.employee.id) {
          ha = true
        }
      })
      return ha
    },
    ...mapState('auth', ['employee'])
  }
}
</script>

<style scoped></style>
