// @vue/component
import WorkGuideService from '@/service/workGuide/WorkGuideService'
import AttachmentService from '@/service/attachment/AttachmentService'
import JobService from '@/service/jobs/JobService'
import { Paths } from '@/Paths'
import draggable from 'vuedraggable'
import FileList from '@/components/FileList'
import _ from 'lodash'
import Vue from 'vue'
import DocumentService from '@/service/documents/DocumentService'
import { mapState } from 'vuex'
export default {
  name: 'WorkGuideEditor',
  mounted() {
    if (this.departmentEncId !== '-1') {
      this.getOneByDepartment()
    } else if (this.objectId === '-1') {
      this.selected = Object.assign({}, this.emptyObject)
    } else {
      this.getOne()
    }
    JobService.listAll()
      .then(response => {
        this.jobList = response.data
      })
      .catch(error => {})
  },
  components: { draggable, FileList },

  mixins: [],

  props: {
    objectId: {
      type: String,
      default: '-1'
    },
    editType: {
      type: String,
      default: '10'
    },
    departmentEncId: {
      type: String,
      default: '-1'
    }
  },

  data() {
    return {
      docsDlg: false,
      docsName: '',
      procRespId: -1,
      procRespDlg: false,
      documents: [],
      selectedDepartmentId: this.departmentEncId,
      saving: false,
      working: false,
      loading: false,
      approvalDlg: false,
      nextStatus: -1,
      remarks: '',
      selected: {},
      emptyObject: {
        id: null,
        documentNo: '',
        issueDate: '',
        encId: '-1',
        objective: '',
        domain: '',
        version: 1,
        departmentId: -1,
        status: 0,
        type: 1,
        department: {},
        references: [],
        definitions: [],
        responsibilities: [],
        procedures: [],
        pointers: []
      },
      emptyReference: { id: null, name: '', orderNo: 0, encId: '-1' },
      selectedReference: {},
      referenceDlg: false,
      referenceId: -1,
      emptyDefinition: {
        id: null,
        name: '',
        description: '',
        orderNo: 0,
        encId: '-1'
      },
      selectedDefinition: {},
      definitionId: -1,
      definitionDlg: false,
      jobList: [],
      selectedResponsibility: {},
      emptyResponsibility: {
        id: null,
        description: '',
        job: { id: null, name: '' },
        jobId: null,
        orderNo: 0,
        encId: '-1'
      },
      responsibilityId: -1,
      responsibilityDlg: false,
      emptyProcResp: { id: null, name: '', orderNo: 0, encId: '-1' },
      selectedProcResp: {},
      selectedProcedure: {},
      emptyProcedure: {
        id: null,
        description: '',
        remarks: '',
        orderNo: '',
        period: '',
        encId: '-1',
        steps: [],
        responsibilities: []
      },
      procedureDlg: false,
      procedureId: -1,
      selectedStep: {},
      emptyStep: {
        id: null,
        description: '',
        remarks: '',
        orderNo: 0,
        val1: false,
        val2: false,
        val3: false,
        val4: false,
        val5: false,
        val6: false,
        val7: false,
        val8: false,
        val9: false,
        encId: '-1',
        proc: {},
        documentTypes: [],
        docs: []
      },
      stepDlg: false,
      fileData: {},
      emptyFile: {
        name: '',
        orderNo: '',
        version: 1,
        issueDate: '',
        departmentId: -1
      },
      selectedFile: {},
      fileEditDlg: false,
      files: [],
      fileListDlg: false,
      fileSeq: 0,
      pointerDlg: false,
      emptyPointer: { id: null, name: '', orderNo: 0, encId: '-1' },
      selectedPointer: {},
      pointerId: -1,
      issueDateMenu: false,
      fileIssueDateMenu: false
    }
  },

  computed: {
    viewParam: function() {
      return {
        encId: this.objectId,
        viewType: '1'
      }
    },
    Constants: function() {
      return Vue.Constants
    },
    documentNumber: function() {
      if (this.selected.department && this.selected.department.departmentNo) {
        return (
          'AHM-OP-' +
          this.$options.filters.twoDigit(this.selected.department.departmentNo)
        )
      } else {
        return ''
      }
    },
    hasFullDepartment: function() {
      let ha = false
      try {
        this.employee.roles.forEach(item => {
          if (
            item === 'ROLE_QUALITY' ||
            item === 'ROLE_QUALITY_USER' ||
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
            width: '5%'
            // class: 'header-procedure-responsibility'
          })
        })
      }
      arr.push({
        text: 'الملاحظات',
        value: 'remarks',
        align: 'center',
        sortable: false,
        filterable: true,
        width: '15%'
      })
      arr.push({
        text: 'الوثائق ذات العلاقة',
        value: 'files',
        align: 'center',
        sortable: false,
        filterable: false,
        width: '20%'
      })
      arr.push({
        text: '...',
        value: 'action',
        align: 'center',
        sortable: false,
        filterable: false,
        width: '5%'
      })

      return arr
    },
    procedureHeader1: function() {
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
      return arr
    },
    procedureHeader2: function() {
      let arr = []
      arr.push({
        text: 'الملاحظات',
        value: 'remarks',
        align: 'center',
        sortable: false,
        filterable: true,
        width: '15%'
      })
      arr.push({
        text: 'الوثائق ذات العلاقة',
        value: 'files',
        align: 'center',
        sortable: false,
        filterable: false,
        width: '20%'
      })
      arr.push({
        text: '...',
        value: 'action',
        align: 'center',
        sortable: false,
        filterable: false,
        width: '5%'
      })

      return arr
    },
    ...mapState('auth', ['employee'])
  },

  watch: {},

  created() {
    document.title = this.$route.meta.title
    DocumentService.listActive().then(res => {
      this.documents = res.data
    })
  },

  methods: {
    createDocs(step) {
      this.selectedStep = step
      this.docsName = ''
      this.docsDlg = true
    },
    addDocs() {
      if (this.docsName.trim().length > 0) {
        this.selectedStep.docs.push(this.docsName)
        this.docsDlg = false
      }
    },
    removeDocFromStep(doc, step) {
      let idx = step.docs.indexOf(doc)
      step.docs.splice(idx, 1)
    },
    procedureHeader(proc) {
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
      if (proc.responsibilities) {
        let x = 1
        proc.responsibilities.forEach(resp => {
          arr.push({
            text: resp.name,
            value: 'val' + x++,
            align: 'center',
            sortable: false,
            filterable: true,
            width: '5%'
            // class: 'header-procedure-responsibility'
          })
        })
      }
      arr.push({
        text: 'الملاحظات',
        value: 'remarks',
        align: 'center',
        sortable: false,
        filterable: true,
        width: '15%'
      })
      arr.push({
        text: 'الوثائق ذات العلاقة',
        value: 'files',
        align: 'center',
        sortable: false,
        filterable: false,
        width: '20%'
      })
      arr.push({
        text: '...',
        value: 'action',
        align: 'center',
        sortable: false,
        filterable: false,
        width: '5%'
      })

      return arr
    },
    save() {
      this.saving = true
      WorkGuideService.save(this.selected)
        .then(response => {
          this.saving = false
          this.selected = Object.assign({}, response.data)
          this.$toast.success('تم الحفظ بنجاح')
        })
        .catch(error => {
          this.saving = false
          this.$toast.error('هناك خطأ في عملية الحفظ')
        })
    },
    sendWorkGuide() {
      this.$confirm('هل تريد ارسال هذه النسخة؟').then(res => {
        if (res) {
          this.updateStatus(10)
        }
      })
    },
    approve(newStatus) {
      alert(newStatus)
      this.nextStatus = newStatus
      this.remarks = ''
      this.approvalDlg = true
    },
    updateStatus(newType) {
      this.working = true
      WorkGuideService.updateStatus(this.selected.encId, newType)
        .then(response => {
          this.getOne()
          this.saving = false
          this.$toast.success('تم الارسال بنجاح')
        })
        .catch(error => {
          this.getOne()
          this.saving = false
          this.$toast.error('خطأ في عملية الارسال')
        })
    },
    getOne() {
      this.loading = true
      WorkGuideService.getOne(this.objectId)
        .then(response => {
          this.selected = response.data
          this.selectedDepartmentId = this.selected.department.encId
          this.loadFileList()
          this.loading = false
        })
        .catch(error => {
          this.loading = false
        })
    },
    getOneByDepartment() {
      this.loading = true
      WorkGuideService.getByDepartmentEdit(this.departmentEncId, this.editType)
        .then(response => {
          this.selected = response.data
          this.loadFileList()
          this.loading = false
        })
        .catch(error => {
          this.loading = false
        })
    },
    loadFileList() {
      AttachmentService.listApproved(this.selectedDepartmentId)
        .then(response => {
          this.files = response.data
        })
        .catch(error => {})
    },
    updateFileList() {
      this.loadFileList()
    },
    saveReference() {
      let idx = this.selected.references.findIndex(
        item => this.selectedReference.id === item.id
      )
      if (idx >= 0) {
        this.selected.references[idx] = Object.assign(
          {},
          this.selectedReference
        )
      } else {
        this.selected.references.push(this.selectedReference)
      }
      this.referenceDlg = false
    },
    editReference(rfc) {
      this.selectedReference = Object.assign({}, rfc)
      this.referenceDlg = true
    },
    deleteReference(rfc) {
      let idx = this.selected.references.indexOf(rfc)
      this.selected.references.splice(idx, 1)
    },
    createNewReference() {
      this.selectedReference = Object.assign({}, this.emptyReference)
      this.selectedReference.orderNo = this.selected.references
        ? this.selected.references.length + 1
        : 1
      this.selectedReference.id = this.referenceId--
      this.referenceDlg = true
    },
    saveDefinition() {
      let idx = this.selected.definitions.findIndex(
        item => this.selectedDefinition.id === item.id
      )
      if (idx >= 0) {
        this.selected.definitions[idx] = Object.assign(
          {},
          this.selectedDefinition
        )
      } else {
        this.selected.definitions.push(this.selectedDefinition)
      }
      this.definitionDlg = false
    },
    editDefinition(def) {
      this.selectedDefinition = Object.assign({}, def)
      this.definitionDlg = true
    },
    deleteDefinition(def) {
      let idx = this.selected.definitions.indexOf(def)
      this.selected.definitions.splice(idx, 1)
    },
    createNewDefinition() {
      debugger
      this.selectedDefinition = Object.assign({}, this.emptyDefinition)
      this.selectedDefinition.orderNo = this.selected.definitions
        ? this.selected.definitions.length + 1
        : 1
      this.selectedDefinition.id = this.definitionId--
      this.definitionDlg = true
    },
    saveResponsibility() {
      this.selectedResponsibility.jobId = this.selectedResponsibility.job.id
      let idx = this.selected.responsibilities.findIndex(
        item => this.selectedResponsibility.id === item.id
      )
      if (idx >= 0) {
        this.selected.responsibilities[idx] = Object.assign(
          {},
          this.selectedResponsibility
        )
      } else {
        this.selected.responsibilities.push(this.selectedResponsibility)
      }
      this.responsibilityDlg = false
    },
    editResponsibility(resp) {
      this.selectedResponsibility = Object.assign({}, resp)
      this.responsibilityDlg = true
    },
    deleteResponsibility(def) {
      let idx = this.selected.responsibilities.indexOf(def)
      this.selected.responsibilities.splice(idx, 1)
    },
    createNewResponsibility() {
      this.selectedResponsibility = Object.assign({}, this.emptyResponsibility)
      this.selectedResponsibility.id = this.responsibilityId--
      this.selectedResponsibility.orderNo = this.selected.responsibilities
        ? this.selected.responsibilities.length + 1
        : 1
      this.responsibilityDlg = true
    },
    createNewProcedure() {
      this.selectedProcedure = _.cloneDeep(this.emptyProcedure)
      this.selectedProcedure.steps = []
      this.selectedProcedure.id = this.procedureId--
      if (this.selected.procedures.length > 0) {
        this.selectedProcedure.orderNo =
          Number(
            _.max(
              this.selected.procedures.map(item => {
                return item.orderNo
              })
            )
          ) + 1
      } else {
        this.selectedProcedure.orderNo = 1
      }
      this.procedureDlg = true
    },
    saveProcedure() {
      let idx = this.selected.procedures.findIndex(
        item => this.selectedProcedure.id === item.id
      )
      if (idx >= 0) {
        this.selected.procedures[idx] = Object.assign(
          {},
          this.selectedProcedure
        )
      } else {
        this.selected.procedures.push(this.selectedProcedure)
      }
      this.procedureDlg = false
    },
    editProcedure(proc) {
      this.selectedProcedure = Object.assign({}, proc)
      this.procedureDlg = true
    },
    deleteProcedure(proc) {
      let idx = this.selected.procedures.indexOf(proc)
      this.selected.procedures.splice(idx, 1)
    },
    createNewStep(proc) {
      if (proc.steps == null) proc.steps = []
      this.selectedStep = _.cloneDeep(this.emptyStep)
      this.selectedStep.orderNo = proc.steps.length + 1
      proc.steps.push(this.selectedStep)
    },
    deleteStep(step, proc) {
      let idx = proc.steps.indexOf(step)
      proc.steps.splice(idx, 1)
    },
    addFile() {
      this.selectedFile.departmentId = this.selected.department.id
      AttachmentService.save(this.selectedFile, this.fileData)
        .then(response => {
          this.files.push(response.data)
        })
        .catch(error => {})
    },
    deleteFile(file) {
      let idx = this.selected.files.indexOf(file)
      this.selected.files.splice(idx, 1)
    },
    removeFile(file) {
      let idx = this.selected.fileList.indexOf(file)
      this.selected.fileList.splice(idx, 1)
    },
    addFileToProcedure(file) {
      if (this.selectedStep.files == null) {
        this.selectedStep.files = []
      }
      let idx = this.selectedStep.files.filter(fl => fl.id === file.id).length
      if (idx > 0) return
      this.selectedStep.files.push(file)
    },
    addDocumentToProcedure(doc) {
      if (this.selectedStep.documentTypes == null) {
        this.selectedStep.documentTypes = []
      }
      debugger
      let idx = this.selectedStep.documentTypes.filter(dc => dc.id === doc.id)
        .length
      if (idx > 0) return
      this.selectedStep.documentTypes.push(doc)
    },
    removeFileFromStep(file, step) {
      let idx = step.files.indexOf(file)
      step.files.splice(idx, 1)
    },
    removeDocumentFromStep(doc, step) {
      let idx = step.documentTypes.indexOf(doc)
      step.documentTypes.splice(idx, 1)
    },
    addTempFileToProcedure(file, step) {
      if (step.fileList == null) {
        step.fileList = []
      }
      step.fileList.push(file)
    },
    savePointer() {
      let idx = this.selected.pointers.findIndex(
        item => this.selectedPointer.id === item.id
      )
      if (idx >= 0) {
        this.selected.pointers[idx] = Object.assign({}, this.selectedPointer)
      } else {
        this.selected.pointers.push(this.selectedPointer)
      }
      this.pointerDlg = false
    },
    manageProsResp(proc) {
      this.selectedProcedure = proc
      this.creatNewProcResp()
      this.procRespDlg = true
    },
    creatNewProcResp() {
      this.selectedProcResp = Object.assign({}, this.emptyProcResp)
      this.selectedProcResp.orderNo = this.selectedProcedure.responsibilities
        ? this.selectedProcedure.responsibilities.length + 1
        : 1
      this.selectedProcResp.id = this.procRespId--
    },
    saveProcResp() {
      let idx = this.selectedProcedure.responsibilities.findIndex(
        item => this.selectedProcResp.id === item.id
      )
      if (idx >= 0) {
        this.selectedProcedure.responsibilities[idx] = Object.assign(
          {},
          this.selectedProcResp
        )
      } else {
        this.selectedProcedure.responsibilities.push(this.selectedProcResp)
      }
      this.creatNewProcResp()
    },
    deleteProcResp(resp) {
      let idx = this.selectedProcedure.responsibilities.indexOf(resp)
      this.selectedProcedure.responsibilities.splice(idx, 1)
    },
    createNewPointer() {
      this.selectedPointer = Object.assign({}, this.emptyPointer)
      this.selectedPointer.orderNo = this.selected.pointers
        ? this.selected.pointers.length + 1
        : 1
      this.selectedPointer.id = this.pointerId--
      this.pointerDlg = true
    },
    editPointer(ptr) {
      this.selectedPointer = Object.assign({}, ptr)
      this.pointerDlg = true
    },
    deletePinter(ptr) {
      let idx = this.selected.pointers.indexOf(ptr)
      this.selected.pointers.splice(idx, 1)
    },
    reOrder(lst) {
      lst.forEach((item, idx) => {
        item.orderNo = idx + 1
      })
    },
    showFilesDlg(step) {
      this.selectedStep = step
      this.fileListDlg = true
    },
    showEditFileDialog(file) {
      this.selectedFile = Object.assign({}, file)
      this.fileEditDlg = true
    },
    updateFile() {
      AttachmentService.update(this.selectedFile)
        .then(response => {})
        .catch(error => {})
    }
  }
}
