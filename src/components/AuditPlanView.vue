<template>
  <div v-if="selectedAuditPlan.encId">
    <v-row dense>
      <v-col cols="6">
        <v-text-field
          readonly
          outlined
          dense
          :value="selectedAuditPlan.department.name"
          label="الادارة"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="4">
        <v-text-field
          outlined
          dense
          v-model="selectedAuditPlan.fromDate"
          label="من تاريخ"
          prepend-icon="mdi-calendar"
          readonly
        ></v-text-field>
      </v-col>
      <v-col cols="4">
        <v-text-field
          outlined
          dense
          v-model="selectedAuditPlan.toDate"
          label="إلى تاريخ"
          prepend-icon="mdi-calendar"
          readonly
        ></v-text-field>
      </v-col>
    </v-row>
    <v-data-table :headers="empHeader" :items="selectedAuditPlan.auditors">
      <template v-slot:item.sn="{ item }">
        {{ selectedAuditPlan.auditors.indexOf(item) + 1 }}
      </template>
    </v-data-table>
  </div>
</template>
<script>
import AttachmentService from '@/service/attachment/AttachmentService'
import { Paths } from '@/Paths'

export default {
  name: 'AuditPlanView',
  props: {
    selectedAuditPlan: {
      type: Object,
      default: function() {
        return null
      }
    }
  },
  data() {
    return {
      empHeader: [
        {
          text: 'مسلسل',
          value: 'sn',
          align: 'center',
          sortable: false,
          width: '10%'
        },
        {
          text: 'اسم الموظف',
          value: 'fullName',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '45%'
        },
        {
          text: 'المنصب',
          value: 'job.name',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '45%'
        }
      ]
    }
  },
  methods: {}
}
</script>
<style type="scss"></style>
