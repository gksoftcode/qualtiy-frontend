<template>
  <v-dialog :value="showDialog" width="70%" @input="closeEvent">
    <v-card>
      <v-card-title>
        الاجراءات
      </v-card-title>
      <v-card-text>
        <v-data-table
          :items="items"
          item-key="createdAt"
          disable-pagination
          hide-default-footer
          :loading="loading"
          :headers="transactionHeader"
        >
          <template v-slot:item.sn="{ item }">
            {{ items.indexOf(item) + 1 }}
          </template>
          <template v-slot:item.actionType="{ item }">
            {{
              status.filter(t => {
                return t.id === item.actionType
              })[0].name
            }}
          </template>
          <template v-slot:item.createdAt="{ item }">
            {{ item.createdAt | formatDate }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import AttachmentService from '@/service/attachment/AttachmentService'

export default {
  name: 'AttachmentTransactionDialog',
  model: {
    prop: 'value'
  },
  props: {
    value: { type: Boolean, default: false },
    parentId: {
      type: String,
      default: '-1'
    }
  },
  watch: {
    parentId(val, oldVal) {
      if (val !== oldVal && val !== '') {
        this.loadData1(val)
      }
    }
  },
  computed: {
    showDialog() {
      return this.value
    }
  },
  methods: {
    loadData1(val) {
      this.items = []
      this.loading = true
      AttachmentService.listTransactionByAttachment(val)
        .then(res => {
          this.items = res.data
          this.loading = false
        })
        .catch(error => {
          this.loading = false
        })
    },
    closeEvent() {
      this.$emit('input', false)
    }
  },
  data: () => ({
    items: [],
    status: [
      { id: -1, name: 'الجميع' },
      { id: 0, name: 'جديد' },
      { id: 5, name: 'قيد التحرير' },
      { id: 6, name: 'إرجاع' },
      { id: 10, name: 'مرسلة' },
      { id: 20, name: 'معتمدة' },
      { id: 30, name: 'نسخة قديمة' },
      { id: 50, name: 'ملغي' }
    ],
    loading: false,
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
  })
}
</script>

<style scoped></style>
