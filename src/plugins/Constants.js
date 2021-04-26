const STATUS_NEW = 0
const STATUS_SUBMITTED = 10
const STATUS_MANAGER_REJECTED = 15
const STATUS_MANAGER_APPROVAL = 20
const STATUS_QUALITY_REJECTED = 25
const STATUS_QUALITY_APPROVAL = 30
const STATUS_FINAL_APPROVAL = 40
// plugins/Constants.js
let Constants = {
  //  install
  install(Vue, options) {
    //  create global Constants
    Vue.Constants = {
      STATUS_NEW,
      STATUS_SUBMITTED,
      STATUS_MANAGER_REJECTED,
      STATUS_MANAGER_APPROVAL,
      STATUS_QUALITY_REJECTED,
      STATUS_QUALITY_APPROVAL,
      STATUS_FINAL_APPROVAL
    }
  }
}

export default Constants
