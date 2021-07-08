<template>
  <v-card>
    <v-card-text v-show="!noData">
      <v-row v-show="loading" dense>
        <v-col cols="4">
          <v-skeleton-loader type="list-item"></v-skeleton-loader>
        </v-col>
        <v-col cols="3"
          ><v-skeleton-loader type="list-item"></v-skeleton-loader
        ></v-col>
        <v-col cols="3"
          ><v-skeleton-loader type="list-item"></v-skeleton-loader
        ></v-col>
        <v-col cols="1">
          <v-skeleton-loader type="list-item"></v-skeleton-loader>
        </v-col>
      </v-row>
      <v-row dense v-show="!loading">
        <v-col cols="4">
          <v-text-field
            readonly
            v-if="selected.department"
            :value="selected.department.name"
            label="الوحدة الادارية"
            dense
            outlined
          >
          </v-text-field>
        </v-col>
        <v-col cols="3">
          <v-text-field
            readonly
            v-model="selected.documentNo"
            label="رقم الوثيقة"
            dense
            outlined
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-text-field
            readonly
            outlined
            v-model="selected.issueDate"
            label="تاريخ الاصدار"
            prepend-inner-icon="mdi-calendar"
            dense
          ></v-text-field>
        </v-col>
        <v-col cols="1">
          <v-text-field
            readonly
            type="number"
            v-model="selected.version"
            label="النسخة"
            dense
            outlined
          ></v-text-field>
        </v-col>
         <v-col cols="1">
        <v-btn  color="info" @click="generatePdf">
          <v-icon>
            mdi-file-pdf
          </v-icon>
          pdf
        </v-btn>
         </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" v-show="loading">
          <v-skeleton-loader type="article"></v-skeleton-loader>
        </v-col>
        <v-col cols="12" v-show="!loading">
          <fieldset class="wc-fieldset">
            <legend class="wc-legend">
              1 - الغرض
            </legend>
            <v-row dense>
              <span class="definitionTitle">1.1 -</span>
              <p v-text="selected.objective"></p>
            </v-row>
          </fieldset>
        </v-col>
        <v-col cols="12" v-show="loading">
          <v-skeleton-loader type="article"></v-skeleton-loader>
        </v-col>
        <v-col cols="12" v-show="!loading">
          <fieldset class="wc-fieldset">
            <legend class="wc-legend">
              2 - النظاق
            </legend>
            <v-row dense>
              <span class="definitionTitle">2.1 -</span>
              <p v-text="selected.domain"></p>
            </v-row>
          </fieldset>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" v-show="loading">
          <v-skeleton-loader type="article"></v-skeleton-loader>
        </v-col>
        <v-col cols="12" v-show="!loading">
          <fieldset class="wc-fieldset">
            <legend class="wc-legend">
              3 - المرجع
            </legend>
            <v-row dense>
              <template v-for="(rfc, idx) in selected.references">
                <v-col cols="12" :key="rfc.id">
                  <span
                    v-text="'3 . ' + (idx + 1) + ' - '"
                    class="definitionTitle"
                  />

                  <span v-text="rfc.name" />
                </v-col>
              </template>
            </v-row>
          </fieldset>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" v-show="loading">
          <v-skeleton-loader type="article"></v-skeleton-loader>
        </v-col>
        <v-col cols="12" v-show="!loading">
          <fieldset class="wc-fieldset">
            <legend class="wc-legend">
              4 - مصطلحات وتعاريف
            </legend>
            <template v-for="(dfn, idx) in selected.definitions">
              <v-row dense :key="dfn.id">
                <v-col cols="4">
                  <span
                    class="definitionTitle"
                    v-text="'4 . ' + (idx + 1) + ' - '"
                  ></span>
                  <span class="definitionTitle" v-text="dfn.name"></span>
                </v-col>
                <v-col cols="12">
                  <span v-text="dfn.description"></span>
                </v-col>
              </v-row>
            </template>
          </fieldset>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" v-show="loading">
          <v-skeleton-loader type="article"></v-skeleton-loader>
        </v-col>
        <v-col cols="12" v-show="!loading">
          <fieldset class="wc-fieldset">
            <legend class="wc-legend">
              5 - المسؤوليات
            </legend>
            <template v-for="(resp, idx) in selected.responsibilities">
              <v-row dense :key="resp.id">
                <v-col cols="4">
                  <span
                    class="definitionTitle"
                    v-text="'5 . ' + (idx + 1) + ' - '"
                  ></span>
                  <span class="definitionTitle" v-text="resp.job.name" />
                </v-col>
                <v-col cols="12">
                  <span v-text="resp.description" />
                </v-col>
              </v-row>
            </template>
          </fieldset>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" v-show="loading">
          <v-skeleton-loader
            type="card-heading,list-item,table"
          ></v-skeleton-loader>
        </v-col>
        <v-col cols="12" v-show="!loading">
          <fieldset class="wc-fieldset">
            <legend class="wc-legend">
              6 - الاجراءات
            </legend>
            <template v-for="(proc, idx) in selected.procedures">
              <v-card class="mt-2 mb-2" :key="proc.id">
                <v-card-text>
                  <v-row dense>
                    <v-col cols="12">
                      <span
                        class="definitionTitle"
                        v-text="'6 . ' + (idx + 1) + ' - '"
                      ></span>
                      <span
                        class="procedure-title"
                        v-text="proc.description"
                      ></span>
                    </v-col>
                    <v-col cols="12">
                      <v-data-table
                        dense
                        :headers="procedureHeader"
                        :items="proc.steps"
                        :disable-pagination="true"
                        :hide-default-footer="true"
                      >
                        <template v-slot:item.orderNo="{ item }">
                          <span v-text="item.orderNo"></span>
                        </template>
                        <template v-slot:item.description="{ item }">
                          <span v-text="item.description"></span>
                        </template>
                        <template v-slot:item.files="{ item }">
                          <v-row dense>
                            <v-col
                              cols="12"
                              v-for="file in item.files"
                              :key="file.name"
                            >
                              <span v-text="file.name"></span>
                              <a :href="attachmentPdfPath + file.uuid">
                                <v-icon color="primary"
                                  >mdi-cloud-download-outline
                                </v-icon>
                              </a>
                            </v-col>
                          </v-row>
                        </template>
                        <template v-slot:item.remarks="{ item }">
                          <span v-text="item.remarks"></span>
                        </template>
                        <template v-slot:item.val1="{ item }">
                          <v-icon color="primary" v-if="item.val1">
                            mdi-check-box-outline
                          </v-icon>
                        </template>
                        <template v-slot:item.val2="{ item }">
                          <v-icon color="primary" v-if="item.val2">
                            mdi-check-box-outline
                          </v-icon>
                        </template>
                        <template v-slot:item.val3="{ item }">
                          <v-icon color="primary" v-if="item.val3">
                            mdi-check-box-outline
                          </v-icon>
                        </template>
                        <template v-slot:item.val4="{ item }">
                          <v-icon color="primary" v-if="item.val4">
                            mdi-check-box-outline
                          </v-icon>
                        </template>
                        <template v-slot:item.val5="{ item }">
                          <v-icon color="primary" v-if="item.val5">
                            mdi-check-box-outline
                          </v-icon>
                        </template>
                        <template v-slot:item.val6="{ item }">
                          <v-icon color="primary" v-if="item.val6">
                            mdi-check-box-outline
                          </v-icon>
                        </template>
                        <template v-slot:item.val7="{ item }">
                          <v-icon color="primary" v-if="item.val7">
                            mdi-check-box-outline
                          </v-icon>
                        </template>
                        <template v-slot:item.val8="{ item }">
                          <v-icon color="primary" v-if="item.val8">
                            mdi-check-box-outline
                          </v-icon>
                        </template>
                        <template v-slot:item.val9="{ item }">
                          <v-icon color="primary" v-if="item.val9">
                            mdi-check-box-outline
                          </v-icon>
                        </template>
                        <template v-slot:footer>
                          <tr>
                            <td class="procedure-title">
                              الملاحظات :
                            </td>
                            <td :colspan="procedureHeader.length - 1">
                              <span v-text="proc.remarks"></span>
                            </td>
                          </tr>
                          <tr>
                            <td class="procedure-title">
                              الوقت لإجراء اللازم :
                            </td>
                            <td :colspan="procedureHeader.length - 1">
                              <span v-text="proc.period"></span>
                            </td>
                          </tr>
                        </template>
                      </v-data-table>
                    </v-col>
                    <v-divider></v-divider>
                  </v-row>
                </v-card-text>
              </v-card>
            </template>
          </fieldset>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" v-show="loading">
          <v-skeleton-loader type="article"></v-skeleton-loader>
        </v-col>
        <v-col cols="12" v-show="!loading">
          <fieldset class="wc-fieldset">
            <legend class="wc-legend">
              7 - مؤشرات القياس
            </legend>
            <template v-for="ptr in selected.pointers">
              <v-row dense :key="ptr.id">
                <v-col cols="12">
                  <span
                    v-text="'7 . ' + ptr.orderNo + ' - '"
                    class="definitionTitle"
                  />
                  -
                  <span v-text="ptr.name" />
                </v-col>
              </v-row>
            </template>
          </fieldset>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" v-show="loading">
          <v-skeleton-loader
            type="card-heading,list-item,list-item,list-item"
          ></v-skeleton-loader>
        </v-col>
        <v-col cols="12" v-show="!loading">
          <fieldset class="wc-fieldset">
            <legend class="wc-legend">
              8 - قائمة السجلات
            </legend>
            <file-list
              :can-edit="false"
              :department="selected.department"
            ></file-list>
          </fieldset>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-text v-show="noData">
      <v-alert border="top" color="red lighten-1" dark>
        لايوجد دليل إجراءات لهذه الادارة
        <b>
          {{ departmentName }}
        </b>
      </v-alert></v-card-text
    >
  </v-card>
