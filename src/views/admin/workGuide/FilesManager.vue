<template>
  <div>
    <v-card elevation="2" class="custom-heading">
      <v-card-title>
        <v-toolbar-items>
          <v-icon>
            mdi-file-document-multiple mdi-flip-h mdi-24px
          </v-icon>
          <v-toolbar-title>إدارة السجلات</v-toolbar-title>
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
              v-model="selectedStatus"
              :items="statuses"
              item-value="id"
              item-text="name"
              label="حالة السجل"
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
              <span>سجل جديد</span>
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
          <template v-slot:item.name="{ item }">
            {{ item.name }}
            <v-btn
              v-if="item.status >= 20"
              icon
              color="green darken-1"
              :href="attachmentPdfPath + item.uuid"
            >
              <v-icon>mdi-cloud-download-outline </v-icon>
            </v-btn>
            <v-btn
              v-else
              icon
              color="accent"
              :href="attachmentPath + item.uuid"
            >
              <v-icon>mdi-cloud-download-outline </v-icon>
            </v-btn>
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

          <template v-slot:item.action="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-if="
                    item.status === 0 && (item.type === 1 || item.type === 5)
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
                    mdi-file-eye
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
                  v-if="hasQuality"
                  color="green"
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click="editFile(item)"
                >
                  <v-icon>
                    mdi-file-document-edit
                  </v-icon>
                </v-btn>
              </template>
              <span>
                تحرير ومتابعة
              </span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-if="item.status === 20"
                  color="orange darken-1"
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click="showTransDialog(item)"
                >
                  <v-icon>
                    mdi-file-swap
                  </v-icon>
                </v-btn>
              </template>
              <span>
                استبدال
              </span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-show="item.status <= 10"
                  color="red darken-1"
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click="deleteFile(item)"
                >
                  <v-icon>
                    mdi-trash-can
                  </v-icon>
                </v-btn>
              </template>
              <span>
                حذف
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
        <error401 v-if="!hasAccess"></error401>
      </v-card-text>
      <v-card-actions> </v-card-actions>
    </v-card>
    <v-dialog v-model="createDlg" width="80%">
      <v-card>
        <v-card-title>
          إنشاء وثيقة جديدة
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="3">
              <v-text-field
                dense
                outlined
                label="اسم الوثيقة"
                v-model="selectedFile.name"
              ></v-text-field>
            </v-col>
            <v-col cols="2">
              <v-text-field
                type="number"
                dense
                outlined
                label="رقم الوثيقة"
                v-model="selectedFile.orderNo"
              ></v-text-field>
            </v-col>
            <v-col cols="2">
              <v-text-field
                type="number"
                dense
                outlined
                label="نسخة الوثيقة"
                v-model="selectedFile.version"
                :multiple="false"
                truncate-length="15"
              ></v-text-field>
            </v-col>
            <v-col cols="2">
              <v-menu
                ref="issueDateMenu"
                v-model="fileIssueDateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    outlined
                    v-model="selectedFile.issueDate"
                    label="تاريخ الاصدار"
                    prepend-inner-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                    dense
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="selectedFile.issueDate"
                  scrollable
                  @input="fileIssueDateMenu = false"
                >
                </v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="2">
              <v-file-input
                dense
                outlined
                v-model="fileData"
                :multiple="false"
                truncate-length="15"
              ></v-file-input>
            </v-col>
            <v-col cols="1">
              <v-btn icon color="primary" @click="addFile">
                <v-icon> mdi-cloud-upload</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions> </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="editDlg" width="80%" persistent>
      <v-card>
        <v-card-title>
          تحرير وثيقة
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="3">
              <v-text-field
                dense
                outlined
                label="اسم الوثيقة"
                v-model="selectedFile.name"
                :readonly="selectedFile.status >= 10"
              ></v-text-field>
            </v-col>
            <v-col cols="2">
              <v-text-field
                type="number"
                dense
                outlined
                label="رقم الوثيقة"
                v-model="selectedFile.orderNo"
                :readonly="selectedFile.status >= 10"
              ></v-text-field>
            </v-col>
            <v-col cols="2">
              <v-text-field
                type="number"
                dense
                outlined
                label="نسخة الوثيقة"
                v-model="selectedFile.version"
                :multiple="false"
                truncate-length="15"
                :readonly="selectedFile.status >= 10"
              ></v-text-field>
            </v-col>
            <v-col cols="2">
              <v-menu
                ref="issueDateMenu"
                v-model="fileIssueDateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    outlined
                    v-model="selectedFile.issueDate"
                    label="تاريخ الاصدار"
                    prepend-inner-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                    dense
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="selectedFile.issueDate"
                  scrollable
                  :readonly="selectedFile.status >= 10"
                  @input="fileIssueDateMenu = false"
                >
                </v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="1">
              <v-btn
                icon
                color="primary"
                :href="attachmentPath + selectedFile.uuid"
              >
                <v-icon color="accent">mdi-cloud-download-outline </v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row dense v-show="selectedFile.status < 10">
            <v-col cols="4">
              <v-file-input
                v-show="selectedFile.status < 10 && hasQuality"
                dense
                outlined
                v-model="tempFileData"
                :multiple="false"
                truncate-length="15"
                label="ملف المسودة"
              ></v-file-input>
            </v-col>
            <v-col cols="2">
              <v-btn
                v-show="selectedFile.tempFileSize > 0 && hasQuality"
                color="primary"
                :href="attachmentTempPath + selectedFile.uuid"
                >ملف مؤقت
                <v-icon>mdi-cloud-download-outline </v-icon>
              </v-btn>
            </v-col>
            <v-col cols="4">
              <v-file-input
                v-show="selectedFile.status < 10 && hasQuality"
                dense
                outlined
                v-model="pdfFileData"
                :multiple="false"
                truncate-length="15"
                label="ملف PDF"
              ></v-file-input>
            </v-col>
            <v-col cols="2">
              <v-btn
                v-show="selectedFile.pdfFileSize > 0 && hasQuality"
                color="primary"
                :href="attachmentPdfPath + selectedFile.uuid"
                >PDF
                <v-icon>mdi-cloud-download-outline </v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row dense v-show="selectedFile.status >= 10">
            <v-col cols="1"></v-col>
            <v-col
              cols="2"
              v-show="selectedFile.tempFileSize > 0 && hasQuality"
            >
              ملف مؤقت
              <v-btn
                icon
                color="primary"
                :href="attachmentTempPath + selectedFile.uuid"
              >
                <v-icon color="accent">mdi-cloud-download-outline</v-icon>
              </v-btn>
            </v-col>
            <v-col
              cols="2"
              v-show="
                selectedFile.pdfFileSize > 0 &&
                  (hasQuality || selectedFile.status === 20)
              "
            >
              PDF
              <v-btn
                icon
                color="primary"
                :href="attachmentPdfPath + selectedFile.uuid"
              >
                <v-icon color="accent">mdi-cloud-download-outline</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12">
              <v-alert v-show="usedCount > 0" dense type="info">
                عدد مرات استخدام هذه الوثيقة بإجراءات
                {{ usedCount }}
              </v-alert>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-overlay v-model="saving">
            <v-progress-circular indeterminate size="32"></v-progress-circular>
          </v-overlay>
          <v-btn
            color="primary"
            v-show="
              selectedFile.status === 0 ||
                selectedFile.status === 5 ||
                selectedFile.status === 6
            "
            @click="saveEdit(0)"
          >
            حفظ
            <v-icon>mdi-content-save</v-icon>
          </v-btn>
          <v-btn
            color="primary"
            v-show="
              selectedFile.status === 0 ||
                selectedFile.status === 5 ||
                selectedFile.status === 6
            "
            @click="saveEdit(1)"
          >
            حفظ وإرسال
            <v-icon>mdi-content-save-move</v-icon>
          </v-btn>
          <v-btn
            dark
            v-show="selectedFile.status === 10"
            color="green darken-1"
            @click="updateStatus(20)"
          >
            اعتماد
            <v-icon>mdi-check-bold</v-icon>
          </v-btn>
          <v-btn
            dark
            v-show="selectedFile.status === 10"
            color="orange darken-1"
            @click="updateStatus(6)"
          >
            ارجاع
            <v-icon>mdi-replay</v-icon>
          </v-btn>
          <v-btn
            dark
            v-show="selectedFile.status === 20"
            color="orange darken-1"
            @click="updateStatus(30)"
          >
            تحويل إلى نسخة قديمة
            <v-icon>mdi-backup-restore</v-icon>
          </v-btn>
          <v-btn
            dark
            v-show="selectedFile.status === 20"
            color="red darken-1"
            @click="updateStatus(50)"
          >
            إلغاء الوثيقة
            <v-icon>mdi-stop-circle-outline</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            dark
            class="float-right"
            color="red darken-1"
            @click="editDlg = false"
          >
            إغلاق
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="transDlg" width="50%">
      <v-card>
        <v-card-title>
          استبدال سجل
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="6">
              <v-text-field
                dense
                outlined
                readonly
                :value="selectedFile.name"
                label="السجل الحالي"
              ></v-text-field>
            </v-col>
            <v-col cols="2">
              <v-text-field
                dense
                outlined
                readonly
                :value="selectedFile.version"
                label="النسخة"
              ></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field
                dense
                outlined
                readonly
                :value="selectedFile.issueDate"
                label="تاريخ الاصدار"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12">
              <v-data-table
                :loading="loadingOld"
                :headers="oldHeader"
                :items="approvedList"
                show-select
                single-select
                dense
                disable-pagination
                v-model="selectedOld"
              ></v-data-table>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn
            dark
            color="green darken-1"
            :disabled="selectedOld.length === 0"
            @click="replaceOld"
          >
            استبدال
            <v-icon>mdi-file-swap</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            dark
            class="float-right"
            color="red darken-1"
            @click="transDlg = false"
          >
            إغلاق
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <attachment-transaction-dialog
      :parent-id="selectAttachmentId"
      v-model="transactionDialog"
    ></attachment-transaction-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
