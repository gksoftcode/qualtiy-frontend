<template>
  <div>
    <WorkGuide :enc-id="encId" :view-type="viewType"></WorkGuide>
    <v-card v-show="actions">
      <v-card-actions>
        <v-overlay :value="sending" :absolute="true">
          <v-progress-circular indeterminate size="42"></v-progress-circular>
        </v-overlay>
        <v-btn
          color="primary"
          v-show="actions.HAS_STEP_1"
          @click="statusAction(10, 0)"
        >
          <v-icon> mdi-send</v-icon>
          ارسال
        </v-btn>
        <v-btn
          color="primary"
          v-show="actions.HAS_STEP_2"
          @click="statusAction(20, 2)"
        >
          <v-icon>mdi-send-check</v-icon>
          اعتماد
        </v-btn>
        <v-btn
          color="orange darken-1"
          v-show="actions.HAS_STEP_2"
          @click="rejectAction(15, 1)"
        >
          <v-icon> mdi-backup-restore</v-icon>
          ارجاع موظف
        </v-btn>
        <v-btn
          color="primary darken-1"
          v-show="actions.HAS_STEP_3"
          @click="statusAction(30, 4)"
        >
          <v-icon>mdi-send-check</v-icon>
          اعتماد
        </v-btn>
        <v-btn
          color="orange darken-2"
          dark
          v-show="actions.HAS_STEP_3"
          @click="rejectAction(25, 3)"
        >
          <v-icon> mdi-backup-restore</v-icon>
          ارجاع موظف
        </v-btn>
        <v-btn
          color="primary darken-2"
          v-show="actions.HAS_STEP_4"
          @click="statusAction(40, 5)"
        >
          <v-icon>mdi-send-check</v-icon>
          اعتماد
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog v-model="rejectDlg" width="50%">
      <v-card>
        <v-card-title>
          إرجاع الدليل
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
          <v-btn color="red" @click="rejectDlg = false">
            إغلاق
            <v-icon> </v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import WorkGuide from '@/components/WorkGuide'
import { mapState } from 'vuex'
import WorkGuideService from '@/service/workGuide/WorkGuideService'
export default {
  props: {
    viewType: {
      type: String,
      default: '1'
    },
    encId: {
      type: String,
      default: '0'
    }
  },
  methods: {
    statusAction(toStatus, msgId) {
      this.remarks = ''
      this.$confirm(this.messages[msgId]).then(res => {
        if (res) {
          this.sending = true
          this.updateStatus(toStatus)
        }
      })
    },
    rejectAction(toStatus, msgId) {
      this.nextStatus = toStatus
      this.remarks = ''
      this.$confirm(this.messages[msgId]).then(res => {
        if (res) {
          this.rejectDlg = true
        }
      })
    },
    rejected() {
      if (this.nextStatus > 0) {
        this.updateStatus(this.nextStatus)
      }
    },
    updateStatus(toStatus) {
      WorkGuideService.updateStatus(this.encId, toStatus, this.remarks)
        .then(response => {
          this.loadActions()
          if (this.data.success) {
            this.$toast.success('تم تعديل الحالة بنجاح')
          } else {
            this.$toast.error('هناك خطأ في تعديل الحالة')
          }
        })
        .catch(error => {
          this.loadActions()
        })
    },
    loadActions() {
      this.sending = true
      WorkGuideService.getPermissionById(this.encId)
        .then(response => {
          this.actions = Object.assign({}, response.data)
          this.sending = false
        })
        .catch(error => {
          this.sending = false
        })
    }
  },
  mounted() {
    try {
      this.loadActions()
    } catch (e) {
      console.log(e)
    }
    document.title = this.$route.meta.title
  },
  computed: {
    hasFullDepartment: function() {
      let ha = false
      try {
        this.employee.roles.forEach(item => {
          if (
            item === 'ROLE_QUALITY' ||
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
  components: { WorkGuide },
  data() {
    return {
      nextStatus: 0,
      rejectDlg: false,
      sending: false,
      actions: null,
      remarks: '',
      messages: [
        'هل تود ارسال الدليل للاعتماد',
        'هل تود ارجاع الدليل للمراجعة',
        'هل تود اعتماد هذا الدليل',
        'هل تود ارجاع الدليل للمراجعة',
        'هل تود اعتماد هذا الدليل للاعتماده النهائي',
        'هل تود اعتماد هذا الدليل بشكل نهائي'
      ]
    }
  }
}
</script>

<style lang="scss"></style>