</template>

<script>
import WorkGuideService from '@/service/workGuide/WorkGuideService'
import ReportService from '@/service/report/ReportService'

import { Paths } from '@/Paths'
import FileList from '@/components/FileList'
import AttachmentService from '@/service/attachment/AttachmentService'
import { mapActions } from 'vuex'
export default {
  name: 'WorkGuide',
  props: {
    departmentId: {
      type: String,
      default: '0'
    },
    departmentName: {
      type: String,
      default: ''
    },
    viewType: {
      type: String,
      default: '0'
    },
    encId: {
      type: String,
      default: '0'
    }
  },
  watch: {
    departmentId(oldVal, newVal) {
      this.loadWorkGuide()
    },
    encId() {
      this.loadWorkGuide()
    }
  },
  components: { FileList },
  mounted() {
    if (this.encId !== '0' || this.departmentId !== '0') {
      this.loadWorkGuide()
    }
  },
  methods: {
    updated(suc) {
      this.$emit('updated', [{ object: this.selected, success: suc }])
      this.setLoading(false)
    },
    loadWorkGuide() {
      if (this.viewType === '0' && this.departmentId !== '0') {
        this.loading = true
        this.setLoading(true)
        WorkGuideService.getByDepartment(this.departmentId, 10)
          .then(response => {
            this.selected = response.data
            this.loading = false
            this.noData = false
            this.loadFileList()
            this.updated(true)
          })
          .catch(error => {
            this.noData = true
            this.loading = false
            this.selected = {}
            this.files = []
            this.updated(false)
          })
      } else if (this.viewType === '1' && this.encId !== '0') {
        WorkGuideService.getOne(this.encId)
          .then(response => {
            this.selected = response.data
            this.loading = false
            this.loadFileList()
            this.updated(true)
          })
          .catch(error => {
            this.loading = false
            this.selected = {}
            this.files = []
            this.updated(false)
          })
      }
    },
    loadFileList() {
      AttachmentService.listApproved(this.departmentId)
        .then(response => {
          this.files = response.data
        })
        .catch(error => {})
    },
    async generatePdf() {
      ReportService.generateWorkGuideReport(this.selected.id)
        .then(response => {
          const linkSource = 'data:application/pdf;base64,' + response.data.file
          const downloadLink = document.createElement('a')
          const fileName = 'workguide.pdf'
          downloadLink.href = linkSource
          downloadLink.download = fileName
          downloadLink.click()
        })
        .catch(error => {})
    },
    ...mapActions('wg', ['setLoading'])
  },
  data() {
    return {
      noData: false,
      selected: {},
      files: [],
      loading: true
    }
  },
  computed: {
    attachmentPdfPath: function() {
      return Paths.BASE_URL + Paths.FILE_UPLOAD_PATH + '/getPdfAttachment/'
    },
    attachmentPath: function() {
      return Paths.BASE_URL + Paths.FILE_UPLOAD_PATH + '/getAttachment/'
    },
    procedureHeader: function() {
      let arr = []
      arr.push({
        text: 'مسلسل',
        value: 'orderNo',
        align: 'center',
        sortable: false,
        width: '5%'
      })
      arr.push({
        text: 'وصف الخطوة',
        value: 'description',
        align: 'center',
        sortable: false,
        filterable: true,
        width: '40%'
      })
      if (this.selected.responsibilities) {
        let x = 1
        this.selected.responsibilities.forEach(resp => {
          arr.push({
            text: resp.job.name,
            value: 'val' + x++,
            align: 'center',
            sortable: false,
            filterable: true,
            width: '7%'
          })
        })
      }
      arr.push({
        text: 'الملاحظات',
        value: 'remarks',
        align: 'center',
        sortable: false,
        filterable: true,
        width: '20%'
      })
      arr.push({
        text: 'الزثائق ذات العلاقة',
        value: 'files',
        align: 'center',
        sortable: false,
        filterable: true,
        width: '20%'
      })
      return arr
    }
  }
}
</script>

<style scoped>
.wc-legend {
  color: #616161;
  font-size: 1.1em;
  font-weight: bold;
}
</style>
