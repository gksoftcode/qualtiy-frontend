<template>
  <div class="AuditReport">
    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="128"></v-progress-circular>
    </v-overlay>
    <v-card :loading="loading" elevation="2" class="custom-heading">
      <v-card-title>
        <v-toolbar-items>
          <v-icon>
            mdi-book-check mdi-24px
          </v-icon>
          <v-toolbar-title>
            تحرير تقرير
            <span
              v-if="selectedReport.title && selectedReport.title.length > 0"
            >
              -
              {{ selectedReport.title }}
            </span>
          </v-toolbar-title>
        </v-toolbar-items>
      </v-card-title>
      <v-card-text>
        <v-tabs slider-size="3" v-model="tabs" @change="updateTab">
          <v-tabs-slider color="accent"></v-tabs-slider>
          <v-tab href="#tab_dtls">
            بيانات التدقيق
          </v-tab>
          <v-tab href="#tab_calendar">
            مجال التدقيق
          </v-tab>
          <v-tab href="#tab_team">
            فريق التدقيق
          </v-tab>
          <v-tab href="#tab_correction">
            اجراءات التصحيح
          </v-tab>
          <v-tab href="#tab_strength_points">
            نقاط القوة
          </v-tab>
          <v-tab href="#tab_weakness_points">
            نقاط الضعف
          </v-tab>
          <v-tab href="#tab_remarks">
            الملاحظات
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tabs">
          <v-tab-item value="tab_dtls">
            <v-card>
              <v-card-text>
                <v-row dense>
                  <v-col cols="8">
                    <v-text-field
                      :readonly="!canEdit"
                      :filled="!canEdit"
                      outlined
                      dense
                      label="مسمى التدقيق"
                      v-model="selectedReport.title"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2">
                    <v-select
                      :readonly="!canEdit"
                      :filled="!canEdit"
                      outlined
                      :items="years"
                      item-value="id"
                      item-text="name"
                      v-model="selectedReport.yearId"
                      dense
                      label="عام التدقيق"
                    ></v-select>
                  </v-col>
                  <v-col cols="8">
                    <v-text-field
                      :readonly="!canEdit"
                      :filled="!canEdit"
                      outlined
                      dense
                      label="مجال التدقيق"
                      v-model="selectedReport.domain"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2">
                    <v-text-field
                      :readonly="!canEdit"
                      :filled="!canEdit"
                      outlined
                      type="number"
                      dense
                      label="الرقم"
                      v-model="selectedReport.reportNo"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="12">
                    <v-radio-group
                      :readonly="!canEdit"
                      :filled="!canEdit"
                      v-model="selectedReport.auditType"
                      dense
                      row
                    >
                      <template v-slot:label>
                        <span class="primary-text font-weight-bold">
                          الهدف من التدقيق
                        </span>
                      </template>
                      <template v-for="item in AuditTypeData">
                        <v-radio
                          :key="item.id"
                          :label="item.name"
                          :value="item.id"
                          @change="printBitWise"
                        ></v-radio>
                      </template>
                    </v-radio-group>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item value="tab_calendar">
            <v-card>
              <v-card-actions>
                <v-btn
                  v-if="canEdit"
                  class="left"
                  color="primary"
                  @click="creatNewAuditPlan"
                >
                  جديد
                  <v-icon>
                    mdi-plus
                  </v-icon>
                </v-btn>
              </v-card-actions>
              <v-card-text>
                <v-row dense>
                  <v-col cols="12">
                    <v-data-table
                      :headers="auditPlanHeader"
                      :items="selectedReport.auditPlans"
                    >
                      <template v-slot:item.sn="{ item }">
                        {{ selectedReport.auditPlans.indexOf(item) + 1 }}
                      </template>
                      <template v-slot:item.status="{ item }">
                        <span
                          class="ms-2 text-subtitle-2 accent--text"
                          v-text="status[item.status]"
                        >
                        </span>
                      </template>
                      <template v-slot:item.action="{ item }">
                        <v-btn
                          color="primary"
                          icon
                          @click="editAuditPlan(item)"
                          v-if="canEdit && item.status < 10"
                        >
                          <v-icon>
                            mdi-square-edit-outline
                          </v-icon>
                        </v-btn>
                        <v-btn
                          color="primary"
                          icon
                          @click="viewAuditPlan(item)"
                          v-if="item.status >= 10"
                        >
                          <v-icon>
                            mdi-eye
                          </v-icon>
                        </v-btn>
                        <v-btn
                          color="primary"
                          icon
                          :to="{
                            name: 'CheckListEditor',
                            params: { auditPlanEncId: item.encId }
                          }"
                        >
                          <v-icon>
                            mdi-format-list-checks
                          </v-icon>
                        </v-btn>
                        <v-btn
                          v-if="canEdit"
                          color="red"
                          icon
                          @click="deleteAuditPlan(item)"
                        >
                          <v-icon>mdi-trash-can </v-icon>
                        </v-btn>
                      </template>
                    </v-data-table>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item value="tab_team">
            <v-card>
              <v-card-text>
                <v-data-table :items="team" :headers="empHeaderView">
                  <template v-slot:item.sn="{ item }">
                    {{ team.indexOf(item) + 1 }}
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item value="tab_correction">
            <v-card>
              <v-card-text>
                <v-data-table
                  :headers="correctionHeader"
                  :items="tableResponse.data"
                  :loading="loadingCorrectionTab"
                  item-key="id"
                  :options.sync="dataTableOptions"
                  :server-items-length="tableResponse.total"
                >
                  <template v-slot:no-data>
                    <v-row>
                      <v-col cols="12" class="text-center">
                        لاتوجد سجلات للعرض
                      </v-col>
                    </v-row>
                  </template>
                  <template v-slot:item.sn="{ item }">
                    {{
                      dataTableOptions.itemsPerPage *
                        (dataTableOptions.page - 1) +
                        tableResponse.data.indexOf(item) +
                        1
                    }}
                  </template>
                  <template v-slot:item.status="{ item }">
                    <span
                      class="ms-2 text-subtitle-2 accent--text"
                      v-text="correctionStatus[item.status]"
                    >
                    </span>
                  </template>
                  <template v-slot:item.approved="{ item }">
                    <span
                      class="ms-2 text-subtitle-2 accent--text"
                      v-text="approvedStatus[item.approved]"
                    >
                    </span>
                  </template>
                  <template v-slot:item.descEmployee="{ item }">
                    <span
                      v-text="item.descEmployee.fullName"
                      v-if="item.descEmployee"
                    ></span>
                  </template>
                  <template v-slot:item.action="{ item }">
                    <v-btn
                      color="primary"
                      icon
                      @click="editCorrectionById(item.auditItemId)"
                    >
                      <v-icon>
                        mdi-tooltip-check
                      </v-icon>
                    </v-btn>
                    <v-btn
                      v-show="canEdit"
                      color="error"
                      icon
                      @click="deleteCorrectionById(item.encId)"
                    >
                      <v-icon>
                        mdi-trash-can
                      </v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item value="tab_strength_points">
            <v-card>
              <v-card-text>
                <v-row dense>
                  <v-col cols="8">
                    <v-text-field
                      v-show="canEdit"
                      label="نقطة القوة"
                      outlined
                      dense
                      v-model="selectedPoint.description"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="1">
                    <v-text-field
                      v-show="false"
                      type="number"
                      label=""
                      v-model="selectedPoint.orderNo"
                      outlined
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="1">
                    <v-btn
                      v-if="canEdit"
                      icon
                      color="primary"
                      @click="addPoint(1)"
                    >
                      <v-icon>
                        mdi-plus-circle mdi-36px
                      </v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="12">
                    <v-data-table
                      :items="strengthPoints"
                      :headers="pointHeaders"
                    >
                      <template v-slot:item.action="{ item }">
                        <v-btn v-if="canEdit" icon @click="deletePoint(item)">
                          <v-icon>mdi-trash-can </v-icon>
                        </v-btn>
                      </template>
                    </v-data-table>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item value="tab_weakness_points">
            <v-card>
              <v-card-text>
                <v-row dense>
                  <v-col cols="8">
                    <v-text-field
                      v-show="canEdit"
                      label="نقطة الضعف"
                      outlined
                      dense
                      v-model="selectedPoint.description"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="1">
                    <v-text-field
                      v-show="false"
                      type="number"
                      label=""
                      v-model="selectedPoint.orderNo"
                      outlined
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="1">
                    <v-btn
                      v-if="canEdit"
                      icon
                      color="primary"
                      @click="addPoint(2)"
                    >
                      <v-icon>
                        mdi-plus-circle mdi-36px
                      </v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="12">
                    <v-data-table
                      :items="weaknessPoints"
                      :headers="pointHeaders"
                    >
                      <template v-slot:item.action="{ item }">
                        <v-btn v-if="canEdit" icon @click="deletePoint(item)">
                          <v-icon>mdi-trash-can </v-icon>
                        </v-btn>
                      </template>
                    </v-data-table>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item value="tab_remarks">
            <v-card>
              <v-card-text>
                <v-row dense>
                  <v-col cols="12">
                    <v-textarea
                      :readonly="!canEdit"
                      :filled="!canEdit"
                      label="الملاحظات"
                      dense
                      outlined
                      rows="5"
                      v-model="selectedReport.remarks"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          @click="save"
          :loading="saving"
          :disabled="saving"
          v-if="canEdit"
        >
          حفظ
          <v-icon>
            mdi-content-save
          </v-icon>
        </v-btn>
        <v-btn
          color="warning darken-1"
          @click="send(20)"
          :loading="saving"
          :disabled="saving"
          v-if="
            selectedReport.status <= 10 &&
              hasApproveAccess &&
              selectedReport.encId !== '-1'
          "
        >
          ارسال
          <v-icon>
            mdi-send-outline
          </v-icon>
        </v-btn>
        <v-btn
          color="warning darken-1"
          @click="send(10)"
          :loading="saving"
          :disabled="saving"
          v-if="selectedReport.status === 20 && hasFinalApproveAccess"
        >
          ارجاع
          <v-icon>
            mdi-content-save
          </v-icon>
        </v-btn>
        <v-btn
          color="primary"
          @click="send(30)"
          :loading="saving"
          :disabled="saving"
          v-if="selectedReport.status === 20 && hasFinalApproveAccess"
        >
          اعتماد
          <v-icon>
            mdi-content-save
          </v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog dir="rtl" v-model="showDialog" width="60%">
      <v-card>
        <v-card-title>
          تحرير تدقيق إدارة
        </v-card-title>
        <v-card-text>
          <ValidationObserver ref="validator">
            <v-row dense>
              <v-col cols="6">
                <v-combobox
                  dense
                  outlined
                  label="الادارة"
                  :items="departments"
                  item-value="id"
                  item-text="name"
                  return-object
                  v-model="selectedAuditPlan.department"
                ></v-combobox>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="4">
                <v-menu
                  v-model="fromDateD"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      outlined
                      dense
                      v-model="selectedAuditPlan.fromDate"
                      label="من تاريخ"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="selectedAuditPlan.fromDate"
                    @input="fromDateD = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="4">
                <v-menu
                  v-model="toDateD"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      outlined
                      dense
                      v-model="selectedAuditPlan.toDate"
                      label="إلى تاريخ"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="selectedAuditPlan.toDate"
                    @input="toDateD = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </ValidationObserver>
          <v-row dense>
            <v-col cols="5">
              <v-autocomplete
                dense
                outlined
                :items="emps"
                :loading="isLoading"
                :search-input.sync="empText"
                item-text="fullName"
                item-value="id"
                label="المدقق"
                placeholder="اكتب هنا للبحث"
                prepend-icon="mdi-database-search"
                return-object
                v-model="selectedEmployee"
              ></v-autocomplete>
            </v-col>
            <v-col cols="1">
              <v-btn
                v-if="canEdit"
                fab
                x-small
                color="primary"
                @click="addEmployee"
              >
                <v-icon>
                  mdi-plus
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-data-table
            :headers="empHeader"
            :items="selectedAuditPlan.auditors"
          >
            <template v-slot:item.sn="{ item }">
              {{ selectedAuditPlan.auditors.indexOf(item) + 1 }}
            </template>
            <template v-slot:item.action="{ item }">
              <v-btn
                v-if="canEdit"
                color="red"
                icon
                @click="deleteEmployee(item)"
              >
                <v-icon>
                  mdi-trash-can
                </v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-btn
            v-if="canEdit && selectedAuditPlan.encId === '-1'"
            color="primary"
            @click="addAuditPlan"
          >
            اضافة
            <v-icon>
              mdi-content-save
            </v-icon>
          </v-btn>
          <v-btn v-else-if="canEdit" color="primary" @click="updateAuditPlan">
            تعديل
            <v-icon>
              mdi-content-save
            </v-icon>
          </v-btn>
          <v-btn dark color="red" @click="showDialog = false">
            إلغاء
            <v-icon>
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog dir="RTL" v-model="viewDialog" width="60%">
      <v-card>
        <v-card-title>
          تدقيق إدارة
        </v-card-title>
        <v-card-text>
          <audit-plan-view
            :selected-audit-plan="auditPlaneView"
          ></audit-plan-view>
        </v-card-text>
        <v-card-actions>
          <v-btn text color="error" @click="viewDialog = false">
            إغلاق
            <v-icon>
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog dir="RTL" v-model="msgDlg" width="60%" persistent>
      <v-card>
        <v-card-title>
          متابعة التقرير
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <v-textarea
                rows="2"
                v-model="remarks"
                dense
                outlined
                label="الملاحظات والاسباب"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" text @click="saveSend">
            موافق
            <v-icon> mdi-check-circle-outline</v-icon>
          </v-btn>
          <v-btn color="error" text @click="msgDlg = false">
            إغلاق
            <v-icon>
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script src="./_AuditReport.js" lang="js"></script>
<style src="./_AuditReport.scss" lang="scss" scoped></style>
