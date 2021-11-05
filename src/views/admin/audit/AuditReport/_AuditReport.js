// @vue/component
import _ from 'lodash'
import moment from 'moment'
import AuditReportService from '@/service/audit/AuditReportService'
import DepartmentService from '@/service/department/DepartmentService'
import EmployeeService from '@/service/employee/EmployeeService'
import { mapState } from 'vuex'
import AuditPlanView from '@/components/AuditPlanView'
import AuditPlanService from '@/service/audit/AuditPlanService'
import DataTableResponse from '@/model/response/DataTableResponse'
import DataTableRequest from '@/model/request/DataTableRequest'

export default {
  name: 'Auditreport',

  components: { AuditPlanView },

  mixins: [],

  props: {
    encId: {
      type: String,
      default: '-1'
    }
  },

  data() {
    return {
      currentNext: 0,
      remarks: '',
      msgDlg: false,
      correctionHeader: [
        {
          text: 'مسلسل',
          value: 'sn',
          align: 'center',
          sortable: false,
          width: '5%'
        },
        {
          text: 'وصف الحالة',
          value: 'description',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '30%'
        },
        {
          text: 'الموظف',
          value: 'descEmployee',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '20%'
        },
        {
          text: 'التاريخ',
          value: 'descDate',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '10%'
        },
        {
          text: 'الاغلاق',
          value: 'status',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '10%'
        },
        {
          text: 'الاعتماد',
          value: 'approved',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '10%'
        }
      ],
      correctionStatus: ['جديد', 'تم التنفيذ', 'لم يتم التفيذ'],
      approvedStatus: ['جديد', 'تم الاعتماد', 'تم الرفض'],
      loadingCorrectionTab: false,
      tableResponse: new DataTableResponse(0, 0, 10),
      dataTableRequest: new DataTableRequest(0, 10),
      dataTableOptions: { page: 1, itemsPerPage: 10 },
      viewDialog: false,
      auditPlaneView: {},
      employeeList: [],
      status: [],
      empHeaderView: [
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
      ],
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
          width: '55%'
        },
        {
          text: '#',
          value: 'action',
          align: 'center',
          sortable: false,
          width: '10%'
        }
      ],
      auditPlanHeader: [
        {
          text: 'مسلسل',
          value: 'sn',
          align: 'center',
          sortable: false,
          width: '5%'
        },
        {
          text: 'الوحدة الادارة',
          value: 'department.name',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '40%'
        },
        {
          text: 'تاريخ البدء',
          value: 'fromDate',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '15%'
        },
        {
          text: 'تاريخ النهاية',
          value: 'toDate',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '15%'
        },
        {
          text: 'الحالة',
          value: 'status',
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
          width: '15%'
        }
      ],
      empText: '',
      selectedEmployee: {},
      isLoading: false,
      emps: [],
      fromDateD: false,
      toDateD: false,
      departments: [],
      showDialog: false,
      selectedAuditPlan: {},
      emptyAuditPlan: {
        id: -1,
        department: { id: -1, name: '' },
        departmentId: -1,
        status: 0,
        fromDate: '',
        toDate: '',
        auditors: [],
        encId: '-1'
      },
      years: [],
      loading: true,
      saving: false,
      tabs: null,
      AuditTypeData: [],
      selectedReport: {},
      selectedPoint: {},
      emptyReport: {
        id: -1,
        encId: '-1',
        yearId: moment().year(),
        title: '',
        points: [],
        domain: '',
        reportNo: 1,
        auditType: 0,
        approvedEmpId: null,
        approvedDate: moment().format('yyyy-MM-DD'),
        approvedEmployee: null,
        remarks: '',
        status: 0,
        auditPlans: []
      },
      emptyPoint: { id: -1, description: '', pointType: 0, orderNo: 1 },
      pointHeaders: [
        {
          text: 'مسلسل',
          value: 'orderNo',
          align: 'center',
          sortable: false,
          width: '10%'
        },
        {
          text: 'النقطة',
          value: 'description',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '80%'
        },
        {
          text: '#',
          value: 'action',
          align: 'center',
          sortable: true,
          filterable: true,
          width: '10%'
        }
      ]
    }
  },

  computed: {
    team: function() {
      let lst = []
      if (this.selectedReport && this.selectedReport.auditPlans) {
        this.selectedReport.auditPlans.forEach(a => {
          a.auditors.forEach(emp => {
            if (lst.filter(e => e.id === emp.id).length === 0) lst.push(emp)
          })
        })
      }
      return lst
    },
    strengthPoints: function() {
      return this.selectedReport.points.filter(item => item.pointType === 1)
    },
    weaknessPoints: function() {
      return this.selectedReport.points.filter(item => item.pointType === 2)
    },
    canEdit: function() {
      let ha = false
      try {
        this.employee.roles.forEach(item => {
          if (
            this.selectedReport.status <= 10 &&
            (item === 'ROLE_QUALITY_USER' ||
              item === 'ROLE_QUALITY' ||
              item === 'ROLE_ADMIN')
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
            this.canEdit ||
            item === 'ROLE_MANAGER' ||
            item === 'ROLE_QUALITY_USER'
          ) {
            ha = true
          }
        })
      } catch (e) {
        return false
      }
      return ha
    },
    hasApproveAccess: function() {
      let ha = false
      try {
        this.employee.roles.forEach(item => {
          if (item === 'ROLE_ADMIN' || item === 'ROLE_QUALITY') {
            ha = true
          }
        })
      } catch (e) {
        return false
      }
      return ha
    },
    hasFinalApproveAccess: function() {
      let ha = false
      try {
        this.employee.roles.forEach(item => {
          if (this.canEdit || item === 'ROLE_MANAGER') {
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
  watch: {
    empText(newValue, oldValue) {
      if (newValue != null && newValue.length >= 2) {
        this.searchEmployee()
      }
    }
  },

  mounted() {
    if (this.encId === '-1') {
      this.selectedReport = Object.assign({}, this.emptyReport)
      this.loading = false
    } else {
      this.loadOne()
    }
    DepartmentService.listDepartments()
      .then(response => {
        this.departments = response.data
      })
      .then(error => {})
  },
  created() {
    this.AuditTypeData.push({ id: 1, name: 'وفق الخطة السنوية' })
    this.AuditTypeData.push({ id: 2, name: 'تعديلات في النظام' })
    this.AuditTypeData.push({ id: 4, name: 'تعديلات في الهيكل التنظيمي' })
    this.selectedPoint = Object.assign({}, this.emptyPoint)
    for (let y = 2021; y < moment().year() + 2; y++) {
      this.years.push({ id: y, name: y })
    }
    this.status[0] = 'جديد'
    this.status[1] = 'إرجاع'
    this.status[10] = 'معتمد'
    this.status[11] = 'ارجاع نتائج'
    this.status[20] = 'معتمد نهائي'
    document.title = this.$route.meta.title
  },

  methods: {
    loadOne() {
      this.loading = true
      AuditReportService.getOne(this.encId)
        .then(res => {
          this.selectedReport = res.data
          this.loading = false
        })
        .catch(error => {
          this.loading = false
        })
    },
    send(next) {
      let msg = ''
      switch (next) {
        case 20:
          msg = 'هل تود الارسال للإعتماد'
          break
        case 10:
          msg = 'هل تود ارجاع التقرير'
          break
        case 30:
          msg = 'هل تود اعتماد التقرير'
      }
      this.$confirm(msg).then(res => {
        if (res) {
          this.currentNext = next
          this.remarks = ''
          this.msgDlg = true
        }
      })
    },
    saveSend() {
      this.loading = true
      AuditReportService.updateStatus(
        this.selectedReport.encId,
        this.currentNext,
        this.remarks
      )
        .then(res => {
          if (res.data.success) {
            this.$toast.success('تمت العملية بنجاح')
            this.loadOne()
          }
          this.msgDlg = false
          this.loading = false
        })
        .catch(err => {
          if (err.response.data.id) {
            this.$toast.error(
              'خطأ في العلية' + ' رقم الخطأ ' + err.response.data.id
            )
          } else {
            this.$toast.error('خطأ في العلية')
          }
          this.msgDlg = false
          this.loading = false
        })
    },
    listCorrectionByAudit() {
      this.loadingCorrectionTab = true
      this.dataTableRequest.currentPage = this.dataTableOptions.page - 1
      this.dataTableRequest.pageSize = this.dataTableOptions.itemsPerPage
      if (
        this.dataTableOptions.sortBy &&
        this.dataTableOptions.sortBy.length > 0
      ) {
        this.dataTableRequest.sortBy = this.dataTableOptions.sortBy[0]
      } else {
        this.dataTableRequest.sortBy = ''
      }
      if (
        this.dataTableOptions.sortDesc &&
        this.dataTableOptions.sortDesc.length > 0
      ) {
        this.dataTableRequest.sortDesc = this.dataTableOptions.sortDesc[0]
      } else {
        this.dataTableRequest.sortDesc = false
      }
      this.dataTableRequest.data.data = {
        reportId: this.selectedReport.id
      }
      AuditPlanService.listCorrectionByReport(this.dataTableRequest)
        .then(response => {
          this.tableResponse = response.data
          this.loadingCorrectionTab = false
        })
        .catch(error => {
          this.loadingCorrectionTab = false
        })
    },
    viewAuditPlan(item) {
      this.auditPlaneView = _.cloneDeep(item)
      console.log(this.auditPlaneView)
      this.viewDialog = true
    },
    listEmployees() {
      if (this.selectedReport.encId !== -1) {
        AuditReportService.listEmployees(this.selectedReport)
          .then(res => {
            this.employeeList = res.data
          })
          .catch(error => {})
      }
    },
    updateTab() {
      if (this.tabs === 'tab_team') {
        this.listEmployees()
      } else if (this.tabs === 'tab_correction') {
        this.listCorrectionByAudit()
      }
    },
    updateAuditPlan() {
      debugger
      this.selectedAuditPlan.departmentId = this.selectedAuditPlan.department.id
      if (this.selectedAuditPlan.encId !== '-1') {
        let idx = _.findIndex(this.selectedReport.auditPlans, o => {
          return o.id === this.selectedAuditPlan.id
        })
        if (idx >= 0) {
          this.selectedReport.auditPlans.splice(
            idx,
            1,
            _.cloneDeep(this.selectedAuditPlan)
          )
        }
      }
      this.showDialog = false
    },
    addAuditPlan() {
      this.selectedAuditPlan.departmentId = this.selectedAuditPlan.department.id
      this.selectedReport.auditPlans.push(this.selectedAuditPlan)
    },
    deleteAuditPlan(item) {
      debugger
      if (item.encId !== '-1') {
        let idx = _.findIndex(this.selectedReport.auditPlans, o => {
          return o.id === item.id
        })
        if (idx >= 0) {
          this.selectedReport.auditPlans.splice(idx, 1)
        }
      } else {
        this.selectedReport.auditPlans.splice(
          this.selectedReport.auditPlans.indexOf(item),
          1
        )
      }
    },
    editAuditPlan(item) {
      this.showDialog = true
      if (item.encId === '-1') {
        this.selectedAuditPlan = item
      } else {
        this.selectedAuditPlan = _.cloneDeep(item)
      }
    },
    creatNewAuditPlan() {
      this.showDialog = true
      this.selectedAuditPlan = Object.assign({}, this.emptyAuditPlan)
    },
    addEmployee() {
      if (this.selectedAuditPlan.auditors.indexOf(this.selectedEmployee) < 0) {
        this.selectedAuditPlan.auditors.push(this.selectedEmployee)
      }
    },
    deleteEmployee(item) {
      debugger
      let idx = _.findIndex(this.selectedAuditPlan.auditors, o => {
        return o.id === item.id
      })
      this.selectedAuditPlan.auditors.splice(idx, 1)
    },

    searchEmployee() {
      this.empDataSearch = []
      this.empDataSearch.push({ key: 'full_name', value: this.empText })
      this.empDataSearch.push({ key: 'emp_no', value: this.empText })
      this.isLoading = true
      EmployeeService.findEmployee(this.empDataSearch)
        .then(response => {
          this.emps = response.data
          this.isLoading = false
        })
        .catch(error => {
          this.isLoading = false
        })
    },
    save() {
      this.saving = true
      this.orderPoint()
      AuditReportService.save(this.selectedReport)
        .then(res => {
          this.selectedReport = res.data
          this.saving = false
          this.$toast.success('تم الحفظ بنجاح')
          this.$router.replace({
            name: 'AuditReportEdit',
            params: { encId: this.selectedReport.encId }
          })
        })
        .catch(error => {
          this.saving = false
          if (error.response.data.id) {
            this.$toast.error(
              'حدث خطا أثناء عملية الحفظ, رقم الخطأ ' + error.response.data.id
            )
          } else {
            this.$toast.error('حدث خطا أثناء عملية الحفظ ')
          }
        })
    },
    addPoint(typ) {
      this.selectedPoint.pointType = typ
      this.selectedReport.points.push(this.selectedPoint)
      this.selectedPoint = Object.assign({}, this.emptyPoint)
    },
    deletePoint(point) {
      this.selectedReport.points.splice(
        this.selectedReport.points.indexOf(point),
        1
      )
    },
    printBitWise() {
      console.log(this.selectedReport.auditType)
    },
    orderPoint() {
      let strengthCount = 1
      let weaknessCount = 1
      for (let i = 0; i < this.selectedReport.points.length; i++) {
        if (this.selectedReport.points[i].pointType === 1) {
          this.selectedReport.points[i].orderNo = strengthCount++
        } else {
          this.selectedReport.points[i].orderNo = weaknessCount++
        }
      }
    }
  }
}
