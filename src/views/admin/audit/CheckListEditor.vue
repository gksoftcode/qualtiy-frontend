<template>
  <div>
    <v-card elevation="3" :loading="loadingAuditPlan">
      <v-card-text>
        <v-row dense v-if="selectedAuditPlan.id > 0">
          <v-col cols="6">
            <span
              class="text-h6 primary--text"
              v-text="selectedAuditPlan.department.name"
            ></span>
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
        </v-row>
      </v-card-text>
    </v-card>
    <template v-for="item in items">
      <v-hover :key="item.id">
        <template v-slot:default="{ hover }">
          <v-card :elevation="hover ? 3 : 1" class="mt-3">
            <v-card-text>
              <v-row dense>
                <v-col cols="12">
                  <p v-text="item.content"></p>
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
            <v-card-actions>
              <v-row dense>
                <v-col cols="12">
                  <v-btn
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
          </v-card>
        </template>
      </v-hover>
    </template>
    <v-card class="mt-6">
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
  </div>
</template>

<script>
import AuditPlanService from '@/service/audit/AuditPlanService'
import _ from 'lodash'
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
    this.loadingAuditPlan = true
    AuditPlanService.getOne(this.auditPlanEncId)
      .then(response => {
        this.selectedAuditPlan = response.data
        this.emptyItem.auditPlan = this.selectedAuditPlan
        this.emptyItem.auditPlanId = this.selectedAuditPlan.id
        this.createItem()
        this.loadingAuditPlan = false
      })
      .catch(error => {
        this.loadingAuditPlan = false
      })
  },
  methods: {
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
    }
  },
  data() {
    return {
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
        encId: '-1'
      }
    }
  }
}
</script>

<style scoped></style>
