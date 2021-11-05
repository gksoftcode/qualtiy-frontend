<template>
  <div class="workGuideEditor">
    <v-overlay :value="loading" :absolute="true">
      <v-progress-circular indeterminate size="128"></v-progress-circular>
    </v-overlay>
    <v-card :loading="loading">
      <v-card-text>
        <v-row dense>
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
              :value="documentNumber"
              label="رقم الدليل"
              dense
              outlined
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-menu
              ref="issueDateMenu"
              v-model="issueDateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  outlined
                  v-model="selected.issueDate"
                  label="تاريخ الاصدار"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  dense
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="selected.issueDate"
                scrollable
                @input="issueDateMenu = false"
              >
              </v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="1">
            <v-text-field
              type="number"
              v-model="selected.version"
              label="النسخة"
              dense
              outlined
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="12">
            <v-textarea
              outlined
              dense
              v-model="selected.objective"
              label="1 - الغرض"
              rows="4"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              outlined
              dense
              v-model="selected.domain"
              label=" 2 - نطاق التطبيق"
              rows="4"
            />
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="12">
            <fieldset class="wc-fieldset">
              <legend>
                3 - مراجع
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      icon
                      color="primary"
                      @click="createNewReference"
                      v-bind="attrs"
                      v-on="on"
                    >
                      <v-icon>
                        mdi-plus
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>
                    اضافة مرجع
                  </span>
                </v-tooltip>
              </legend>
              <draggable
                dir="rtl"
                :list="selected.references"
                ghost-class="ghost"
                @change="reOrder(selected.references)"
              >
                <transition-group type="transition" :name="'flip-list'">
                  <template v-for="rfc in selected.references">
                    <v-row dense :key="rfc.id">
                      <v-col cols="11">
                        <span v-text="rfc.orderNo + ' - '" />
                        <span v-text="rfc.name" />
                      </v-col>
                      <v-col cols="1">
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              icon
                              color="primary"
                              @click="editReference(rfc)"
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
                              color="error"
                              @click="deleteReference(rfc)"
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
                </transition-group>
              </draggable>
            </fieldset>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="12">
            <fieldset class="wc-fieldset">
              <legend>
                4 - المصطلحات والتعاريف
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      icon
                      color="primary"
                      @click="createNewDefinition"
                      v-bind="attrs"
                      v-on="on"
                    >
                      <v-icon>
                        mdi-plus
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>
                    اضافة مصطلح
                  </span>
                </v-tooltip>
              </legend>
              <draggable
                dir="rtl"
                :list="selected.definitions"
                ghost-class="ghost"
                @change="reOrder(selected.definitions)"
              >
                <transition-group type="transition" :name="'flip-list'">
                  <template v-for="dfn in selected.definitions">
                    <v-row dense :key="dfn.id">
                      <v-col cols="12">
                        <span
                          class="definitionTitle"
                          v-text="dfn.orderNo + ' - '"
                        ></span>
                        <span class="definitionTitle" v-text="dfn.name"></span>
                      </v-col>
                      <v-col cols="11">
                        <span v-text="dfn.description"></span>
                      </v-col>
                      <v-col cols="1" :key="dfn.id">
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              icon
                              color="primary"
                              @click="editDefinition(dfn)"
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
                              dark
                              icon
                              color="error"
                              @click="deleteDefinition(dfn)"
                              v-bind="attrs"
                              v-on="on"
                            >
                              <v-icon> mdi-trash-can-outline</v-icon>
                            </v-btn>
                          </template>
                          <span>حذف</span>
                        </v-tooltip>
                      </v-col>
                      <v-divider inset></v-divider>
                    </v-row>
                  </template>
                </transition-group>
              </draggable>
            </fieldset>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="12">
            <fieldset class="wc-fieldset">
              <legend>
                5 - المسؤوليات
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      icon
                      color="primary"
                      @click="createNewResponsibility"
                      v-bind="attrs"
                      v-on="on"
                    >
                      <v-icon>
                        mdi-plus
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>
                    اضافة مسؤولية
                  </span>
                </v-tooltip>
              </legend>
              <draggable
                dir="rtl"
                :list="selected.responsibilities"
                ghost-class="ghost"
                @change="reOrder(selected.responsibilities)"
              >
                <transition-group type="transition" :name="'flip-list'">
                  <template v-for="resp in selected.responsibilities">
                    <v-row dense :key="resp.id">
                      <v-col cols="12">
                        <span
                          class="definitionTitle"
                          v-text="resp.orderNo + ' - '"
                        />
                        <span class="definitionTitle" v-text="resp.job.name" />
                      </v-col>

                      <v-col cols="11">
                        <span v-text="resp.description" />
                      </v-col>
                      <v-col cols="1" :key="resp.id">
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              icon
                              color="primary"
                              @click="editResponsibility(resp)"
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
                              dark
                              icon
                              color="error"
                              @click="deleteResponsibility(resp)"
                              v-bind="attrs"
                              v-on="on"
                            >
                              <v-icon> mdi-trash-can-outline</v-icon>
                            </v-btn>
                          </template>
                          <span>حذف</span>
                        </v-tooltip>
                      </v-col>
                      <v-divider inset></v-divider>
                    </v-row>
                  </template>
                </transition-group>
              </draggable>
            </fieldset>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="12">
            <fieldset class="wc-fieldset">
              <legend>
                6 - الاجراءات
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      icon
                      color="primary"
                      @click="createNewProcedure"
                    >
                      <v-icon>
                        mdi-plus
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>اضافة إجراء</span>
                </v-tooltip>
              </legend>
              <template v-for="proc in selected.procedures">
                <v-card class="mb-2" :key="proc.id">
                  <v-card-text>
                    <v-row dense>
                      <v-col cols="11">
                        <span
                          class="procedure-title"
                          v-text="proc.description"
                        ></span>
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              v-bind="attrs"
                              v-on="on"
                              icon
                              color="primary"
                              @click="createNewStep(proc)"
                            >
                              <v-icon>
                                mdi-plus-circle
                              </v-icon>
                            </v-btn>
                          </template>
                          <span>
                            اضافة خطوة
                          </span>
                        </v-tooltip>
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              v-bind="attrs"
                              v-on="on"
                              icon
                              color="primary"
                              @click="manageProsResp(proc)"
                            >
                              <v-icon>
                                mdi-account-cog
                              </v-icon>
                            </v-btn>
                          </template>
                          <span>
                            المسؤوليات
                          </span>
                        </v-tooltip>
                      </v-col>
                      <v-col cols="1">
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              icon
                              color="primary"
                              @click="editProcedure(proc)"
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
                              dark
                              icon
                              color="error"
                              @click="deleteProcedure(proc)"
                              v-bind="attrs"
                              v-on="on"
                            >
                              <v-icon> mdi-trash-can-outline</v-icon>
                            </v-btn>
                          </template>
                          <span>حذف</span>
                        </v-tooltip>
                      </v-col>
                      <v-col cols="12">
                        <v-data-table
                          dense
                          :headers="
                            procedureHeader1
                              .concat(
                                proc.responsibilities.map((pro, idx) => {
                                  return {
                                    text: pro.name,
                                    value: 'val' + (idx + 1),
                                    align: 'center',
                                    sortable: false,
                                    filterable: false,
                                    width: '5%'
                                  }
                                })
                              )
                              .concat(procedureHeader2)
                          "
                          :items="proc.steps"
                        >
                          <template v-slot:item.orderNo="{ item }">
                            <v-text-field
                              dense
                              type="number"
                              v-model="item.orderNo"
                            ></v-text-field>
                          </template>
                          <template v-slot:item.description="{ item }">
                            <v-textarea
                              dense
                              rows="1"
                              v-model="item.description"
                            ></v-textarea>
                          </template>
                          <template v-slot:item.remarks="{ item }">
                            <v-textarea
                              rows="1"
                              dense
                              v-model="item.remarks"
                            ></v-textarea>
                          </template>
                          <template v-slot:item.files="{ item }">
                            <v-row dense>
                              <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                  <v-btn
                                    v-bind="attrs"
                                    v-on="on"
                                    icon
                                    @click="showFilesDlg(item)"
                                  >
                                    <v-icon color="primary">
                                      mdi-link-plus
                                    </v-icon>
                                  </v-btn>
                                </template>
                                <span>
                                  اضافة وثيقة أو سجل
                                </span>
                              </v-tooltip>
                              <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                  <v-btn
                                    v-bind="attrs"
                                    v-on="on"
                                    icon
                                    @click="createDocs(item)"
                                  >
                                    <v-icon color="primary">
                                      mdi-link-plus
                                    </v-icon>
                                  </v-btn>
                                </template>
                                <span>
                                  اضافة وثيقة نصية
                                </span>
                              </v-tooltip>
                              <v-col
                                cols="12"
                                v-for="doc in item.docs"
                                :key="doc"
                              >
                                <span>
                                  {{ doc }}
                                </span>
                                <v-icon
                                  dark
                                  class="mdi-18px float-left"
                                  color="error"
                                  @click="removeDocFromStep(doc, item)"
                                >
                                  mdi-minus-circle
                                </v-icon>
                              </v-col>
                              <v-col
                                cols="12"
                                v-for="doc in item.documentTypes"
                                :key="doc.id"
                              >
                                <span>
                                  {{ doc.name }}
                                </span>
                                <v-icon
                                  dark
                                  class="mdi-18px float-left"
                                  color="error"
                                  @click="removeDocumentFromStep(doc, item)"
                                >
                                  mdi-minus-circle
                                </v-icon>
                              </v-col>
                              <v-col
                                cols="12"
                                v-for="file in item.files"
                                :key="file.name"
                              >
                                <span v-text="file.name"></span>
                                <v-icon
                                  dark
                                  class="mdi-18px float-left"
                                  color="error"
                                  @click="removeFileFromStep(file, item)"
                                >
                                  mdi-link-off
                                </v-icon>
                              </v-col>
                            </v-row>
                          </template>

                          <template v-slot:item.val1="{ item }">
                            <v-checkbox v-model="item.val1"></v-checkbox>
                          </template>
                          <template v-slot:item.val2="{ item }">
                            <v-checkbox v-model="item.val2"></v-checkbox>
                          </template>
                          <template v-slot:item.val3="{ item }">
                            <v-checkbox v-model="item.val3"></v-checkbox>
                          </template>
                          <template v-slot:item.val4="{ item }">
                            <v-checkbox v-model="item.val4"></v-checkbox>
                          </template>
                          <template v-slot:item.val5="{ item }">
                            <v-checkbox v-model="item.val5"></v-checkbox>
                          </template>
                          <template v-slot:item.val6="{ item }">
                            <v-checkbox v-model="item.val6"></v-checkbox>
                          </template>
                          <template v-slot:item.val7="{ item }">
                            <v-checkbox v-model="item.val7"></v-checkbox>
                          </template>
                          <template v-slot:item.val8="{ item }">
                            <v-checkbox v-model="item.val8"></v-checkbox>
                          </template>
                          <template v-slot:item.val9="{ item }">
                            <v-checkbox v-model="item.val9"></v-checkbox>
                          </template>
                          <template v-slot:item.action="{ item }">
                            <v-tooltip top>
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                  v-bind="attrs"
                                  v-on="on"
                                  icon
                                  color="error"
                                  @click="deleteStep(item, proc)"
                                >
                                  <v-icon>mdi-trash-can-outline </v-icon>
                                </v-btn>
                              </template>
                              <span>
                                حذف
                              </span>
                            </v-tooltip>
                          </template>
                        </v-data-table>
                      </v-col>
                      <v-col cols="1" class="subtitle-2">
                        الملاحظات :
                      </v-col>
                      <v-col cols="11">
                        <span v-text="proc.remarks"></span>
                      </v-col>
                      <v-col cols="1" class="subtitle-2">
                        مدة التنفيذ :
                      </v-col>
                      <v-col cols="11">
                        <span v-text="proc.period"></span>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </template>
            </fieldset>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="12">
            <fieldset class="wc-fieldset">
              <legend>
                7 - مؤشرات القياس
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      icon
                      color="primary"
                      @click="createNewPointer"
                    >
                      <v-icon>
                        mdi-plus
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>
                    اضافة مؤشر
                  </span>
                </v-tooltip>
              </legend>
              <draggable
                dir="rtl"
                :list="selected.pointers"
                ghost-class="ghost"
                @change="reOrder(selected.pointers)"
              >
                <transition-group type="transition" :name="'flip-list'">
                  <template v-for="ptr in selected.pointers">
                    <v-row dense :key="ptr.id">
                      <v-col cols="11">
                        <span v-text="ptr.orderNo" /> -
                        <span v-text="ptr.name" />
                      </v-col>
                      <v-col cols="1">
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              v-bind="attrs"
                              v-on="on"
                              icon
                              color="primary"
                              @click="editPointer(ptr)"
                            >
                              <v-icon>mdi-square-edit-outline</v-icon>
                            </v-btn>
                          </template>
                          <span>
                            تحرير
                          </span>
                        </v-tooltip>
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              icon
                              v-bind="attrs"
                              v-on="on"
                              color="error"
                              @click="deletePinter(ptr)"
                            >
                              <v-icon> mdi-trash-can-outline</v-icon>
                            </v-btn>
                          </template>
                          <span>
                            حذف
                          </span>
                        </v-tooltip>
                      </v-col>
                    </v-row>
                  </template>
                </transition-group>
              </draggable>
            </fieldset>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="12">
            <fieldset class="wc-fieldset">
              <legend>
                قائمة السجلات
              </legend>
              <file-list
                :can-edit="false"
                :department="selected.department"
                @updateList="updateFileList"
              ></file-list>
            </fieldset>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-overlay v-model="saving">
          <v-progress-circular indeterminate size="32"></v-progress-circular>
        </v-overlay>
        <v-col cols="12">
          <v-btn
            color="info"
            :to="{
              name: 'WorkGuideAdminView',
              params: viewParam
            }"
          >
            عرض
            <v-icon> mdi-eye-outline </v-icon>
          </v-btn>
          <v-btn
            v-if="selected.status === 0 || selected.status === 15"
            class="me-2 float-left"
            color="warning"
            :loading="working"
            :disabled="saving || working"
            @click="sendWorkGuide"
          >
            إرسال
            <v-icon>
              mdi-send-outline
            </v-icon>
          </v-btn>
          <v-btn
            v-if="
              selected.status === 0 ||
                selected.status === 15 ||
                (hasFullDepartment && selected.status <= 30)
            "
            class="me-2 float-left"
            color="primary"
            :loading="saving"
            :disabled="saving || working"
            @click="save"
          >
            حفظ
            <v-icon>
              mdi-content-save
            </v-icon>
          </v-btn>
          <v-btn
            v-if="selected.status === 10 && false"
            class="me-2 float-left"
            color="green darken-4"
            :loading="saving"
            :disabled="saving"
            @click="approve(Constants.STATUS_MANAGER_APPROVAL)"
          >
            اعتماد
            <v-icon>
              mdi-send-check-outline
            </v-icon>
          </v-btn>
          <v-btn
            v-if="selected.status === 10 && false"
            class="me-2 float-left"
            color="orange darken-4"
            :loading="saving"
            :disabled="saving"
            @click="save"
          >
            رفض إعتماد
            <v-icon>
              mdi-send-check-outline
            </v-icon>
          </v-btn>

          <v-btn
            v-if="selected.status === 20 && false"
            class="me-2 float-left"
            color="green darken-4"
            :loading="saving"
            :disabled="saving"
            @click="save"
          >
            اعتماد نهائي
            <v-icon>
              mdi-stamper
            </v-icon>
          </v-btn>
        </v-col>
      </v-card-actions>
    </v-card>
    <v-dialog v-model="referenceDlg" width="50%">
      <v-card>
        <v-card-title> </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="2">
              <v-text-field
                type="number"
                label="الترتيب"
                v-model="selectedReference.orderNo"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                dense
                outlined
                label="المرجع"
                v-model="selectedReference.name"
                rows="3"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="saveReference()">
            حفظ
            <v-icon>
              mdi-content-save
            </v-icon>
          </v-btn>
          <v-btn dark color="error" @click="referenceDlg = false">
            إلغاء
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="definitionDlg" width="50%">
      <v-card>
        <v-card-title>
          المصطلحات والتعاريف
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="2">
              <v-text-field
                type="number"
                label="الترتيب"
                v-model="selectedDefinition.orderNo"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field
                dense
                outlined
                v-model="selectedDefinition.name"
                label="المصطلح / التعريف"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                dense
                outlined
                label="الشرح"
                v-model="selectedDefinition.description"
                rows="3"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="saveDefinition()">
            حفظ
            <v-icon>
              mdi-content-save
            </v-icon>
          </v-btn>
          <v-btn dark color="error" @click="definitionDlg = false">
            إلغاء
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="responsibilityDlg" width="75%">
      <v-card>
        <v-card-title> تحرير مسؤولية</v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="2">
              <v-text-field
                type="number"
                label="الترتيب"
                v-model="selectedResponsibility.orderNo"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-select
                :items="jobList"
                item-value="id"
                item-text="name"
                outlined
                dense
                clearable
                label="المسمى الوظيفي"
                return-object
                v-model="selectedResponsibility.job"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                outlined
                dense
                label="الوصف"
                v-model="selectedResponsibility.description"
                rows="4"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="saveResponsibility()">
            حفظ
            <v-icon>
              mdi-content-save
            </v-icon>
          </v-btn>
          <v-btn dark color="error" @click="responsibilityDlg = false">
            إلغاء
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="pointerDlg" width="50%">
      <v-card>
        <v-card-title>
          تحرير مؤشر
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <v-textarea
                dense
                outlined
                label="المؤشر"
                v-model="selectedPointer.name"
                rows="2"
              />
            </v-col>
            <v-col cols="2">
              <v-text-field
                type="number"
                label="الترتيب"
                v-model="selectedPointer.orderNo"
                dense
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="savePointer()">
            حفظ
            <v-icon>
              mdi-content-save
            </v-icon>
          </v-btn>
          <v-btn dark color="error" @click="pointerDlg = false">
            إلغاء
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="procedureDlg" width="60%">
      <v-card>
        <v-card-title>
          تحرير اجراء
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="2">
              <v-text-field
                type="number"
                dense
                label="رقم الاجراء"
                v-model="selectedProcedure.orderNo"
                outlined
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                dense
                label="الاجراء"
                v-model="selectedProcedure.description"
                outlined
              ></v-text-field>
            </v-col>
            <v-col cols="9">
              <v-text-field
                dense
                label="الفترة الزمنية"
                v-model="selectedProcedure.period"
                outlined
              ></v-text-field
            ></v-col>
            <v-col cols="12">
              <v-textarea
                dense
                label="الملاحظات"
                rows="3"
                v-model="selectedProcedure.remarks"
                outlined
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="saveProcedure()">
            حفظ
            <v-icon>
              mdi-content-save
            </v-icon>
          </v-btn>
          <v-btn dark color="error" @click="procedureDlg = false">
            إلغاء
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
          <v-btn color="primary" @click="updateFile">
            حفظ
            <v-icon>
              mdi-content-save
            </v-icon>
          </v-btn>
          <v-btn dark color="error" @click="fileEditDlg = false">
            إلغاء
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="fileListDlg" width="60%">
      <v-card>
        <v-card-title>
          السجلات والوثائق ذات العلاقة
        </v-card-title>
        <v-card-text>
          <v-row dense class="mb-2">
            <template v-for="doc in documents">
              <v-chip
                :key="doc.id"
                close
                close-icon="mdi-plus"
                color="primary"
                filter
                class="me-2"
                @click:close="addDocumentToProcedure(doc)"
              >
                {{ doc.name }}
              </v-chip>
            </template>
          </v-row>
          <v-divider></v-divider>
          <v-row dense v-show="false">
            <v-col cols="3">
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
            <v-col cols="2">
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
            <v-col cols="2">
              <v-file-input
                dense
                outlined
                v-model="fileData"
                :multiple="false"
                truncate-length="15"
              ></v-file-input>
            </v-col>
            <v-col cols="1">
              <v-btn icon color="primary" @click="addFile">
                <v-icon> mdi-cloud-upload</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <template v-for="file in files">
            <v-row dense align="center" :key="file.name">
              <v-col cols="3">
                <span class="procedure-title" v-text="file.name"></span>
              </v-col>
              <v-col>
                <span v-text="documentNumber + '/' + file.orderNo"></span>
              </v-col>
              <v-col cols="2">
                <span v-text="file.issueDate"></span>
              </v-col>
              <v-col cols="1">
                <span v-text="file.version"></span>
              </v-col>
              <v-col cols="2">
                <v-btn text color="primary" @click="addFileToProcedure(file)">
                  <v-icon>
                    mdi-file-plus
                  </v-icon>
                  إضافة
                </v-btn>
              </v-col>
            </v-row>
            <v-divider inset></v-divider>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-btn text color="error" @click="fileListDlg = false">
            إغلاق
            <v-icon>
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="approvalDlg" width="50%">
      <v-card>
        <v-card-title> </v-card-title>
        <v-card-text>
          <v-textarea
            rows="3"
            outlined
            dense
            label="التعليق والملاحظات"
            v-model="remarks"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary">
            موافق
          </v-btn>
          <v-btn dark color="error">
            إلغاء
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="procRespDlg" width="50%">
      <v-card>
        <v-card-title>
          تحرير مسؤوليات إجراء
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="2">
              <v-text-field
                outlined
                type="number"
                label="الترتيب"
                v-model="selectedProcResp.orderNo"
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                dense
                outlined
                label="المسؤولية"
                v-model="selectedProcResp.name"
              ></v-text-field>
            </v-col>
            <v-col cols="1">
              <v-btn icon color="primary" @click="saveProcResp">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <draggable
            dir="rtl"
            :list="selectedProcedure.responsibilities"
            ghost-class="ghost"
            @change="reOrder(selectedProcedure.responsibilities)"
          >
            <transition-group type="transition" :name="'flip-list'">
              <template v-for="resp in selectedProcedure.responsibilities">
                <v-row dense :key="resp.id">
                  <v-col cols="1">
                    <v-icon color="primary">
                      mdi-account-tie
                    </v-icon>
                  </v-col>
                  <v-col cols="10">
                    <span v-text="resp.name"></span>
                  </v-col>
                  <v-col cols="1">
                    <v-btn color="error" icon @click="deleteProcResp(resp)">
                      <v-icon>
                        mdi-trash-can
                      </v-icon>
                    </v-btn>
                  </v-col>
                  <v-divider inset></v-divider>
                </v-row>
              </template>
            </transition-group>
          </draggable>
        </v-card-text>
        <v-card-actions>
          <v-btn text color="error" @click="procRespDlg = false">
            إغلاق
            <v-icon>
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="docsDlg" width="50%" persistent>
      <v-card>
        <v-card-title>
          تحرير وثيقة نصية
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="10">
              <v-text-field
                outlined
                label="نص الوثيقة"
                dense
                v-model="docsName"
              ></v-text-field>
            </v-col>
            <v-col cols="1">
              <v-btn text color="primary" @click="addDocs">
                <v-icon>
                  mdi-plus
                </v-icon>
              </v-btn>
            </v-col>
            <v-col cols="1">
              <v-btn text color="error" @click="docsDlg = false">
                <v-icon>
                  mdi-close
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script src="./_workGuideEditor.js" lang="js"></script>
<style src="./_workGuideEditor.scss" lang="scss" scoped></style>
