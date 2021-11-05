<template>
  <div>
    <v-card elevation="2" class="custom-heading">
      <v-card-title>
        <v-toolbar-items>
          <v-icon>
            mdi-script-text mdi-24px
          </v-icon>
          <v-toolbar-title>إدارة الوثائق</v-toolbar-title>
        </v-toolbar-items>
      </v-card-title>
      <v-card-text v-if="hasAccess">
        <v-row dense>
          <v-col cols="4">
            <v-text-field
              dense
              outlined
              v-model="dataTableRequest.data.textSearch"
              @keypress.enter="loadData"
              placeholder="البحث"
            ></v-text-field>
          </v-col>
          <v-col cols="1">
            <v-btn color="primary" @click="loadData" icon>
              <v-icon>mdi-magnify mdi-36px</v-icon>
            </v-btn>
          </v-col>
          <v-col cols="7">
            <v-btn class="float-left" color="primary" icon @click="creatNew()">
              <v-icon>
                mdi-plus mdi-36px
              </v-icon>
            </v-btn>
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
        <error401 v-if="!hasAccess"></error401>
      </v-card-text>
      <v-card-actions>
        <v-dialog dir="rtl" v-model="showDialog" width="60%">
          <v-card>
            <v-card-title>
              تحرير وثيقة
            </v-card-title>
            <v-card-text>
              <ValidationObserver ref="validator">
                <v-row dense>
                  <v-col cols="6">
                    <ValidationProvider
                      name="اسم الوثيقة"
                      v-slot="{ errors }"
                      rules="required"
                    >
                      <v-text-field
                        label="اسم الوثيقة"
                        dense
                        :error-messages="errors"
                        outlined
                        v-model="selectedDocument.name"
                      ></v-text-field
                    ></ValidationProvider>
                  </v-col>
                </v-row>
              </ValidationObserver>
              <v-row dense>
                <v-col cols="6">
                  <v-switch
                    v-model="selectedDocument.active"
                    :label="selectedDocument.active ? 'فعال' : 'غير فعال'"
                  >
                  </v-switch></v-col
              ></v-row>
            </v-card-text>
            <v-card-actions>
              <v-btn
                text
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
              <v-btn text color="error" @click="showDialog = false">
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
import DataTableRequest from '@/model/request/DataTableRequest'
import DataTableResponse from '@/model/response/DataTableResponse'
import { mapState } from 'vuex'
import Error401 from '@/components/Error401'
import DocumentService from '@/service/documents/DocumentService'
export default {
  components: { Error401 },
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
  mounted() {
    document.title = this.$route.meta.title
  },
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
      DocumentService.list(this.dataTableRequest)
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
          let enc_id = this.selectedDocument.encId
          DocumentService.save(this.selectedDocument)
            .then(response => {
              this.selectedDocument = response.data
              if (enc_id === -1) {
                this.tableResponse.data.splice(0, 0, this.selectedDocument)
              } else {
                let idx = _.findIndex(this.tableResponse.data, function(o) {
                  return enc_id === o.encId
                })
                this.tableResponse.data.splice(idx, 1, this.selectedDocument)
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
      this.selectedDocument = Object.assign({}, this.emptyJob)
    },
    edit(item) {
      this.showDialog = true
      this.selectedDocument = Object.assign({}, item)
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
      showDialog: false,
      selectedDocument: {},
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
          text: 'اسم الوثيقة',
          value: 'name',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '55%'
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
