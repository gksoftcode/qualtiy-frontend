<template>
  <div>
    <template v-for="file in files">
      <v-row dense :key="file.uuid">
        <v-col cols="6">
          <span class="procedure-title me-2" v-text="file.name"></span>
          <a :href="attachmentPath + file.uuid">
            <v-icon color="accent">mdi-cloud-download-outline </v-icon>
          </a>
        </v-col>
        <v-col :cols="canEdit ? 2 : 3">
          <span v-text="documentNumber + '/' + file.orderNo"></span>
        </v-col>
        <v-col cols="2">
          <span v-text="file.issueDate"></span>
        </v-col>
        <v-col :cols="1">
          <span v-text="file.version"></span>
        </v-col>
        <v-col cols="1" v-if="canEdit">
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                color="green lighten-1"
                @click="showEditFileDialog(file)"
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-square-edit-outline</v-icon>
              </v-btn>
            </template>
            <span>تحرير</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                color="red darken-2"
                @click="deleteAttachment(file)"
                v-bind="attrs"
                v-on="on"
              >
                <v-icon> mdi-trash-can-outline</v-icon>
              </v-btn>
            </template>
            <span>حذف</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </template>
    <v-dialog v-model="fileEditDlg" width="60%">
      <v-card>
        <v-card-title>
          تحرير وثيقة
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="4">
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
            <v-col cols="3">
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
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="primary"
            :disabled="saving"
            :loading="saving"
            @click="updateFile"
          >
            حفظ
            <v-icon>
              mdi-content-save
            </v-icon>
          </v-btn>
          <v-btn color="red darken-2" @click="fileEditDlg = false">
            إلغاء
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

>

<script>
import AttachmentService from '@/service/attachment/AttachmentService'
import { Paths } from '@/Paths'

export default {
  name: 'FileList',
  props: {
    department: {
      type: Object,
      default: function() {
        return null
      }
    },
    canEdit: {
      type: Boolean,
      default: true
    }
  },
  mounted() {
    this.loadFileList()
    console.log('can Edit = ' + this.canEdit)
  },
  computed: {
    attachmentPath: function() {
      return Paths.BASE_URL + Paths.FILE_UPLOAD_PATH + '/getPdfAttachment/'
    },
    documentNumber: function() {
      if (this.department && this.department.departmentNo) {
        return (
          'AHM-OP-' +
          this.$options.filters.twoDigit(this.department.departmentNo)
        )
      } else {
        return ''
      }
    }
  },
  data() {
    return {
      selectedFile: {},
      fileEditDlg: false,
      files: [],
      fileIssueDateMenu: false,
      saving: false
    }
  },
  watch: {
    department: function(newVal, oldVal) {
      if (this.department && this.department.encId) {
        this.loadFileList()
      }
    }
  },
  methods: {
    showEditFileDialog(file) {
      this.selectedFile = Object.assign({}, file)
      this.fileEditDlg = true
    },
    updateFile() {
      this.saving = true
      AttachmentService.update(this.selectedFile)
        .then(response => {
          let idx = this.files.findIndex(
            item => this.selectedFile.id === item.id
          )
          if (idx >= 0) {
            this.files[idx] = Object.assign({}, this.selectedFile)
          }
          this.fileEditDlg = false
          this.saving = false
          this.$emit('updateList')
        })
        .catch(error => {
          this.saving = false
        })
    },
    loadFileList() {
      if (this.department && this.department.encId) {
        AttachmentService.listApproved(this.department.encId)
          .then(response => {
            this.files = response.data
          })
          .catch(error => {})
      }
    },
    deleteAttachment(file) {
      this.$confirm(
        'هل تود فعلا حذف هذه الوثيقة <span class="attachment-name">' +
          file.name +
          '</span> ؟'
      ).then(res => {
        if (res) {
          AttachmentService.delete(file)
            .then(response => {
              if (response.data.success) {
                this.$toast.success('تم حذف الوثيقة بنجاح')
                this.$emit('updateList')
                let idx = this.files.findIndex(
                  item => response.data.id === item.id
                )
                if (idx >= 0) {
                  this.files.splice(idx, 1)
                }
              } else {
                this.$toast.error(
                  'لايمكن الحذف لوجود ارتباط مع ' +
                    response.data.count +
                    ' خطوة'
                )
              }
            })
            .catch(error => {})
        }
      })
    }
  }
}
</script>
<style type="scss">
.attachment-name {
  font-weight: bold;
  color: var(--v-primary-base);
}
</style>
