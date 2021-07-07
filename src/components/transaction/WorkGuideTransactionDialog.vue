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
import WorkGuideService from '@/service/workGuide/WorkGuideService'
export default {
  name: 'WorkGuideTransactionDialog',
  model: {
    prop: 'value'
  },
  props: {
    value: { type: Boolean, default: false },
    workGuideId: {
      type: String,
      default: '-1'
    }
  },
  watch: {
    workGuideId(val, oldVal) {
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
      WorkGuideService.listTransactionByWorkGuide(val)
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
      { id: 0, name: 'مسودة' },
      { id: 10, name: 'مرسلة' },
      { id: 15, name: 'إرجاع رئيس قسم' },
      { id: 20, name: 'اعتماد رئيس قسم' },
      { id: 25, name: 'ارجاع الجودة' },
      { id: 30, name: 'اعتماد الجودة' },
      { id: 40, name: 'اعتماد نهائي' }
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