import DataTableRequest from '@/model/request/DataTableRequest'
import DataTableResponse from '@/model/response/DataTableResponse'
import { mapState } from 'vuex'
import DepartmentService from '@/service/department/DepartmentService'
import AttachmentService from '@/service/attachment/AttachmentService'
import { Paths } from '@/Paths'
import AttachmentTransactionDialog from '@/components/transaction/AttachmentTransactionDialog'
import Error401 from '@/components/Error401'
export default {
  components: { Error401, AttachmentTransactionDialog },
  created() {
    this.dataTableRequest.data.textSearch = ''
    document.title = this.$route.meta.title
  },
  computed: {
    attachmentPath: function() {
      return Paths.BASE_URL + Paths.FILE_UPLOAD_PATH + '/getAttachment/'
    },
    attachmentTempPath: function() {
      return Paths.BASE_URL + Paths.FILE_UPLOAD_PATH + '/getTempAttachment/'
    },
    attachmentPdfPath: function() {
      return Paths.BASE_URL + Paths.FILE_UPLOAD_PATH + '/getPdfAttachment/'
    },
    hasQuality: function() {
      let ha = false
      try {
        this.employee.roles.forEach(item => {
          if (
            item === 'ROLE_QUALITY' ||
            item === 'ROLE_QUALITY_USER' ||
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
    hasQualityManager: function() {
      let ha = false
      try {
        this.employee.roles.forEach(item => {
          if (item === 'ROLE_QUALITY' || item === 'ROLE_MANAGER') {
            ha = true
          }
        })
      } catch (e) {
        return false
      }
      return ha
    },
    hasFullDepartment: function() {
      let ha = false
      try {
        this.employee.roles.forEach(item => {
          if (this.hasQuality || item === 'ROLE_ADMIN') {
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
    replaceOld() {
      if (this.selectedOld[0]) {
        this.$confirm(
          'هل تود استبدال النسخة  <span class="primary-text">' +
            this.selectedOld[0].version +
            ' </span> بالنسخة <span class="primary-text">' +
            this.selectedFile.version +
            ' </span>'
        ).then(res => {
          if (res) {
            AttachmentService.replaceAttachment(
              this.selectedFile.encId,
              this.selectedOld[0].encId
            )
              .then(res => {
                this.$toast.success('تم التعديل بنجاح')
              })
              .catch(error => {
                console.log(error.response)
                this.$toast.error(
                  'خطأ في عملية الاستبدال رقم الخطأ ' + error.response.data.id
                )
              })
          }
        })
      }
    },
    showTransDialog(file) {
      this.loadingOld = true
      this.selectedFile = Object.assign({}, file)
      this.transDlg = true
      AttachmentService.listApprovedByDepartment(this.selectedFile.departmentId)
        .then(res => {
          this.approvedList = res.data
          this.approvedList = this.approvedList.filter(item => {
            return item.id !== this.selectedFile.id
          })
          this.loadingOld = false
        })
        .catch(error => {
          this.loadingOld = false
        })
    },
    showTransactionDialog(encId) {
      if (encId && encId !== '-1') {
        this.selectAttachmentId = encId
        this.transactionDialog = true
      }
    },
    editFile(file) {
      this.listApproved = []
      this.usedCount = 0
      this.selectedFile = Object.assign({}, file)
      this.pdfFileData = null
      this.tempFileData = null
      this.editDlg = true
      AttachmentService.getUsedCount(this.selectedFile).then(response => {
        if (this.selectedFile.encId === response.data.encId) {
          this.usedCount = response.data.count
        }
      })
    },
    clearDepartment() {
      this.department = { id: -1, name: '', encId: '-1' }
    },
    updateStatus(nextStatus) {
      this.saving = true
      AttachmentService.updateStatus(this.selectedFile.encId, nextStatus)
        .then(response => {
          this.editDlg = false
          this.saving = false
          this.updateRow(response.data)
        })
        .catch(error => {
          this.editDlg = false
          this.saving = false
        })
    },
    deleteFile(file) {
      this.$confirm(
        'هل تود حذف السجل <span class="confirm-var"> ' + file.name + '</span> ?'
      ).then(res => {
        if (res) {
          AttachmentService.deleteFile(file)
            .then(response => {
              if (response.data.success) {
                let idx = _.findIndex(this.tableResponse.data, function(o) {
                  return response.data.object.id === o.id
                })
                this.tableResponse.data.splice(idx, 1)
                this.$toast.success(this.messages[response.data.message])
              } else {
                this.$toast.error(this.messages[response.data.message])
              }
            })
            .catch(error => {
              this.$toast.error('حدث خطأ في عملية الحذف')
            })
        }
      })
    },
    saveEdit(updateState) {
      this.saving = true
      AttachmentService.edit(
        this.selectedFile,
        this.tempFileData,
        this.pdfFileData,
        updateState
      )
        .then(response => {
          this.editDlg = false
          this.saving = false
          if (this.selectedFile.id !== -1) {
            this.updateRow(response.data)
          }
        })
        .catch(error => {
          this.editDlg = false
          this.saving = false
        })
    },
    updateRow(object) {
      let idx = _.findIndex(this.tableResponse.data, function(o) {
        return object.id === o.id
      })
      this.tableResponse.data.splice(idx, 1, object)
    },
    addFile() {
      let departmentId = this.hasFullDepartment
        ? this.department.encId
        : this.employee.departmentEncId
      if (departmentId !== '-1') {
        this.selectedFile.departmentId = departmentId
        AttachmentService.save2(this.selectedFile, this.fileData)
          .then(response => {
            this.$toast.success('تم الحفظ السجل بنجاح')
            this.createDlg = false
            this.loadTree
          })
          .catch(error => {
            this.$toast.error('هناك خطأ في حفظ السجل')
          })
      }
    },
    createNew() {
      let departmentId = this.hasFullDepartment
        ? this.department.encId
        : this.employee.departmentEncId
      if (departmentId !== '-1') {
        this.$confirm('هل تود انشاء سجل جديد').then(res => {
          if (res) {
            this.selectedFile = Object.assign({}, this.emptyFile)
            this.createDlg = true
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

      AttachmentService.search2(this.dataTableRequest)
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
      loadingOld: false,
      transDlg: false,
      selectedOld: [],
      approvedList: [],
      transactionDialog: false,
      selectAttachmentId: '',
      usedCount: 0,
      editDlg: false,
      fileIssueDateMenu: false,
      createDlg: false,
      fileData: {},
      tempFileData: {},
      pdfFileData: {},
      selectedFile: {},
      emptyFile: {
        departmentId: -1,
        fileName: '',
        id: -1,
        issueDate: '',
        name: '',
        orderNo: 0,
        status: 0,
        version: 1
      },
      loadTree: false,
      selectedType: -1,
      selectedStatus: -1,
      departmentId: -1,
      department: { id: -1, name: '', encId: '-1' },
      root: [],
      statuses: [
        { id: -1, name: 'الجميع' },
        { id: 0, name: 'جديد' },
        { id: 5, name: 'قيد التحرير' },
        { id: 6, name: 'إرجاع' },
        { id: 10, name: 'مرسلة' },
        { id: 20, name: 'معتمدة' },
        { id: 30, name: 'نسخة قديمة' },
        { id: 50, name: 'ملغي' }
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
          text: 'اسم الوثيقة',
          value: 'name',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '20%'
        },
        {
          text: 'اسم الادارة',
          value: 'departmentName',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '20%'
        },
        {
          text: 'رقم الوثيقة',
          value: 'orderNo',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '15%'
        },
        {
          text: 'تاريخ الاصدار',
          value: 'issueDate',
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
          width: '5%'
        },
        {
          text: 'حالة الاعتماد',
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
      ],
      oldHeader: [
        {
          text: 'اسم الوثيقة',
          value: 'name',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '60%'
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
          text: 'تاريخ الاصدار',
          value: 'issueDate',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '30%'
        }
      ],
      messages: ['', 'تم الحذف بنجاح', 'لم يتم الحذف هذه الوثيقة مرتبطة باجراء']
    }
  }
}
</script>

<style lang="scss" scoped>
.select-issueDate {
  float: left;
  color: var(--v-primary-base);
}
</style>
