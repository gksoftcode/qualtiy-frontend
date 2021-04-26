<template>
  <div>
    <v-card elevation="2">
      <v-card-title>
        <v-toolbar-items>
          <v-icon>
            mdi-briefcase-account mdi-24px
          </v-icon>
          <v-toolbar-title>إدارة الوظائف</v-toolbar-title>
        </v-toolbar-items>
      </v-card-title>
      <v-card-subtitle class="mt-0" v-if="hasAccess">
        <v-toolbar dense>
          <v-app-bar-nav-icon></v-app-bar-nav-icon>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="dataTableRequest.data.textSearch"
            @keypress.enter="loadData"
            placeholder="البحث"
          ></v-text-field>
          <v-btn icon>
            <v-icon @click="loadData">mdi-magnify</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn icon @click="creatNew()">
            <v-icon>
              mdi-plus
            </v-icon>
          </v-btn>
          <v-btn icon>
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </v-toolbar>
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
          <template v-slot:item.active="{ item }">
            <v-icon color="green darken-2" v-if="item.active">
              mdi-bookmark-check
            </v-icon>
            <v-icon color="red darken-2" v-else>
              mdi-bookmark-remove
            </v-icon>
          </template>
          <template v-slot:item.jobType="{ item }">
            {{ jobTypes[item.jobType - 1].name }}
          </template>
          <template v-slot:item.action="{ item }">
            <v-btn color="primary" icon @click="edit(item)">
              <v-icon>
                mdi-square-edit-outline
              </v-icon>
            </v-btn>
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
      <v-card-actions>
        <v-dialog dir="rtl" v-model="showDialog" width="60%">
          <v-card>
            <v-card-title>
              تحرير وظيفة جديدة
            </v-card-title>
            <v-card-text>
              <ValidationObserver ref="validator">
                <v-row dense>
                  <v-col cols="6">
                    <ValidationProvider
                      name="اسم الوظيفة"
                      v-slot="{ errors }"
                      rules="required"
                    >
                      <v-text-field
                        label="اسم الوظيفة"
                        dense
                        :error-messages="errors"
                        outlined
                        v-model="selectedJob.name"
                      ></v-text-field
                    ></ValidationProvider>
                  </v-col>
                  <v-col cols="6">
                    <ValidationProvider
                      name="نوع الوظيفة"
                      v-slot="{ errors }"
                      rules="required"
                    >
                      <v-select
                        label="نوع الوظيفة"
                        dense
                        clearable
                        :items="jobTypes"
                        item-text="name"
                        item-value="id"
                        :error-messages="errors"
                        outlined
                        v-model="selectedJob.jobType"
                      ></v-select>
                    </ValidationProvider>
                  </v-col>
                </v-row>
              </ValidationObserver>
              <v-row dense>
                <v-col cols="6">
                  <v-switch
                    v-model="selectedJob.active"
                    :label="selectedJob.active ? 'فعال' : 'غير فعال'"
                  >
                  </v-switch></v-col
              ></v-row>
            </v-card-text>
            <v-card-actions>
              <v-btn
                :loading="saving"
                :disabled="saving"
                color="primary"
                @click="save()"
              >
                حفظ
                <v-icon>
                  mdi-content-save
                </v-icon>
              </v-btn>
              <v-btn color="red" @click="showDialog = false">
                إلغاء
                <v-icon>
                  mdi-close
                </v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-actions>
    </v-card>
    <v-card elevation="2"> </v-card>
  </div>
</template>

<script>
import _ from 'lodash'
import JobService from '@/service/jobs/JobService'
import DataTableRequest from '@/model/request/DataTableRequest'
import DataTableResponse from '@/model/response/DataTableResponse'
import { mapState } from 'vuex'
export default {
  created() {
    this.dataTableRequest.data.textSearch = ''
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
    ...mapState('auth', ['employee'])
  },
  mounted() {},
  methods: {
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
      JobService.list(this.dataTableRequest)
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
    },

    save() {
      this.$refs.validator.validate().then(result => {
        if (result) {
          this.saving = true
          let enc_id = this.selectedJob.encId
          JobService.save(this.selectedJob)
            .then(response => {
              this.selectedJob = response.data
              if (enc_id === -1) {
                this.tableResponse.data.splice(0, 0, this.selectedJob)
              } else {
                let idx = _.findIndex(this.tableResponse.data, function(o) {
                  return enc_id === o.encId
                })
                this.tableResponse.data.splice(idx, 1, this.selectedJob)
              }
              this.showDialog = false
              this.saving = false
              this.$toast.success('تم الحفظ بنجاح')
            })
            .catch(error => {
              this.saving = false
              this.$toast.error('هناك خطأ في عملية الحفظ')
            })
        }
      })
    },

    creatNew() {
      this.showDialog = true
      this.selectedJob = Object.assign({}, this.emptyJob)
    },
    edit(item) {
      this.showDialog = true
      this.selectedJob = Object.assign({}, item)
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
      permissionError: false,
      jobTypes: [
        { id: 1, name: 'إشرافي' },
        { id: 2, name: 'تنفيذي' },
        { id: 3, name: 'عامل' }
      ],
      showDialog: false,
      selectedJob: {},
      saving: false,
      emptyJob: { id: -1, name: '', active: true, encId: -1, jobType: 0 },
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
          text: 'مسمى الوظيفة',
          value: 'name',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '55%'
        },
        {
          text: 'نوع الوظيفة',
          value: 'jobType',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '15%'
        },
        {
          text: 'الحالة',
          value: 'active',
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
          width: '10%'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped></style>
