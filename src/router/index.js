import Vue from 'vue'
import store from '@/store/index'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import AdminHome from '../views/AdminHome'
import Option from '../views/admin/Option'
import Login from '@/views/Login'
import Job from '@/views/admin/job/Job'
import Department from '@/views/admin/department/Department'
import Employee from '@/views/admin/employee/Employee'
import WorkGuideEditor from '@/views/admin/workGuide/workGuideEditor/WorkGuideEditor'
import Permission from '@/views/admin/permission/Permission'
import WorkGuideAdmin from '@/views/admin/workGuide/WorkGuideAdmin'
import WorkGuideAdminView from '@/views/admin/workGuide/WorkGuideAdminView'
import WorkGuide from '@/components/WorkGuide'
import Landing from '@/components/Landing'
import AdminLanding from '@/components/AdminLanding'
import FilesManager from '@/views/admin/workGuide/FilesManager'
import AuditPlan from '@/views/admin/audit/AuditPlan'
import CheckListEditor from '@/views/admin/audit/CheckListEditor'

Vue.use(VueRouter)

const routes = [
  {
    path: '/admin',
    name: 'Admin',
    component: AdminHome,
    children: [
      {
        path: '/admin/',
        name: 'AdminLanding',
        component: AdminLanding
      },
      {
        path: '/admin/option',
        name: 'Option',
        component: Option
      },
      {
        path: '/admin/workGuideAdmin',
        name: 'WorkGuideAdmin',
        component: WorkGuideAdmin
      },
      {
        path: '/admin/filesManager',
        name: 'FilesManager',
        component: FilesManager
      },
      {
        path: '/admin/workGuideAdmin/edit/:departmentEncId/:editType',
        name: 'WorkGuideAdminEdit',
        props: true,
        component: WorkGuideEditor
      },
      {
        path: '/admin/workGuideAdmin/view/:encId/:viewType',
        name: 'WorkGuideAdminView',
        props: true,
        component: WorkGuideAdminView
      },
      {
        path: '/admin/job',
        name: 'Job',
        component: Job
      },
      {
        path: '/admin/department',
        name: 'Department',
        component: Department
      },
      {
        path: '/admin/permission',
        name: 'Permission',
        component: Permission
      },
      {
        path: '/admin/employee',
        name: 'Employee',
        component: Employee
      },
      {
        path: '/admin/auditPlan',
        name: 'AuditPlan',
        component: AuditPlan
      },
      {
        path: '/admin/checkList/:auditPlanEncId',
        name: 'CheckListEditor',
        props: true,
        component: CheckListEditor
      },
      {
        path: '/admin/workGuideEditor/:objectId',
        name: 'WorkGuideEditor',
        props: true,
        component: WorkGuideEditor
      },
      {
        path: '/admin/WorkGuideEditorDept/:departmentEncId/:editType',
        name: 'WorkGuideEditorDept',
        props: true,
        component: WorkGuideEditor
      }
    ]
  },
  {
    path: '/',
    component: Home,
    children: [
      {
        path: '/',
        name: 'Landing',
        props: true,
        component: Landing
      },
      {
        path: '/view/:departmentId',
        name: 'View',
        props: true,
        component: WorkGuide
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
router.beforeEach((to, from, next) => {
  if (
    to.name === 'Home' ||
    to.name === 'Landing' ||
    to.name === 'View' ||
    to.name === 'About' ||
    to.name === '403' ||
    to.name === '401' ||
    to.name === '404' ||
    to.name === '503' ||
    to.name === 'Login'
  ) {
    next()
  } else if (
    store.state.auth.employee &&
    store.state.auth.employee.id > 0 &&
    store.state.auth.employee.exp * 1000 > new Date()
  ) {
    next()
  } else {
    router.push({ name: 'Login' })
  }
})

export default router
